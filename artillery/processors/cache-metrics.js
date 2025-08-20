/**
 * Redis 캐시 성능 메트릭 프로세서
 * 프록시 서버 캐시 효율성 및 성능 분석
 */

const fs = require('fs');
const path = require('path');

// 캐시 메트릭 저장소
const cacheMetrics = {
  requests: [],
  cacheAnalysis: {
    hits: 0,
    misses: 0,
    stale: 0,
    bypassed: 0
  },
  redisMetrics: [],
  performanceComparison: [],
  startTime: Date.now()
};

/**
 * 캐시 성능 분석
 */
function analyzeCachePerformance(requestParams, response, context, ee, next) {
  const now = Date.now();
  const responseTime = response.timings ? 
    response.timings.phases.total : 
    now - (context._startTime || now);

  // 캐시 헤더 분석
  const cacheStatus = response.headers['x-cache-status'] || 'UNKNOWN';
  const cacheAge = parseInt(response.headers['age']) || 0;
  const cacheTtl = parseInt(response.headers['x-cache-ttl']) || 0;
  const redisResponseTime = parseInt(response.headers['x-redis-time']) || null;

  const metrics = {
    timestamp: now,
    url: requestParams.url,
    responseTime: responseTime,
    statusCode: response.statusCode,
    
    // 캐시 특화 메트릭
    cacheStatus: cacheStatus,
    cacheAge: cacheAge,
    cacheTtl: cacheTtl,
    redisResponseTime: redisResponseTime,
    
    // 캐시 효율성 메트릭
    isCacheHit: cacheStatus === 'HIT',
    isCacheMiss: cacheStatus === 'MISS',
    isStale: cacheStatus === 'STALE',
    
    // 성능 메트릭
    proxyOverhead: calculateProxyOverhead(response.headers),
    cacheSpeedGain: calculateCacheSpeedGain(cacheStatus, responseTime),
    
    // 컨텐츠 메트릭
    contentLength: parseInt(response.headers['content-length']) || 0,
    contentType: response.headers['content-type'] || 'unknown',
    compression: response.headers['content-encoding'] || 'none'
  };

  // 캐시 상태별 카운터 업데이트
  updateCacheCounters(cacheStatus);
  
  // Redis 특화 메트릭 수집
  if (redisResponseTime !== null) {
    cacheMetrics.redisMetrics.push({
      timestamp: now,
      operation: 'GET',
      responseTime: redisResponseTime,
      cacheKey: extractCacheKey(requestParams),
      hitMiss: cacheStatus === 'HIT' ? 'HIT' : 'MISS'
    });
  }

  cacheMetrics.requests.push(metrics);

  // 실시간 캐시 성능 로깅
  if (cacheMetrics.requests.length % 50 === 0) {
    logCacheMetrics();
  }

  return next();
}

/**
 * 캐시 상태별 카운터 업데이트
 */
function updateCacheCounters(status) {
  switch (status) {
    case 'HIT':
      cacheMetrics.cacheAnalysis.hits++;
      break;
    case 'MISS':
      cacheMetrics.cacheAnalysis.misses++;
      break;
    case 'STALE':
      cacheMetrics.cacheAnalysis.stale++;
      break;
    case 'BYPASS':
      cacheMetrics.cacheAnalysis.bypassed++;
      break;
  }
}

/**
 * 프록시 오버헤드 계산
 */
function calculateProxyOverhead(headers) {
  const proxyTime = parseInt(headers['x-proxy-time']) || 0;
  const upstreamTime = parseInt(headers['x-upstream-time']) || 0;
  return Math.max(0, proxyTime - upstreamTime);
}

/**
 * 캐시 속도 향상 계산
 */
function calculateCacheSpeedGain(cacheStatus, responseTime) {
  if (cacheStatus !== 'HIT') return 0;
  
  // 평균 SSR 응답 시간 대비 캐시 응답 시간의 개선도
  const averageSSRTime = 500; // 가정값 (실제로는 동적으로 계산)
  return Math.max(0, averageSSRTime - responseTime);
}

/**
 * 캐시 키 추출
 */
function extractCacheKey(requestParams) {
  const url = requestParams.url;
  const headers = requestParams.headers || {};
  
  // URL과 특정 헤더를 기반으로 캐시 키 구성
  const keyComponents = [
    url,
    headers['Accept-Language'] || 'en',
    headers['X-Device-Type'] || 'desktop'
  ];
  
  return keyComponents.join('|');
}

/**
 * 실시간 캐시 메트릭 로깅
 */
function logCacheMetrics() {
  const total = cacheMetrics.requests.length;
  if (total === 0) return;

  const analysis = cacheMetrics.cacheAnalysis;
  const hitRate = Math.round((analysis.hits / total) * 100);
  
  const avgResponseTime = cacheMetrics.requests
    .reduce((sum, m) => sum + m.responseTime, 0) / total;
  
  const avgCacheHitTime = cacheMetrics.requests
    .filter(m => m.isCacheHit)
    .reduce((sum, m, _, arr) => sum + m.responseTime / arr.length, 0) || 0;
  
  const avgCacheMissTime = cacheMetrics.requests
    .filter(m => m.isCacheMiss)
    .reduce((sum, m, _, arr) => sum + m.responseTime / arr.length, 0) || 0;

  console.log(`\n🗄️  Cache Metrics Update (${total} requests):`);
  console.log(`   📊 Hit Rate: ${hitRate}% (${analysis.hits}/${total})`);
  console.log(`   ⚡ Avg Response Time: ${Math.round(avgResponseTime)}ms`);
  console.log(`   🎯 Cache Hit Avg: ${Math.round(avgCacheHitTime)}ms`);
  console.log(`   ❌ Cache Miss Avg: ${Math.round(avgCacheMissTime)}ms`);
  console.log(`   💾 Redis Avg: ${calculateRedisAverageTime()}ms`);
}

/**
 * 캐시 성능 리포트 생성
 */
function generateCacheReport(context, ee, next) {
  const reportPath = path.join(__dirname, '../reports');
  
  if (!fs.existsSync(reportPath)) {
    fs.mkdirSync(reportPath, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFile = path.join(reportPath, `cache-performance-${timestamp}.json`);

  const report = {
    testInfo: {
      startTime: cacheMetrics.startTime,
      endTime: Date.now(),
      duration: Date.now() - cacheMetrics.startTime,
      totalRequests: cacheMetrics.requests.length
    },
    
    cacheEfficiency: {
      hitRate: calculateHitRate(),
      missRate: calculateMissRate(),
      hitCount: cacheMetrics.cacheAnalysis.hits,
      missCount: cacheMetrics.cacheAnalysis.misses,
      staleCount: cacheMetrics.cacheAnalysis.stale,
      bypassedCount: cacheMetrics.cacheAnalysis.bypassed
    },
    
    performanceAnalysis: {
      averageResponseTime: calculateAverageResponseTime(),
      cacheHitAverageTime: calculateCacheHitAverageTime(),
      cacheMissAverageTime: calculateCacheMissAverageTime(),
      performanceGain: calculatePerformanceGain(),
      redisPerformance: analyzeRedisPerformance()
    },
    
    contentAnalysis: {
      compressionRatio: analyzeCompressionRatio(),
      contentTypes: analyzeContentTypes(),
      cacheMissPenalty: calculateCacheMissPenalty()
    },
    
    redisAnalysis: {
      averageRedisTime: calculateRedisAverageTime(),
      redisHitRate: calculateRedisHitRate(),
      redisPerformanceDistribution: analyzeRedisPerformanceDistribution()
    },
    
    detailedMetrics: {
      requests: cacheMetrics.requests,
      redisMetrics: cacheMetrics.redisMetrics
    }
  };

  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`\n🗄️  Cache Performance Report: ${reportFile}`);
  
  return next();
}

/**
 * 분석 헬퍼 함수들
 */
function calculateHitRate() {
  const total = cacheMetrics.requests.length;
  return total > 0 ? Math.round((cacheMetrics.cacheAnalysis.hits / total) * 100) : 0;
}

function calculateMissRate() {
  const total = cacheMetrics.requests.length;
  return total > 0 ? Math.round((cacheMetrics.cacheAnalysis.misses / total) * 100) : 0;
}

function calculateAverageResponseTime() {
  if (cacheMetrics.requests.length === 0) return 0;
  const total = cacheMetrics.requests.reduce((sum, m) => sum + m.responseTime, 0);
  return Math.round(total / cacheMetrics.requests.length);
}

function calculateCacheHitAverageTime() {
  const hits = cacheMetrics.requests.filter(m => m.isCacheHit);
  if (hits.length === 0) return 0;
  const total = hits.reduce((sum, m) => sum + m.responseTime, 0);
  return Math.round(total / hits.length);
}

function calculateCacheMissAverageTime() {
  const misses = cacheMetrics.requests.filter(m => m.isCacheMiss);
  if (misses.length === 0) return 0;
  const total = misses.reduce((sum, m) => sum + m.responseTime, 0);
  return Math.round(total / misses.length);
}

function calculatePerformanceGain() {
  const hitTime = calculateCacheHitAverageTime();
  const missTime = calculateCacheMissAverageTime();
  
  if (hitTime === 0 || missTime === 0) return 0;
  return Math.round(((missTime - hitTime) / missTime) * 100);
}

function calculateRedisAverageTime() {
  if (cacheMetrics.redisMetrics.length === 0) return 0;
  const total = cacheMetrics.redisMetrics.reduce((sum, m) => sum + m.responseTime, 0);
  return Math.round(total / cacheMetrics.redisMetrics.length);
}

function calculateRedisHitRate() {
  const total = cacheMetrics.redisMetrics.length;
  if (total === 0) return 0;
  const hits = cacheMetrics.redisMetrics.filter(m => m.hitMiss === 'HIT').length;
  return Math.round((hits / total) * 100);
}

function analyzeRedisPerformance() {
  if (cacheMetrics.redisMetrics.length === 0) return null;
  
  const times = cacheMetrics.redisMetrics.map(m => m.responseTime);
  return {
    min: Math.min(...times),
    max: Math.max(...times),
    average: calculateRedisAverageTime(),
    p95: calculateRedisPercentile(95),
    p99: calculateRedisPercentile(99)
  };
}

function calculateRedisPercentile(percentile) {
  if (cacheMetrics.redisMetrics.length === 0) return 0;
  const sorted = cacheMetrics.redisMetrics
    .map(m => m.responseTime)
    .sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index] || 0;
}

function analyzeCompressionRatio() {
  if (cacheMetrics.requests.length === 0) return null;
  
  const compressed = cacheMetrics.requests.filter(m => m.compression !== 'none').length;
  const total = cacheMetrics.requests.length;
  return Math.round((compressed / total) * 100);
}

function analyzeContentTypes() {
  const types = {};
  cacheMetrics.requests.forEach(m => {
    const type = m.contentType.split(';')[0]; // content-type에서 charset 제거
    types[type] = (types[type] || 0) + 1;
  });
  return types;
}

function calculateCacheMissPenalty() {
  const hitTime = calculateCacheHitAverageTime();
  const missTime = calculateCacheMissAverageTime();
  return Math.max(0, missTime - hitTime);
}

function analyzeRedisPerformanceDistribution() {
  if (cacheMetrics.redisMetrics.length === 0) return null;
  
  const buckets = {
    'fast': 0,      // < 5ms
    'normal': 0,    // 5-20ms
    'slow': 0,      // 20-50ms
    'very_slow': 0  // > 50ms
  };
  
  cacheMetrics.redisMetrics.forEach(m => {
    if (m.responseTime < 5) buckets.fast++;
    else if (m.responseTime < 20) buckets.normal++;
    else if (m.responseTime < 50) buckets.slow++;
    else buckets.very_slow++;
  });
  
  return buckets;
}

module.exports = {
  analyzeCachePerformance,
  generateCacheReport
};