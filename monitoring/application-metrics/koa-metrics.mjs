// Koa.js 서버용 메트릭 미들웨어 (ES Modules 버전)
import client from 'prom-client';

// 기본 메트릭 활성화
client.collectDefaultMetrics({
  timeout: 5000,
  prefix: 'koa_'
});

// HTTP 메트릭
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'service']
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'service'],
  buckets: [0.1, 0.25, 0.5, 1, 2.5, 5, 10]
});

// 인증 관련 메트릭
const authenticationAttempts = new client.Counter({
  name: 'authentication_attempts_total',
  help: 'Total authentication attempts',
  labelNames: ['status', 'method', 'service'] // success, failure / login, logout, verify
});

const jwtTokenOperations = new client.Counter({
  name: 'jwt_token_operations_total',
  help: 'Total JWT token operations',
  labelNames: ['operation', 'status', 'service'] // issued, verified, expired
});

const activeSessions = new client.Gauge({
  name: 'user_sessions_active',
  help: 'Number of active user sessions',
  labelNames: ['service']
});

const redisOperations = new client.Counter({
  name: 'redis_operations_total',
  help: 'Total Redis operations',
  labelNames: ['operation', 'status', 'service'] // get, set, del
});

// Koa 미들웨어
export function createMetricsMiddleware(serviceName = 'auth-server') {
  return async (ctx, next) => {
    const startTime = Date.now();
    
    try {
      await next();
    } catch (error) {
      // 에러 상태도 기록
      throw error;
    } finally {
      const duration = (Date.now() - startTime) / 1000;
      const route = ctx.matched ? ctx.matched.map(layer => layer.path).join('') : ctx.path;
      
      httpRequestsTotal.inc({
        method: ctx.method,
        route: route,
        status_code: ctx.status,
        service: serviceName
      });

      httpRequestDuration.observe({
        method: ctx.method,
        route: route,
        service: serviceName
      }, duration);
    }
  };
}

// 메트릭 엔드포인트 라우터
export function createMetricsRoutes(router, serviceName = 'auth-server') {
  // 메트릭 엔드포인트
  router.get('/metrics', async (ctx) => {
    ctx.type = 'text/plain';
    ctx.body = await client.register.metrics();
  });

  // 헬스체크 엔드포인트
  router.get('/health', async (ctx) => {
    ctx.body = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: serviceName,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      activeSessions: await getActiveSessionsCount()
    };
  });
}

// 비즈니스 메트릭 헬퍼 객체
export const authMetrics = {
  // 인증 시도 기록
  recordAuthAttempt(status, method, service = 'auth-server') {
    authenticationAttempts.inc({ status, method, service });
  },

  // JWT 토큰 작업 기록
  recordJwtOperation(operation, status, service = 'auth-server') {
    jwtTokenOperations.inc({ operation, status, service });
  },

  // 활성 세션 수 업데이트
  updateActiveSessions(count, service = 'auth-server') {
    activeSessions.set({ service }, count);
  },

  // Redis 작업 기록
  recordRedisOperation(operation, status, service = 'auth-server') {
    redisOperations.inc({ operation, status, service });
  },

  // 로그인 성공
  recordLoginSuccess(method = 'password') {
    this.recordAuthAttempt('success', 'login');
    this.recordJwtOperation('issued', 'success');
  },

  // 로그인 실패
  recordLoginFailure(reason = 'invalid_credentials') {
    this.recordAuthAttempt('failure', 'login');
  },

  // 토큰 검증
  recordTokenVerification(isValid) {
    const status = isValid ? 'success' : 'failure';
    this.recordJwtOperation('verified', status);
  },

  // 로그아웃
  recordLogout() {
    this.recordAuthAttempt('success', 'logout');
  }
};

// 활성 세션 수 조회 (Redis에서)
async function getActiveSessionsCount() {
  // Redis 클라이언트를 통해 실제 세션 수 조회
  // 실제 구현에서는 Redis keys 패턴이나 별도 카운터 사용
  return 0; // placeholder
}

// Prometheus client도 export
export { client };