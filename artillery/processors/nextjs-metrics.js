/**
 * Next.js 특화 메트릭 프로세서
 * SSR, ISR, 클라이언트 사이드 렌더링 성능 측정
 */

const fs = require('fs');
const path = require('path');

// Next.js 특화 메트릭 저장소
const nextjsMetrics = {
  ssrMetrics: [],
  isrMetrics: [],
  apiMetrics: [],
  bundleAnalysis: {},
  webVitals: [],
  startTime: Date.now()
};

/**
 * Next.js SSR 메트릭 캡처
 */
function captureMetrics(requestParams, response, context, ee, next) {
  const now = Date.now();
  const responseTime = response.timings ? 
    response.timings.phases.total : 
    now - (context._startTime || now);

  // Next.js 헤더에서 렌더링 정보 추출
  const renderTime = parseInt(response.headers['x-render-time']) || null;
  const cacheStatus = response.headers['x-cache-status'] || 'UNKNOWN';
  const isrRevalidate = response.headers['x-revalidate'] || null;

  const metrics = {
    timestamp: now,
    url: requestParams.url,
    method: requestParams.method || 'GET',
    statusCode: response.statusCode,
    totalResponseTime: responseTime,
    ssrRenderTime: renderTime,
    cacheStatus: cacheStatus,
    isrRevalidateTime: isrRevalidate,
    contentLength: parseInt(response.headers['content-length']) || 0,
    serverResponseTime: parseInt(response.headers['x-response-time']) || responseTime,
    
    // Next.js 특화 메트릭
    nextVersion: response.headers['x-nextjs-version'] || 'unknown',
    renderType: detectRenderType(response.headers),
    bundleSize: estimateBundleSize(response),
    
    // Core Web Vitals (서버 사이드 추정)
    fcp: estimateFCP(responseTime, renderTime),
    lcp: estimateLCP(responseTime, renderTime),
    ttfb: parseInt(response.headers['x-ttfb']) || responseTime
  };

  // ISR 관련 메트릭
  if (cacheStatus === 'STALE' || isrRevalidate) {
    nextjsMetrics.isrMetrics.push({
      ...metrics,
      revalidationType: isrRevalidate ? 'background' : 'on-demand',
      staleWhileRevalidate: response.headers['x-swr-status'] === 'true'
    });
  }

  nextjsMetrics.ssrMetrics.push(metrics);

  // 실시간 Next.js 메트릭 로깅
  if (nextjsMetrics.ssrMetrics.length % 50 === 0) {
    logNextjsMetrics();
  }

  return next();
}

/**
 * API Routes 메트릭 캡처
 */
function captureApiMetrics(requestParams, response, context, ee, next) {
  const responseTime = Date.now() - (context._startTime || Date.now());
  
  const apiMetrics = {
    timestamp: Date.now(),
    endpoint: extractApiEndpoint(requestParams.url),
    method: requestParams.method || 'GET',
    responseTime: responseTime,
    statusCode: response.statusCode,
    responseSize: parseInt(response.headers['content-length']) || 0,
    
    // API 특화 메트릭
    dbQueryTime: parseInt(response.headers['x-db-time']) || null,
    cacheHit: response.headers['x-cache-hit'] === 'true',
    rateLimitRemaining: parseInt(response.headers['x-ratelimit-remaining']) || null
  };

  nextjsMetrics.apiMetrics.push(apiMetrics);
  return next();
}

/**
 * 렌더링 타입 감지
 */
function detectRenderType(headers) {
  if (headers['x-nextjs-cache'] === 'HIT') return 'ISR';
  if (headers['x-nextjs-cache'] === 'MISS') return 'SSR';
  if (headers['x-prerender']) return 'SSG';
  return 'UNKNOWN';
}

/**
 * 번들 크기 추정
 */
function estimateBundleSize(response) {
  const contentLength = parseInt(response.headers['content-length']) || 0;
  const compression = response.headers['content-encoding'];
  
  // 압축 비율로 실제 번들 크기 추정
  if (compression === 'gzip') {
    return Math.round(contentLength * 3.2); // gzip 평균 압축 비율
  } else if (compression === 'br') {
    return Math.round(contentLength * 4.1); // brotli 평균 압축 비율
  }
  
  return contentLength;
}

/**
 * Core Web Vitals 추정
 */
function estimateFCP(responseTime, renderTime) {
  // First Contentful Paint 추정 (서버 응답 + 렌더링 시간)
  return responseTime + (renderTime || 0) + 200; // 200ms for client processing
}

function estimateLCP(responseTime, renderTime) {
  // Largest Contentful Paint 추정
  return responseTime + (renderTime || 0) + 500; // 500ms for large content rendering
}

/**
 * 실시간 메트릭 로깅
 */
function logNextjsMetrics() {
  const total = nextjsMetrics.ssrMetrics.length;
  if (total === 0) return;

  const avgResponseTime = nextjsMetrics.ssrMetrics
    .reduce((sum, m) => sum + m.totalResponseTime, 0) / total;
  
  const ssrCount = nextjsMetrics.ssrMetrics.filter(m => m.renderType === 'SSR').length;
  const isrCount = nextjsMetrics.ssrMetrics.filter(m => m.renderType === 'ISR').length;
  
  const avgFCP = nextjsMetrics.ssrMetrics
    .reduce((sum, m) => sum + m.fcp, 0) / total;

  console.log(`\n🚀 Next.js Metrics Update (${total} requests):`);
  console.log(`   📊 Avg Response Time: ${Math.round(avgResponseTime)}ms`);
  console.log(`   ⚡ Avg FCP: ${Math.round(avgFCP)}ms`);
  console.log(`   📄 SSR: ${ssrCount} | 🔄 ISR: ${isrCount}`);
  console.log(`   📦 Avg Bundle Size: ${calculateAverageBundleSize()}KB`);
}

/**
 * Next.js 성능 리포트 생성
 */
function generateNextjsReport(context, ee, next) {
  const reportPath = path.join(__dirname, '../reports');
  
  if (!fs.existsSync(reportPath)) {
    fs.mkdirSync(reportPath, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFile = path.join(reportPath, `nextjs-performance-${timestamp}.json`);

  const report = {
    testInfo: {
      startTime: nextjsMetrics.startTime,
      endTime: Date.now(),
      duration: Date.now() - nextjsMetrics.startTime,
      totalRequests: nextjsMetrics.ssrMetrics.length
    },
    
    performanceAnalysis: {
      averageResponseTime: calculateAverageResponseTime(),
      p95ResponseTime: calculatePercentile(95),
      p99ResponseTime: calculatePercentile(99),
      ssrPerformance: analyzeSSRPerformance(),
      isrEfficiency: analyzeISREfficiency(),
      webVitalsAnalysis: analyzeWebVitals()
    },
    
    renderingAnalysis: {
      renderTypes: analyzeRenderTypes(),
      bundleAnalysis: analyzeBundleSizes(),
      cacheEfficiency: analyzeCacheEfficiency()
    },
    
    detailedMetrics: {
      ssrMetrics: nextjsMetrics.ssrMetrics,
      isrMetrics: nextjsMetrics.isrMetrics,
      apiMetrics: nextjsMetrics.apiMetrics
    }
  };

  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`\n📊 Next.js Performance Report: ${reportFile}`);
  
  return next();
}

/**
 * 분석 헬퍼 함수들
 */
function calculateAverageResponseTime() {
  if (nextjsMetrics.ssrMetrics.length === 0) return 0;
  const total = nextjsMetrics.ssrMetrics.reduce((sum, m) => sum + m.totalResponseTime, 0);
  return Math.round(total / nextjsMetrics.ssrMetrics.length);
}

function calculatePercentile(percentile) {
  if (nextjsMetrics.ssrMetrics.length === 0) return 0;
  const sorted = nextjsMetrics.ssrMetrics
    .map(m => m.totalResponseTime)
    .sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index] || 0;
}

function analyzeSSRPerformance() {
  const ssrMetrics = nextjsMetrics.ssrMetrics.filter(m => m.renderType === 'SSR');
  if (ssrMetrics.length === 0) return null;
  
  return {
    count: ssrMetrics.length,
    averageRenderTime: Math.round(
      ssrMetrics.reduce((sum, m) => sum + (m.ssrRenderTime || 0), 0) / ssrMetrics.length
    ),
    averageResponseTime: Math.round(
      ssrMetrics.reduce((sum, m) => sum + m.totalResponseTime, 0) / ssrMetrics.length
    )
  };
}

function analyzeISREfficiency() {
  const isrMetrics = nextjsMetrics.isrMetrics;
  if (isrMetrics.length === 0) return null;
  
  return {
    count: isrMetrics.length,
    backgroundRevalidations: isrMetrics.filter(m => m.revalidationType === 'background').length,
    onDemandRevalidations: isrMetrics.filter(m => m.revalidationType === 'on-demand').length,
    stwrHits: isrMetrics.filter(m => m.staleWhileRevalidate).length
  };
}

function analyzeWebVitals() {
  if (nextjsMetrics.ssrMetrics.length === 0) return null;
  
  const metrics = nextjsMetrics.ssrMetrics;
  return {
    averageFCP: Math.round(metrics.reduce((sum, m) => sum + m.fcp, 0) / metrics.length),
    averageLCP: Math.round(metrics.reduce((sum, m) => sum + m.lcp, 0) / metrics.length),
    averageTTFB: Math.round(metrics.reduce((sum, m) => sum + m.ttfb, 0) / metrics.length),
    goodFCPCount: metrics.filter(m => m.fcp <= 1800).length,
    goodLCPCount: metrics.filter(m => m.lcp <= 2500).length
  };
}

function analyzeRenderTypes() {
  const total = nextjsMetrics.ssrMetrics.length;
  if (total === 0) return null;
  
  return {
    SSR: nextjsMetrics.ssrMetrics.filter(m => m.renderType === 'SSR').length,
    ISR: nextjsMetrics.ssrMetrics.filter(m => m.renderType === 'ISR').length,
    SSG: nextjsMetrics.ssrMetrics.filter(m => m.renderType === 'SSG').length,
    UNKNOWN: nextjsMetrics.ssrMetrics.filter(m => m.renderType === 'UNKNOWN').length
  };
}

function analyzeBundleSizes() {
  if (nextjsMetrics.ssrMetrics.length === 0) return null;
  
  const bundleSizes = nextjsMetrics.ssrMetrics.map(m => m.bundleSize);
  return {
    averageSize: Math.round(bundleSizes.reduce((sum, size) => sum + size, 0) / bundleSizes.length),
    maxSize: Math.max(...bundleSizes),
    minSize: Math.min(...bundleSizes)
  };
}

function analyzeCacheEfficiency() {
  const total = nextjsMetrics.ssrMetrics.length;
  if (total === 0) return null;
  
  const hitCount = nextjsMetrics.ssrMetrics.filter(m => m.cacheStatus === 'HIT').length;
  const missCount = nextjsMetrics.ssrMetrics.filter(m => m.cacheStatus === 'MISS').length;
  
  return {
    hitRate: Math.round((hitCount / total) * 100),
    hitCount,
    missCount,
    staleCount: nextjsMetrics.ssrMetrics.filter(m => m.cacheStatus === 'STALE').length
  };
}

function calculateAverageBundleSize() {
  if (nextjsMetrics.ssrMetrics.length === 0) return 0;
  const total = nextjsMetrics.ssrMetrics.reduce((sum, m) => sum + m.bundleSize, 0);
  return Math.round(total / nextjsMetrics.ssrMetrics.length / 1024); // KB 단위
}

function extractApiEndpoint(url) {
  const match = url.match(/\/api\/([^?]+)/);
  return match ? match[1] : 'unknown';
}

module.exports = {
  captureMetrics,
  captureApiMetrics,
  generateNextjsReport
};