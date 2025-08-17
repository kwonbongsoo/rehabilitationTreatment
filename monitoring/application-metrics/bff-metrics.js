// BFF 서버 전용 메트릭 - CommonJS 버전
const client = require('prom-client');

// BFF 서버 전용 Prometheus 메트릭 레지스터
const register = new client.Registry();
client.collectDefaultMetrics({
  register,
  timeout: 5000,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
  prefix: 'bff_',
});

// HTTP 요청 메트릭
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code', 'service'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'service'],
  registers: [register],
});

const httpRequestsInFlight = new client.Gauge({
  name: 'http_requests_in_flight',
  help: 'Number of HTTP requests currently being processed',
  labelNames: ['service'],
  registers: [register],
});

// BFF 서버 특화 메트릭
const externalApiCalls = new client.Counter({
  name: 'external_api_calls_total',
  help: 'External API calls from BFF',
  labelNames: ['target_service', 'endpoint', 'status', 'service'],
  registers: [register],
});

const externalApiDuration = new client.Histogram({
  name: 'external_api_duration_seconds',
  help: 'External API call duration',
  labelNames: ['target_service', 'endpoint', 'service'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5, 10],
  registers: [register],
});

// 캐시 메트릭 (Redis)
const cacheOperations = new client.Counter({
  name: 'cache_operations_total',
  help: 'Cache operations (hit/miss/set)',
  labelNames: ['operation', 'result', 'service'],
  registers: [register],
});

const cacheHitRatio = new client.Gauge({
  name: 'cache_hit_ratio',
  help: 'Cache hit ratio',
  labelNames: ['service'],
  registers: [register],
});

// 데이터베이스 메트릭
const dbOperations = new client.Counter({
  name: 'database_operations_total',
  help: 'Database operations',
  labelNames: ['operation', 'table', 'status', 'service'],
  registers: [register],
});

const dbQueryDuration = new client.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Database query duration in seconds',
  labelNames: ['operation', 'table', 'service'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

// API 에러 메트릭
const apiErrors = new client.Counter({
  name: 'api_errors_total',
  help: 'API errors by type',
  labelNames: ['error_type', 'endpoint', 'service'],
  registers: [register],
});

// JWT 토큰 메트릭
const jwtOperations = new client.Counter({
  name: 'jwt_operations_total',
  help: 'JWT token operations',
  labelNames: ['operation', 'result', 'service'],
  registers: [register],
});

// Event Loop Lag 메트릭
const eventLoopLag = new client.Histogram({
  name: 'bff_event_loop_lag_seconds',
  help: 'Event loop lag in seconds',
  labelNames: ['service'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

// Event Loop Lag 측정 함수
function measureEventLoopLag(serviceName) {
  const start = process.hrtime.bigint();
  setImmediate(() => {
    const lag = Number(process.hrtime.bigint() - start) / 1e9; // 나노초를 초로 변환
    eventLoopLag.labels(serviceName).observe(lag);
  });
}

// BFF 서버 전용 Fastify 플러그인
async function metricsPlugin(fastify, options) {
  const serviceName = options.serviceName || 'bff-server';

  // 메트릭 엔드포인트
  fastify.get('/metrics', async (request, reply) => {
    reply.type('text/plain');
    return await register.metrics();
  });

  // 요청 추적 훅
  fastify.addHook('onRequest', async (request, reply) => {
    request.startTime = Date.now();
    httpRequestsInFlight.inc({ service: serviceName });
  });

  // Handle errors to ensure in-flight counter is decremented
  fastify.addHook('onError', async (request, reply, error) => {
    httpRequestsInFlight.dec({ service: serviceName });
  });

  fastify.addHook('onResponse', async (request, reply) => {
    const duration = (Date.now() - request.startTime) / 1000;
    const route = request.routerPath || request.url;
    const method = request.method;
    const statusCode = reply.statusCode.toString();

    // HTTP 메트릭 기록
    httpRequestDuration.labels(method, route, statusCode, serviceName).observe(duration);
    httpRequestTotal.labels(method, route, statusCode, serviceName).inc();
    httpRequestsInFlight.dec({ service: serviceName });
  });

  // 에러 추적 훅
  fastify.addHook('onError', async (request, reply, error) => {
    const endpoint = request.routerPath || request.url;
    const errorType = error.constructor.name || 'UnknownError';

    apiErrors.labels(errorType, endpoint, serviceName).inc();
  });

  fastify.log.info(`📊 BFF Metrics plugin registered for ${serviceName}`);
}

// BFF 서버 메트릭 유틸리티 함수들
const metrics = {
  // 외부 API 호출 메트릭 (BFF 전용)
  recordExternalApiCall(targetService, endpoint, status, service, duration = null) {
    externalApiCalls.labels(targetService, endpoint, status, service).inc();

    if (duration !== null) {
      externalApiDuration.labels(targetService, endpoint, service).observe(duration);
    }
  },

  // 캐시 메트릭
  recordCacheOperation(operation, result, service) {
    cacheOperations.labels(operation, result, service).inc();
  },

  updateCacheHitRatio(ratio, service) {
    cacheHitRatio.labels(service).set(ratio);
  },

  // 데이터베이스 메트릭
  recordDbOperation(operation, table, status, service, duration = null) {
    dbOperations.labels(operation, table, status, service).inc();

    if (duration !== null) {
      dbQueryDuration.labels(operation, table, service).observe(duration);
    }
  },

  // JWT 토큰 메트릭
  recordJwtOperation(operation, result, service) {
    jwtOperations.labels(operation, result, service).inc();
  },

  // 에러 메트릭
  recordApiError(errorType, endpoint, service) {
    apiErrors.labels(errorType, endpoint, service).inc();
  },

  // Event Loop Lag 측정
  measureEventLoopLag(service) {
    measureEventLoopLag(service);
  },

  // Event Loop Lag 정기 측정 시작
  startEventLoopLagMeasurement(service, intervalMs = 5000) {
    return setInterval(() => {
      measureEventLoopLag(service);
    }, intervalMs);
  },
};

module.exports = {
  metricsPlugin,
  metrics,
  register,
  client,
  eventLoopLag,
  measureEventLoopLag
};