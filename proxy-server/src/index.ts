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

// Redis 연결 초기화 및 웜업
async function initializeServices() {
  try {
    // Redis 연결
    await redisClient.connect();
    console.log('✅ Redis cache service ready');
    
    // Redis 연결 테스트
    const pingResult = await redisClient.ping();
    console.log(`✅ Redis ping: ${pingResult ? 'SUCCESS' : 'FAILED'}`);
    
    // 컨테이너 웜업 - 유효한 테스트 토큰으로 JIT 최적화
    console.log('🔥 Warming up proxy server...');
    setTimeout(async () => {
      try {
        // 유효한 테스트 토큰으로 웜업
        const warmupResponse = await fetch(`http://localhost:${config.port}/`, {
          method: 'GET',
          headers: {
            'User-Agent': 'Warmup-Request',
            'Authorization': `Bearer ${config.warmupToken}`
          }
        }).catch(() => null);
        console.log('🔥 Server warmup completed');
      } catch (error) {
        console.log('⚠️ Server warmup failed (expected):', error.message);
      }
    }, 1000); // 1초 후 웜업
    
  } catch (error) {
    console.warn('⚠️ Redis connection failed, caching disabled:', error);
  }
}

// 서비스 초기화 실행
initializeServices();

const server = Bun.serve({
  port: config.port,
  // Keep-alive 및 성능 최적화 설정
  development: false,
  maxRequestBodySize: 256 * 1024 * 1024, // 256MB
  
  async fetch(req: Request): Promise<Response> {
    // 요청 로깅
    // if (config.enableRequestLogging) {
    //   const url = new URL(req.url);
    //   console.log(`[${new Date().toISOString()}] ${req.method} ${url.pathname}`);
    // }

    // 모든 요청을 프록시 핸들러로 처리 (토큰 검증 포함)
    const response = await withErrorHandling(proxyHandler.handleRequest.bind(proxyHandler))(req);
    
    // Keep-alive 헤더 추가
    const headers = new Headers(response.headers);
    headers.set('Connection', 'keep-alive');
    headers.set('Keep-Alive', 'timeout=60, max=1000');
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  },

  // 에러 핸들링
  error(error) {
    console.error('Server error:', error);
    return new Response('Internal Server Error', { 
      status: 500,
      headers: {
        'Connection': 'close'
      }
    });
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
