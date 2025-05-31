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

  // 라우트 등록
  await app.register(memberRoutes(memberController), { prefix: '/api/members' });

  // 헬스체크 엔드포인트
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date() };
  });

  return app;
}