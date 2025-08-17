import { FastifyInstance } from 'fastify';
import dotenv from 'dotenv';
import { buildApp } from './app';
import { EnvValidator } from '@ecommerce/common';

dotenv.config();

// 환경변수 검증
try {
  EnvValidator.validate({
    required: ['KOA_AUTH_SERVER_URL', 'FASTIFY_MEMBER_SERVER_URL', 'PRODUCT_SERVICE_URL'],
    optional: {
      NODE_ENV: 'development',
      PORT: '3001',
      HOST: '0.0.0.0',
    },
    production: ['NODE_ENV'],
  });

  // 추가 검증
  if (process.env.KOA_AUTH_SERVER_URL) {
    EnvValidator.validateUrl('KOA_AUTH_SERVER_URL');
  }
  if (process.env.FASTIFY_MEMBER_SERVER_URL) {
    EnvValidator.validateUrl('FASTIFY_MEMBER_SERVER_URL');
  }
  if (process.env.PRODUCT_SERVICE_URL) {
    EnvValidator.validateUrl('PRODUCT_SERVICE_URL');
  }
  if (process.env.PORT) {
    EnvValidator.validateNumber('PORT', 1, 65535);
  }
} catch (error) {
  console.error('환경변수 검증 실패:', error instanceof Error ? error.message : error);
  process.exit(1);
}

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const HOST = process.env.HOST || '0.0.0.0';

async function startServer() {
  const app = await buildApp();

  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`🚀 BFF Server is running on ${HOST}:${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⚡ Using Fastify for optimal performance`);

    // Event Loop Lag 측정 시작
    try {
      const { metrics } = require('/app/monitoring/bff-metrics.js');
      const intervalId = metrics.startEventLoopLagMeasurement('bff-server', 5000);
      console.log('📈 BFF Server Event Loop Lag 측정 시작됨');
      
      // 서버 종료시 interval 정리
      process.on('SIGTERM', () => {
        if (intervalId) clearInterval(intervalId);
      });
      process.on('SIGINT', () => {
        if (intervalId) clearInterval(intervalId);
      });
    } catch (error) {
      console.warn('Failed to start Event Loop Lag measurement:', (error as Error).message);
    }

    process.on('SIGINT', () => gracefulShutdown(app));
    process.on('SIGTERM', () => gracefulShutdown(app));
  } catch (error) {
    console.error('❌ Failed to start BFF server:', error);
    process.exit(1);
  }
}

async function gracefulShutdown(app: FastifyInstance) {
  console.log('🛑 Shutting down BFF server gracefully...');
  try {
    await app.close();
    console.log('✅ Server closed successfully');
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
  }
  process.exit(0);
}

if (require.main === module) {
  startServer();
}
