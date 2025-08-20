/**
 * Artillery.js 기본 메트릭 프로세서
 * Next.js 성능 테스트를 위한 커스텀 메트릭 수집
 */

const fs = require('fs');
const path = require('path');

// 메트릭 데이터 저장소
const metricsData = {
  responses: [],
  errors: [],
  customMetrics: {},
  startTime: Date.now()
};

/**
 * 응답 후 메트릭 캡처
 */
function captureMetrics(requestParams, response, context, ee, next) {
  // 응답 시간 계산
  const responseTime = response.timings ? 
    response.timings.phases.total : 
    Date.now() - context._startTime;

  // 메트릭 데이터 수집
  const metrics = {
    timestamp: Date.now(),
    url: requestParams.url,
    method: requestParams.method || 'GET',
    statusCode: response.statusCode,
    responseTime: responseTime,
    contentLength: response.headers['content-length'] || 0,
    cacheStatus: response.headers['x-cache-status'] || 'UNKNOWN',
    serverType: response.headers['server'] || 'UNKNOWN',
    userAgent: requestParams.headers ? requestParams.headers['User-Agent'] : null
  };

  // Core Web Vitals 계산
  if (response.headers['x-response-time']) {
    metrics.serverResponseTime = parseInt(response.headers['x-response-time']);
  }

  // 에러 체크
  if (response.statusCode >= 400) {
    metricsData.errors.push({
      ...metrics,
      errorType: `HTTP_${response.statusCode}`,
      errorMessage: response.statusMessage || 'Unknown Error'
    });
  }

  metricsData.responses.push(metrics);

  // 실시간 메트릭 출력
  if (metricsData.responses.length % 100 === 0) {
    console.log(`📊 Metrics Update: ${metricsData.responses.length} requests processed`);
    console.log(`   Average Response Time: ${calculateAverageResponseTime()}ms`);
    console.log(`   Error Rate: ${calculateErrorRate()}%`);
  }

  return next();
}

/**
 * API 응답 메트릭 캡처
 */
function captureApiMetrics(requestParams, response, context, ee, next) {
  const metrics = {
    timestamp: Date.now(),
    url: requestParams.url,
    apiEndpoint: extractApiEndpoint(requestParams.url),
    responseTime: Date.now() - context._startTime,
    statusCode: response.statusCode,
    responseSize: response.headers['content-length'] || 0
  };

  metricsData.responses.push(metrics);
  return next();
}

/**
 * 테스트 완료 후 리포트 생성
 */
function generateReport(context, ee, next) {
  const reportPath = path.join(__dirname, '../reports');
  
  // 디렉토리 생성
  if (!fs.existsSync(reportPath)) {
    fs.mkdirSync(reportPath, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFile = path.join(reportPath, `metrics-report-${timestamp}.json`);

  const report = {
    testSummary: {
      startTime: metricsData.startTime,
      endTime: Date.now(),
      duration: Date.now() - metricsData.startTime,
      totalRequests: metricsData.responses.length,
      totalErrors: metricsData.errors.length,
      errorRate: calculateErrorRate()
    },
    performanceMetrics: {
      averageResponseTime: calculateAverageResponseTime(),
      p95ResponseTime: calculatePercentile(95),
      p99ResponseTime: calculatePercentile(99),
      maxResponseTime: Math.max(...metricsData.responses.map(r => r.responseTime)),
      minResponseTime: Math.min(...metricsData.responses.map(r => r.responseTime))
    },
    cacheAnalysis: analyzeCachePerformance(),
    detailedMetrics: metricsData
  };

  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`\n📈 Report generated: ${reportFile}`);
  
  return next();
}

/**
 * 헬퍼 함수들
 */
function calculateAverageResponseTime() {
  if (metricsData.responses.length === 0) return 0;
  const total = metricsData.responses.reduce((sum, r) => sum + r.responseTime, 0);
  return Math.round(total / metricsData.responses.length);
}

function calculateErrorRate() {
  if (metricsData.responses.length === 0) return 0;
  return Math.round((metricsData.errors.length / metricsData.responses.length) * 100);
}

function calculatePercentile(percentile) {
  if (metricsData.responses.length === 0) return 0;
  const sorted = metricsData.responses
    .map(r => r.responseTime)
    .sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index] || 0;
}

function analyzeCachePerformance() {
  const cacheHits = metricsData.responses.filter(r => r.cacheStatus === 'HIT').length;
  const cacheMisses = metricsData.responses.filter(r => r.cacheStatus === 'MISS').length;
  const total = cacheHits + cacheMisses;
  
  return {
    hitRate: total > 0 ? Math.round((cacheHits / total) * 100) : 0,
    hitCount: cacheHits,
    missCount: cacheMisses,
    unknownCount: metricsData.responses.filter(r => r.cacheStatus === 'UNKNOWN').length
  };
}

function extractApiEndpoint(url) {
  const match = url.match(/\/api\/([^?]+)/);
  return match ? match[1] : 'unknown';
}

module.exports = {
  captureMetrics,
  captureApiMetrics,
  generateReport
};