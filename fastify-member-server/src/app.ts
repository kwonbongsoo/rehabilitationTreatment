import dotenv from 'dotenv';
dotenv.config();

import fastify, { FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import diContainer from './plugins/diContainer';
import memberRoutes from './routes/memberRoutes';
import { PrismaClient } from '@prisma/client';
import { MemberService } from './services/memberService';
import { MemberController } from './controllers/memberController';
// Kong에서 멱등성 처리하므로 Fastify 레벨에서는 주석 처리
// import { IdempotencyMiddleware } from './middlewares/idempotencyMiddleware';
// import { redisClient } from './utils/redisClient';
import './types/fastify';  // 타입 확장 임포트

function validateConfig(): void {
  const requiredEnvVars = ['DATABASE_URL'];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}

// 앱 생성 코드
export async function buildApp(): Promise<FastifyInstance> {
  validateConfig();

  const app = fastify({
    logger: true
  });

  // 의존성 설정 - 명시적이고 직관적
  const prisma = new PrismaClient();
  const memberService = new MemberService(prisma);
  const memberController = new MemberController(memberService);

  // 의존성 주입 컨테이너 등록
  await app.register(diContainer);

  // CORS 설정
  await app.register(fastifyCors, {
    origin: true
  });

  // Swagger 스키마 설정
  await app.register(fastifySwagger, {
    swagger: {
      info: {
        title: 'Member API',
        description: 'Member service API documentation',
        version: '1.0.0'
      },
      basePath: '/api/members'
    }
  });

  // Swagger UI 설정
  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true
    },
  });



  // Kong에서 멱등성 처리하므로 Fastify 레벨 멱등성 미들웨어 주석 처리
  // 멱등성 미들웨어를 전역 스코프에서 직접 등록 (스코프 문제 해결)
  // const idempotencyMiddleware = new IdempotencyMiddleware({
  //   redis: redisClient,
  //   ttl: 60,
  //   keyPrefix: 'member-idempotency:'
  // });

  // 전역 훅으로 직접 등록
  // app.addHook('onRequest', async (request, reply) => {
  //   await idempotencyMiddleware.onRequest(request, reply);
  // });

  // onSend 훅으로 응답 캐싱 (비동기 처리)
  // app.addHook('onSend', async (request, reply, payload) => {
  //   return await idempotencyMiddleware.onSend(request, reply, payload);
  // });



  // 라우트 등록
  await app.register(memberRoutes(memberController), { prefix: '/api/members' });

  // 헬스체크 엔드포인트
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date() };
  });

  return app;
}