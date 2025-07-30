// Bun 프록시 서버 - 게스트 토큰 발급 및 프록시
import { config, validateConfig, logConfig } from './config';
import { proxyHandler } from './handlers/proxy';
import { redisClient } from './services/redis';
import { withErrorHandling } from './middleware/errorHandler';

console.log('Proxy Server starting...');

// 설정 검증 및 로깅
try {
  validateConfig();
  logConfig();
} catch (error) {
  console.error('Configuration error:', error);
  process.exit(1);
}

// Redis 연결 초기화
async function initializeRedis() {
  try {
    await redisClient.connect();
    console.log('Redis cache service ready');
  } catch (error) {
    console.warn('Redis connection failed, caching disabled:', error);
  }
}

// Redis 초기화 실행
initializeRedis();

const server = Bun.serve({
  port: config.port,
  async fetch(req: Request): Promise<Response> {
    // 요청 로깅
    // if (config.enableRequestLogging) {
    //   const url = new URL(req.url);
    //   console.log(`[${new Date().toISOString()}] ${req.method} ${url.pathname}`);
    // }

    // 모든 요청을 프록시 핸들러로 처리 (토큰 검증 포함)
    return await withErrorHandling(proxyHandler.handleRequest.bind(proxyHandler))(req);
  },

  // 에러 핸들링
  error(error) {
    console.error('Server error:', error);
    return new Response('Internal Server Error', { status: 500 });
  },
});

console.log(`✨ Proxy server running on http://localhost:${config.port}`);
console.log(`Proxying to: ${config.nextServer}`);
console.log(`📊 Ready to handle requests!`);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down proxy server...');
  await redisClient.disconnect();
  server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  await redisClient.disconnect();
  server.stop();
  process.exit(0);
});
