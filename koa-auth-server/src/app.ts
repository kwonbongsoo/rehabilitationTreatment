import cors from '@koa/cors';
import dotenv from 'dotenv';
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { errorMiddleware } from './middlewares/errorMiddleware';
import { requestLogger } from './middlewares/logger';
import { createAuthRouter } from './routes/authRoutes';
dotenv.config();

// 메트릭 시스템 import
const metricsPath = '/app/monitoring/koa-metrics.js';
let metricsModule: any = null;

// 메트릭 시스템 동적 로딩
async function loadMetrics() {
  try {
    if (process.env.METRICS_ENABLED === 'true') {
      metricsModule = require(metricsPath);
      console.log('Auth Server metrics system loaded successfully');
      return metricsModule;
    } else {
      console.log('Auth Server metrics disabled by METRICS_ENABLED flag');
      return null;
    }
  } catch (error) {
    console.warn(
      'Failed to load metrics in Auth Server:',
      error instanceof Error ? error.message : error,
    );
    console.log('Auth Server continues without metrics');
    return null;
  }
}

/**
 * 환경 변수 검증
 */
function validateConfig(): void {
  const requiredEnvVars = ['JWT_SECRET', 'REDIS_URL'];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}

/**
 * Koa 애플리케이션 생성 및 설정
 */
export async function createApp(): Promise<Koa> {
  const app = new Koa();

  // 환경변수 검증
  validateConfig();

  // 메트릭 시스템 로드 및 등록
  const metrics = await loadMetrics();
  if (metrics && metrics.createMetricsMiddleware) {
    app.use(metrics.createMetricsMiddleware('auth-server'));
    console.log('📊 Auth Server metrics middleware registered');
  }

  // 글로벌 에러 핸들러
  app.use(errorMiddleware);

  // 요청 로거 미들웨어
  app.use(requestLogger);

  // 기본 미들웨어 - bodyParser 설정 개선
  app.use(
    bodyParser({
      enableTypes: ['json', 'form'],
      jsonLimit: '1mb',
      formLimit: '1mb',
      textLimit: '1mb',
      // JSON 파싱 실패 시 빈 객체로 처리
      onerror: (err, ctx) => {
        console.error('Body parsing error:', err.message);
        ctx.request.body = {};
        // Consider throwing specific errors for client feedback
      },
    }),
  );

  app.use(
    cors({
      credentials: true,
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowHeaders: ['Authorization', 'Content-Type'],
    }),
  );

  try {
    // 라우터 생성 및 등록
    const authRouter = createAuthRouter();
    app.use(authRouter.routes());
    app.use(authRouter.allowedMethods());

    // 메트릭 라우트 등록 (health endpoint 제외하고 metrics만)
    if (metrics && metrics.register) {
      const metricsRouter = new Router();
      // 오직 /metrics 엔드포인트만 등록
      metricsRouter.get('/metrics', async (ctx: any) => {
        ctx.type = 'text/plain';
        ctx.body = await metrics.register.metrics();
      });
      app.use(metricsRouter.routes());
      app.use(metricsRouter.allowedMethods());
      console.log('📊 Auth Server metrics endpoint registered');
    }
  } catch (error) {
    console.error('Router setup error:', error);
    throw new Error(`라우터를 설정할 수 없습니다: ${error instanceof Error ? error.message : error}`);
  }

  // 404 핸들러
  app.use(async (ctx) => {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: 'Endpoint not found',
    };
  });

  return app;
}
