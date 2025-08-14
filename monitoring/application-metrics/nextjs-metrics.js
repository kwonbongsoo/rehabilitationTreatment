// Next.js Frontend 메트릭 (API Routes)
import client from 'prom-client';

// 기본 메트릭 활성화 (서버사이드만)
if (typeof window === 'undefined') {
  client.collectDefaultMetrics({
    timeout: 5000,
    prefix: 'nextjs_'
  });
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
export function withMetrics(handler) {
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

// 페이지 컴포넌트 HOC
export function withPageMetrics(WrappedComponent, pageName) {
  return function MetricsWrappedPage(props) {
    const startTime = Date.now();
    
    React.useEffect(() => {
      // 페이지 렌더링 완료 기록
      const renderDuration = (Date.now() - startTime) / 1000;
      
      if (typeof window !== 'undefined') {
        // 클라이언트 사이드 렌더링
        recordPageRender(pageName, 'CSR', renderDuration);
      }
    }, []);
    
    return <WrappedComponent {...props} />;
  };
}

// 클라이언트 사이드 메트릭 함수들
export const clientMetrics = {
  // 페이지 렌더링 기록
  recordPageRender(page, type = 'CSR', duration = 0) {
    // 클라이언트에서는 API를 통해 메트릭 전송
    if (typeof window !== 'undefined') {
      fetch('/api/metrics/page-render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, type, duration })
      }).catch(console.error);
    }
  },

  // 사용자 상호작용 기록
  recordUserInteraction(action, component, page = window.location.pathname) {
    if (typeof window !== 'undefined') {
      fetch('/api/metrics/user-interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, component, page })
      }).catch(console.error);
    }
  },

  // 프론트엔드 에러 기록
  recordError(error, page = window.location.pathname, component = 'unknown') {
    const errorType = error.name || 'UnknownError';
    
    if (typeof window !== 'undefined') {
      fetch('/api/metrics/frontend-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: errorType, 
          message: error.message,
          page, 
          component 
        })
      }).catch(console.error);
    }
  },

  // Web Vitals 기록
  recordWebVital(name, value, page = window.location.pathname) {
    if (typeof window !== 'undefined') {
      fetch('/api/metrics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, value, page })
      }).catch(console.error);
    }
  }
};

// 서버사이드 메트릭 함수들
export const serverMetrics = {
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

// Web Vitals 자동 수집 (클라이언트)
export function initWebVitals() {
  if (typeof window !== 'undefined') {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(clientMetrics.recordWebVital.bind(null, 'CLS'));
      getFID(clientMetrics.recordWebVital.bind(null, 'FID'));
      getFCP(clientMetrics.recordWebVital.bind(null, 'FCP'));
      getLCP(clientMetrics.recordWebVital.bind(null, 'LCP'));
      getTTFB(clientMetrics.recordWebVital.bind(null, 'TTFB'));
    });
  }
}

export default client;