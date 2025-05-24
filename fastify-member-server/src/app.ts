import dotenv from 'dotenv';
dotenv.config();

import fastify, { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import fastifyCors from '@fastify/cors';
import { validateConfig } from './utils/config';
import memberRoutes from './routes/memberRoutes';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi, { FastifySwaggerUiOptions } from '@fastify/swagger-ui';


// 앱 생성 코드...

export async function buildApp(): Promise<FastifyInstance> {
  validateConfig();

  const app = fastify({
    logger: true
  });

  // DB 클라이언트 초기화
  const prisma = new PrismaClient();

  // 앱 종료 시 DB 연결 해제
  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });

  // 플러그인으로 prisma 사용 가능하게 등록
  app.decorate('prisma', prisma);

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
      }
    }
  });

  // 타입을 명시적으로 지정
  const swaggerUiOptions: FastifySwaggerUiOptions = {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
  };


  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
  });

  // 헬스체크 엔드포인트
  app.get('/health', async () => {
    return { status: 'ok' };
  });

  // 라우트 등록
  app.register(memberRoutes, { prefix: '/member' });

  return app;
}