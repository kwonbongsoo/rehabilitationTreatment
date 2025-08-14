// Fastify 서버용 메트릭 미들웨어 (ES Modules 버전)
import client from 'prom-client';

// 기본 메트릭 활성화
client.collectDefaultMetrics({
  timeout: 5000,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
  prefix: 'fastify_'
});

// 커스텀 메트릭 정의
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

const httpRequestsInFlight = new client.Gauge({
  name: 'http_requests_in_flight',
  help: 'Number of HTTP requests currently being processed',
  labelNames: ['service']
});

// 비즈니스 메트릭
const memberOperations = new client.Counter({
  name: 'member_operations_total',
  help: 'Total member operations',
  labelNames: ['operation', 'status', 'service']
});

const databaseConnections = new client.Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections',
  labelNames: ['service', 'database']
});

const cacheOperations = new client.Counter({
  name: 'cache_operations_total',
  help: 'Total cache operations',
  labelNames: ['operation', 'status', 'service']
});

// Fastify 플러그인
export async function metricsPlugin(fastify, options) {
  const serviceName = options.serviceName || 'unknown';

  // 요청 시작 시간 추적
  fastify.addHook('onRequest', async (request, reply) => {
    request.startTime = Date.now();
    httpRequestsInFlight.inc({ service: serviceName });
  });

  // 응답 완료 시 메트릭 기록
  fastify.addHook('onResponse', async (request, reply) => {
    const duration = (Date.now() - request.startTime) / 1000;
    const route = request.routerPath || request.url;
    
    httpRequestsTotal.inc({
      method: request.method,
      route: route,
      status_code: reply.statusCode,
      service: serviceName
    });

    httpRequestDuration.observe({
      method: request.method,
      route: route,
      service: serviceName
    }, duration);

    httpRequestsInFlight.dec({ service: serviceName });
  });

  // 메트릭 엔드포인트
  fastify.get('/metrics', async (request, reply) => {
    reply.type('text/plain');
    return client.register.metrics();
  });

  // 헬스체크 엔드포인트
  fastify.get('/health', async (request, reply) => {
    return { 
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: serviceName,
      uptime: process.uptime()
    };
  });
}

// 비즈니스 메트릭 헬퍼 객체
export const metrics = {
  // 회원 작업 기록
  recordMemberOperation(operation, status, service) {
    memberOperations.inc({ operation, status, service });
  },

  // 데이터베이스 연결 상태 업데이트
  updateDatabaseConnections(count, service, database = 'postgres') {
    databaseConnections.set({ service, database }, count);
  },

  // 캐시 작업 기록
  recordCacheOperation(operation, status, service) {
    cacheOperations.inc({ operation, status, service });
  },

  // 커스텀 카운터 증가
  incrementCounter(name, labels = {}) {
    if (!this.customCounters[name]) {
      this.customCounters[name] = new client.Counter({
        name: name,
        help: `Custom counter: ${name}`,
        labelNames: Object.keys(labels)
      });
    }
    this.customCounters[name].inc(labels);
  },

  customCounters: {}
};

// Prometheus client도 export
export { client };