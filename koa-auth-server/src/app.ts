import cors from '@koa/cors';
import dotenv from 'dotenv';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { errorMiddleware } from './middlewares/errorMiddleware';
import { requestLogger } from './middlewares/logger';
import { createAuthRouter } from './routes/authRoutes';
dotenv.config();

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
export function createApp(): Koa {
  const app = new Koa();

  // 환경변수 검증
  validateConfig();

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
        ctx.request.body = {};
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
  } catch (error) {
    throw new Error('라우터를 설정할 수 없습니다');
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
