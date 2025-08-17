// Koa.js 서버용 메트릭 (Auth Server) - CommonJS 버전
const client = require('prom-client');

// Prometheus 메트릭 레지스터
const register = new client.Registry();
client.collectDefaultMetrics({ 
  register,
  timeout: 5000,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
  prefix: 'koa_'
});

// HTTP 요청 메트릭
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code', 'service'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'service'],
  registers: [register]
});

const httpRequestsInFlight = new client.Gauge({
  name: 'http_requests_in_flight',
  help: 'Number of HTTP requests currently being processed',
  labelNames: ['service'],
  registers: [register]
});

// 인증 관련 메트릭
const authAttempts = new client.Counter({
  name: 'auth_attempts_total',
  help: 'Total authentication attempts',
  labelNames: ['method', 'result', 'service'],
  registers: [register]
});

const authSuccessRate = new client.Gauge({
  name: 'auth_success_rate',
  help: 'Authentication success rate',
  labelNames: ['method', 'service'],
  registers: [register]
});

const loginAttempts = new client.Counter({
  name: 'login_attempts_total',
  help: 'Login attempts by result',
  labelNames: ['result', 'reason', 'service'],
  registers: [register]
});

const activeTokens = new client.Gauge({
  name: 'jwt_tokens_active',
  help: 'Number of active JWT tokens',
  labelNames: ['service'],
  registers: [register]
});

const tokenOperations = new client.Counter({
  name: 'jwt_operations_total',
  help: 'JWT token operations',
  labelNames: ['operation', 'result', 'service'],
  registers: [register]
});

const tokenDuration = new client.Histogram({
  name: 'jwt_operation_duration_seconds',
  help: 'JWT operation duration',
  labelNames: ['operation', 'service'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [register]
});

// 세션 관리 메트릭
const sessionOperations = new client.Counter({
  name: 'session_operations_total',
  help: 'Session operations',
  labelNames: ['operation', 'result', 'service'],
  registers: [register]
});

const activeSessions = new client.Gauge({
  name: 'sessions_active',
  help: 'Number of active sessions',
  labelNames: ['service'],
  registers: [register]
});

// Redis 연결 메트릭
const redisOperations = new client.Counter({
  name: 'redis_operations_total',
  help: 'Redis operations',
  labelNames: ['operation', 'result', 'service'],
  registers: [register]
});

const redisConnectionPool = new client.Gauge({
  name: 'redis_connection_pool_size',
  help: 'Redis connection pool size',
  labelNames: ['service'],
  registers: [register]
});

const redisLatency = new client.Histogram({
  name: 'redis_operation_duration_seconds',
  help: 'Redis operation latency',
  labelNames: ['operation', 'service'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [register]
});

// 보안 메트릭
const securityEvents = new client.Counter({
  name: 'security_events_total',
  help: 'Security events',
  labelNames: ['event_type', 'severity', 'service'],
  registers: [register]
});

const rateLimitHits = new client.Counter({
  name: 'rate_limit_hits_total',
  help: 'Rate limit hits',
  labelNames: ['endpoint', 'client_ip', 'service'],
  registers: [register]
});

// API 에러 메트릭
const apiErrors = new client.Counter({
  name: 'api_errors_total',
  help: 'API errors by type',
  labelNames: ['error_type', 'endpoint', 'service'],
  registers: [register]
});

// Event Loop Lag 메트릭
const eventLoopLag = new client.Histogram({
  name: 'koa_event_loop_lag_seconds',
  help: 'Event loop lag in seconds',
  labelNames: ['service'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register]
});

// Event Loop Lag 측정 함수
function measureEventLoopLag(serviceName) {
  const start = process.hrtime.bigint();
  setImmediate(() => {
    const lag = Number(process.hrtime.bigint() - start) / 1e9; // 나노초를 초로 변환
    eventLoopLag.labels(serviceName).observe(lag);
  });
}

// Koa 미들웨어
function createMetricsMiddleware(serviceName = 'auth-server') {
  return async (ctx, next) => {
    const startTime = Date.now();
    httpRequestsInFlight.inc({ service: serviceName });

    try {
      await next();
    } catch (error) {
      // 에러 메트릭 기록
      const errorType = error.constructor.name || 'UnknownError';
      apiErrors
        .labels(errorType, ctx.path, serviceName)
        .inc();
      
      throw error; // 에러 재발생
    } finally {
      const duration = (Date.now() - startTime) / 1000;
      const method = ctx.method;
      const route = ctx._matchedRoute || ctx.path;
      const statusCode = ctx.status.toString();

      // HTTP 메트릭 기록
      httpRequestDuration
        .labels(method, route, statusCode, serviceName)
        .observe(duration);
      
      httpRequestTotal
        .labels(method, route, statusCode, serviceName)
        .inc();

      httpRequestsInFlight.dec({ service: serviceName });
    }
  };
}

// Koa 라우트
function createMetricsRoutes(router, serviceName = 'auth-server') {
  // 메트릭 엔드포인트
  router.get('/metrics', async (ctx) => {
    ctx.type = 'text/plain';
    ctx.body = await register.metrics();
  });

  // Health check endpoint removed to avoid conflicts with application's own health endpoint
}

// 인증 메트릭 유틸리티
const authMetrics = {
  // 로그인 시도 기록
  recordLoginAttempt(result, reason = 'unknown', service = 'auth-server') {
    loginAttempts.labels(result, reason, service).inc();
  },

  // 로그인 성공 기록
  recordLoginSuccess(method = 'password', service = 'auth-server') {
    authAttempts.labels(method, 'success', service).inc();
  },

  // 로그인 실패 기록
  recordLoginFailure(reason = 'invalid_credentials', service = 'auth-server') {
    authAttempts.labels('password', 'failure', service).inc();
    loginAttempts.labels('failure', reason, service).inc();
  },

  // 토큰 검증 기록
  recordTokenVerification(isValid, service = 'auth-server') {
    const result = isValid ? 'success' : 'failure';
    tokenOperations.labels('verify', result, service).inc();
  },

  // 토큰 생성 기록
  recordTokenGeneration(success = true, service = 'auth-server') {
    const result = success ? 'success' : 'failure';
    tokenOperations.labels('generate', result, service).inc();
  },

  // 토큰 갱신 기록
  recordTokenRefresh(success = true, service = 'auth-server') {
    const result = success ? 'success' : 'failure';
    tokenOperations.labels('refresh', result, service).inc();
  },

  // 활성 토큰 수 업데이트
  updateActiveTokens(count, service = 'auth-server') {
    activeTokens.labels(service).set(count);
  },

  // 세션 작업 기록
  recordSessionOperation(operation, result, service = 'auth-server') {
    sessionOperations.labels(operation, result, service).inc();
  },

  // 활성 세션 수 업데이트
  updateActiveSessions(count, service = 'auth-server') {
    activeSessions.labels(service).set(count);
  },

  // Redis 작업 기록
  recordRedisOperation(operation, result, service = 'auth-server', duration = null) {
    redisOperations.labels(operation, result, service).inc();
    
    if (duration !== null) {
      redisLatency.labels(operation, service).observe(duration);
    }
  },

  // Redis 연결 풀 업데이트
  updateRedisConnectionPool(size, service = 'auth-server') {
    redisConnectionPool.labels(service).set(size);
  },

  // 보안 이벤트 기록
  recordSecurityEvent(eventType, severity = 'medium', service = 'auth-server') {
    securityEvents.labels(eventType, severity, service).inc();
  },

  // Rate Limit 히트 기록
  recordRateLimitHit(endpoint, clientIp, service = 'auth-server') {
    rateLimitHits.labels(endpoint, clientIp, service).inc();
  },

  // 인증 성공률 업데이트
  updateAuthSuccessRate(rate, method = 'password', service = 'auth-server') {
    authSuccessRate.labels(method, service).set(rate);
  },

  // JWT 작업 시간 측정 시작
  startTokenTimer(operation, service = 'auth-server') {
    const timer = tokenDuration.startTimer({ operation, service });
    return () => timer(); // 타이머 종료 함수 반환
  },

  // API 에러 기록
  recordApiError(errorType, endpoint, service = 'auth-server') {
    apiErrors.labels(errorType, endpoint, service).inc();
  },

  // Event Loop Lag 측정
  measureEventLoopLag(service = 'auth-server') {
    measureEventLoopLag(service);
  },

  // Event Loop Lag 정기 측정 시작
  startEventLoopLagMeasurement(service = 'auth-server', intervalMs = 5000) {
    return setInterval(() => {
      measureEventLoopLag(service);
    }, intervalMs);
  }
};

module.exports = {
  createMetricsMiddleware,
  createMetricsRoutes,
  authMetrics,
  register,
  client,
  eventLoopLag,
  measureEventLoopLag
};