// Next.js Frontend 메트릭 (API Routes) - ES 모듈 버전
import client from 'prom-client';

// 기본 메트릭 활성화 (서버사이드만)
if (typeof window === 'undefined') {
  client.collectDefaultMetrics({
    timeout: 5000,
    prefix: 'nextjs_'
  });
}

// Event Loop Lag 메트릭
const eventLoopLag = new client.Histogram({
  name: 'nextjs_event_loop_lag_seconds',
  help: 'Event loop lag in seconds',
  labelNames: ['service'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

// Event Loop Lag 측정 함수
function measureEventLoopLag() {
  if (typeof window !== 'undefined') return; // 서버사이드만
  
  const start = process.hrtime.bigint();
  setImmediate(() => {
    const lag = Number(process.hrtime.bigint() - start) / 1e9; // 나노초를 초로 변환
    eventLoopLag.observe({ service: 'nextjs-frontend' }, lag);
  });
}

// Event Loop Lag 정기 측정 (5초마다)
if (typeof window === 'undefined') {
  setInterval(measureEventLoopLag, 5000);
}

// 페이지 렌더링 메트릭
const pageRenders = new client.Counter({
  name: 'nextjs_page_renders_total',
  help: 'Total page renders',
  labelNames: ['page', 'type', 'service'] // SSR, SSG, CSR
});

const pageRenderDuration = new client.Histogram({
  name: 'nextjs_page_render_duration_seconds',
  help: 'Page render duration',
  labelNames: ['page', 'type', 'service'],
  buckets: [0.1, 0.25, 0.5, 1, 2, 5]
});

// API Routes 메트릭
const apiRequests = new client.Counter({
  name: 'nextjs_api_requests_total',
  help: 'Total API requests',
  labelNames: ['route', 'method', 'status', 'service']
});

const apiRequestDuration = new client.Histogram({
  name: 'nextjs_api_request_duration_seconds',
  help: 'API request duration',
  labelNames: ['route', 'method', 'service'],
  buckets: [0.1, 0.25, 0.5, 1, 2, 5]
});

// 사용자 행동 메트릭
const userInteractions = new client.Counter({
  name: 'user_interactions_total',
  help: 'Total user interactions',
  labelNames: ['action', 'component', 'page', 'service']
});

const errorOccurrences = new client.Counter({
  name: 'frontend_errors_total',
  help: 'Total frontend errors',
  labelNames: ['type', 'page', 'component', 'service']
});

// 성능 메트릭
const webVitals = new client.Histogram({
  name: 'web_vitals_seconds',
  help: 'Web Vitals metrics',
  labelNames: ['metric_name', 'page', 'service'],
  buckets: [0.1, 0.25, 0.5, 1, 2.5, 5, 10]
});

// API Route 미들웨어
function withMetrics(handler) {
  return async (req, res) => {
    const startTime = Date.now();
    const route = req.url.split('?')[0]; // 쿼리 파라미터 제외
    
    try {
      const result = await handler(req, res);
      
      // 성공 메트릭 기록
      apiRequests.inc({
        route,
        method: req.method,
        status: res.statusCode.toString(),
        service: 'nextjs-frontend'
      });
      
      return result;
    } catch (error) {
      // 에러 메트릭 기록
      apiRequests.inc({
        route,
        method: req.method,
        status: '500',
        service: 'nextjs-frontend'
      });
      
      throw error;
    } finally {
      // 응답 시간 기록
      const duration = (Date.now() - startTime) / 1000;
      apiRequestDuration.observe({
        route,
        method: req.method,
        service: 'nextjs-frontend'
      }, duration);
    }
  };
}

// Next.js 메트릭 클래스
class NextjsMetrics {
  constructor(serviceName = 'nextjs-frontend') {
    this.serviceName = serviceName;
  }

  // 페이지 로드 기록
  recordPageLoad(page) {
    if (typeof window !== 'undefined') {
      // 클라이언트 사이드에서는 API를 통해 메트릭 전송
      this.sendMetricsToAPI('page-load', { page, service: this.serviceName });
    }
  }

  // 클라이언트 에러 기록
  recordClientError(type, message, page) {
    if (typeof window !== 'undefined') {
      this.sendMetricsToAPI('client-error', { 
        type, 
        message, 
        page, 
        service: this.serviceName 
      });
    }
  }

  // 사용자 상호작용 기록
  recordUserInteraction(action, component, page) {
    if (typeof window !== 'undefined') {
      this.sendMetricsToAPI('user-interaction', { 
        action, 
        component, 
        page, 
        service: this.serviceName 
      });
    }
  }

  // 메트릭 API 전송 (클라이언트용)
  sendMetricsToAPI(endpoint, data) {
    if (typeof window !== 'undefined') {
      fetch(`/api/metrics/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(console.error);
    }
  }
}

// 서버사이드 메트릭 함수들
const serverMetrics = {
  recordPageRender(page, type, duration) {
    pageRenders.inc({ page, type, service: 'nextjs-frontend' });
    if (duration > 0) {
      pageRenderDuration.observe({ page, type, service: 'nextjs-frontend' }, duration);
    }
  },

  recordUserInteraction(action, component, page) {
    userInteractions.inc({ action, component, page, service: 'nextjs-frontend' });
  },

  recordError(type, page, component) {
    errorOccurrences.inc({ type, page, component, service: 'nextjs-frontend' });
  },

  recordWebVital(name, value, page) {
    webVitals.observe({ metric_name: name, page, service: 'nextjs-frontend' }, value);
  }
};

export {
  NextjsMetrics,
  withMetrics,
  serverMetrics,
  eventLoopLag,
  measureEventLoopLag,
  client
};