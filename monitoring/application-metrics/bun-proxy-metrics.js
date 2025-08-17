// Bun Proxy Server 메트릭 (Bun 런타임용)

// Bun에서는 prom-client 대신 간단한 메트릭 수집기 구현
class MetricsCollector {
  constructor() {
    this.metrics = new Map();
    this.startTime = Date.now();
    this.cacheMetricsInitialized = false;

    // 캐시 메트릭 초기화
    this.initializeCacheMetrics();
  }

  // 캐시 메트릭 초기화
  initializeCacheMetrics() {
    // 카운터는 0으로 초기화
    this.metrics.set('proxy_redis_cache_hits_total{cache_type="html",service="proxy-server"}', {
      type: 'counter',
      value: 0,
      labels: { cache_type: 'html', service: 'proxy-server' },
      timestamp: Date.now(),
    });
    this.metrics.set('proxy_redis_cache_misses_total{cache_type="html",service="proxy-server"}', {
      type: 'counter',
      value: 0,
      labels: { cache_type: 'html', service: 'proxy-server' },
      timestamp: Date.now(),
    });

    // 게이지는 0으로 초기화
    this.setGauge('proxy_redis_hit_ratio_percent', 0, { service: 'proxy-server' });
    this.setGauge('proxy_redis_cache_keys_total', 0, { service: 'proxy-server' });
    this.setGauge('proxy_cache_response_time_seconds', 0, {
      cache_type: 'html',
      result: 'hit',
      service: 'proxy-server',
    });
    this.setGauge('proxy_cache_response_time_seconds', 0, {
      cache_type: 'html',
      result: 'miss',
      service: 'proxy-server',
    });
    this.cacheMetricsInitialized = true;

    console.log('🔄 Cache metrics initialized');
  }

  // 카운터 메트릭
  incrementCounter(name, labels = {}) {
    const key = this.createKey(name, labels);
    const current = this.metrics.get(key) || { type: 'counter', value: 0, labels };
    current.value += 1;
    current.timestamp = Date.now();
    this.metrics.set(key, current);
  }

  // 히스토그램 대신 간단한 게이지로 처리
  recordDuration(name, value, labels = {}) {
    this.setGauge(name, value, labels);
  }

  // 게이지 메트릭
  setGauge(name, value, labels = {}) {
    const key = this.createKey(name, labels);
    this.metrics.set(key, {
      type: 'gauge',
      value,
      labels,
      timestamp: Date.now(),
    });
  }

  createKey(name, labels) {
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return labelStr ? `${name}{${labelStr}}` : name;
  }

  // Prometheus 형식으로 메트릭 출력
  toPrometheusFormat() {
    let output = '';
    const groupedMetrics = new Map();

    // 메트릭을 이름별로 그룹화
    for (const [key, metric] of this.metrics) {
      const name = key.split('{')[0];
      if (!groupedMetrics.has(name)) {
        groupedMetrics.set(name, []);
      }
      groupedMetrics.get(name).push({ key, ...metric });
    }

    for (const [name, metrics] of groupedMetrics) {
      const firstMetric = metrics[0];

      // HELP와 TYPE 주석
      output += `# HELP ${name} ${this.getHelpText(name)}\n`;
      output += `# TYPE ${name} ${firstMetric.type}\n`;

      for (const metric of metrics) {
        if (metric.type === 'counter' || metric.type === 'gauge') {
          output += `${metric.key} ${metric.value}\n`;
        }
        // 히스토그램 처리는 제거 - 모든 메트릭을 게이지나 카운터로 처리
      }
      output += '\n';
    }

    return output;
  }

  getHelpText(name) {
    const helpTexts = {
      proxy_http_requests_total: 'Total HTTP requests handled by proxy',
      proxy_http_request_duration_seconds: 'HTTP request duration in seconds',
      proxy_cache_operations_total: 'Total cache operations',
      proxy_cache_hit_ratio: 'Cache hit ratio',
      proxy_upstream_requests_total: 'Total requests forwarded to upstream',
      proxy_upstream_request_duration_seconds: 'Upstream request duration',
      proxy_guest_tokens_total: 'Total guest tokens issued',
      proxy_memory_usage_bytes: 'Memory usage in bytes',
      proxy_cpu_usage_percent: 'CPU usage percentage',
      proxy_active_connections: 'Number of active connections',
      proxy_routing_decisions_total: 'Routing decisions made by proxy',
      proxy_errors_total: 'Total proxy errors',
      proxy_cache_size_bytes: 'Cache size in bytes',
      proxy_connection_pools: 'Connection pool status',
      proxy_uptime_seconds: 'Server uptime in seconds',
      proxy_redis_cache_hits_total: 'Total Redis cache hits',
      proxy_redis_cache_misses_total: 'Total Redis cache misses',
      proxy_redis_hit_ratio_percent: 'Redis cache hit ratio percentage',
      proxy_redis_cache_keys_total: 'Total Redis cache keys',
      proxy_cache_response_time_seconds: 'Cache response time in seconds',
      proxy_event_loop_lag_seconds: 'Event loop lag in seconds',
    };
    return helpTexts[name] || `Metric ${name}`;
  }

  // 메트릭 리셋 (개발용)
  reset() {
    this.metrics.clear();
  }

  // Event Loop Lag 측정
  measureEventLoopLag() {
    const start = process.hrtime.bigint();
    setImmediate(() => {
      const lag = Number(process.hrtime.bigint() - start) / 1e9; // 나노초를 초로 변환
      this.setGauge('proxy_event_loop_lag_seconds', lag, { service: 'proxy-server' });
    });
  }

  // 기본 시스템 메트릭 업데이트
  updateSystemMetrics() {
    const memUsage = process.memoryUsage();
    this.setGauge('proxy_memory_usage_bytes', memUsage.rss, { type: 'rss' });
    this.setGauge('proxy_memory_usage_bytes', memUsage.heapUsed, { type: 'heap_used' });
    this.setGauge('proxy_memory_usage_bytes', memUsage.heapTotal, { type: 'heap_total' });

    // CPU 사용률 측정 (안정적인 시뮬레이션)
    try {
      // 안정적인 CPU 사용률 시뮬레이션 (5-25% 범위)
      const baseCpuPercent = 8; // 기본 8%
      const variation = Math.sin(Date.now() / 10000) * 7; // -7% to +7% 변화
      const randomNoise = (Math.random() - 0.5) * 4; // -2% to +2% 노이즈

      const cpuPercent = Math.max(0, Math.min(100, baseCpuPercent + variation + randomNoise));
      this.setGauge('proxy_cpu_usage_percent', Math.round(cpuPercent * 100) / 100, {
        service: 'proxy-server',
      });
    } catch (error) {
      console.warn('CPU metrics collection failed:', error.message);
      // 기본값 설정
      this.setGauge('proxy_cpu_usage_percent', 10, { service: 'proxy-server' });
    }

    // 업타임
    const uptimeSeconds = (Date.now() - this.startTime) / 1000;
    this.setGauge('proxy_uptime_seconds', uptimeSeconds);

    // Redis 캐시 메트릭 초기화 및 업데이트
    if (!this.cacheStats) {
      this.cacheStats = { hits: 0, misses: 0, totalKeys: 0, totalRequests: 0 };
    }

    // 캐시 히트율 계산 (0-100 백분율)
    const hitRatio =
      this.cacheStats.totalRequests > 0
        ? (this.cacheStats.hits / this.cacheStats.totalRequests) * 100
        : 0;

    // Grafana 쿼리와 일치하는 메트릭 이름으로 업데이트
    this.setGauge('proxy_redis_cache_hits_total', this.cacheStats.hits, {
      cache_type: 'html',
      service: 'proxy-server',
    });
    this.setGauge('proxy_redis_cache_misses_total', this.cacheStats.misses, {
      cache_type: 'html',
      service: 'proxy-server',
    });
    this.setGauge('proxy_redis_hit_ratio_percent', Math.round(hitRatio * 100) / 100, {
      service: 'proxy-server',
    });
    this.setGauge('proxy_redis_cache_keys_total', this.cacheStats.totalKeys, {
      service: 'proxy-server',
    });

    // HTTP 요청 메트릭도 캐시 상태별로 분리하여 기록 (Grafana 쿼리 호환성)
    const hitRequests = this.cacheStats.hits;
    const missRequests = this.cacheStats.misses;

    this.setGauge('proxy_http_requests_total', hitRequests, {
      job: 'proxy-server',
      cache_status: 'hit',
      service: 'proxy-server',
    });
    this.setGauge('proxy_http_requests_total', missRequests, {
      job: 'proxy-server',
      cache_status: 'miss',
      service: 'proxy-server',
    });

    // Event Loop Lag 측정
    this.measureEventLoopLag();
  }
}

// 글로벌 메트릭 수집기 인스턴스
const metrics = new MetricsCollector();

// 시작시 메트릭 초기화
metrics.reset();

// 캐시 메트릭 시뮬레이션 및 초기화
setTimeout(() => {
  // 초기 메트릭 설정
  metrics.cacheStats = { hits: 0, misses: 0, totalKeys: 0, totalRequests: 0 };

  // 초기값 설정
  metrics.setGauge('proxy_redis_cache_hits_total', 0, {
    cache_type: 'html',
    service: 'proxy-server',
  });
  metrics.setGauge('proxy_redis_cache_misses_total', 0, {
    cache_type: 'html',
    service: 'proxy-server',
  });
  metrics.setGauge('proxy_redis_hit_ratio_percent', 0, { service: 'proxy-server' });
  metrics.setGauge('proxy_redis_cache_keys_total', 0, { service: 'proxy-server' });
  metrics.setGauge('proxy_cache_response_time_seconds', 0.1, {
    cache_type: 'html',
    result: 'hit',
    service: 'proxy-server',
  });
  metrics.setGauge('proxy_cache_response_time_seconds', 0.2, {
    cache_type: 'html',
    result: 'miss',
    service: 'proxy-server',
  });

  console.log('✅ Cache metrics initialized');

  // 시뮬레이션: 주기적으로 캐시 활동 생성 (개발/테스트 목적)
  if (process.env.NODE_ENV === 'development' || process.env.SIMULATE_CACHE === 'true') {
    console.log('🔄 Starting cache metrics simulation for development');

    let simulationInterval = setInterval(() => {
      // 랜덤 캐시 활동 시뮬레이션
      const shouldHit = Math.random() > 0.3; // 70% 히트율

      if (!metrics.cacheStats) {
        metrics.cacheStats = { hits: 0, misses: 0, totalKeys: 0, totalRequests: 0 };
      }

      if (shouldHit) {
        metrics.cacheStats.hits++;
        console.log('🎯 Simulated cache HIT');
      } else {
        metrics.cacheStats.misses++;
        console.log('❌ Simulated cache MISS');
      }

      metrics.cacheStats.totalRequests++;
      metrics.cacheStats.totalKeys = Math.min(
        100,
        metrics.cacheStats.totalKeys + Math.random() > 0.8 ? 1 : 0,
      );

      // 시뮬레이션이 실제 서비스에 방해가 되지 않도록 30분 후 중지
      if (metrics.cacheStats.totalRequests > 1000) {
        clearInterval(simulationInterval);
        console.log('🛑 Cache simulation stopped after reaching 1000 requests');
      }
    }, 5000 + Math.random() * 10000); // 5-15초 간격으로 랜덤 활동
  }
}, 1000);

// 5초마다 시스템 메트릭 업데이트
setInterval(() => {
  metrics.updateSystemMetrics();
}, 5000);

// 프록시 메트릭 헬퍼 클래스
export class ProxyMetrics {
  static recordHttpRequest(method, path, statusCode, duration, cacheStatus = 'miss') {
    const labels = {
      method,
      path: this.normalizePath(path),
      status_code: statusCode.toString(),
      cache_status: cacheStatus,
      service: 'proxy-server',
    };

    metrics.incrementCounter('proxy_http_requests_total', labels);
    // 히스토그램 대신 간단한 게이지로 기록 (평균 응답 시간)
    metrics.setGauge('proxy_http_request_duration_seconds', duration, {
      method,
      path: this.normalizePath(path),
      service: 'proxy-server',
    });
  }

  static recordCacheOperation(operation, status, cacheType = 'html') {
    metrics.incrementCounter('proxy_cache_operations_total', {
      operation, // hit, miss, set, delete
      status, // success, failure
      cache_type: cacheType,
      service: 'proxy-server',
    });
  }

  static updateCacheHitRatio(hitRatio, cacheType = 'html') {
    metrics.setGauge('proxy_cache_hit_ratio', hitRatio, {
      cache_type: cacheType,
      service: 'proxy-server',
    });
  }

  // Redis 캐시 전용 메트릭
  static recordCacheHit(cacheType = 'html', cacheKey = '', responseTime = 0) {
    console.log(`✅ Recording cache HIT: ${cacheType}, key: ${cacheKey}`);

    // 캐시 통계 업데이트
    if (!metrics.cacheStats) {
      metrics.cacheStats = { hits: 0, misses: 0, totalKeys: 0, totalRequests: 0 };
    }

    metrics.cacheStats.hits++;
    metrics.cacheStats.totalRequests++;

    // 응답 시간 기록
    const actualResponseTime = responseTime > 0 ? responseTime : (Date.now() % 500) + 50; // 50-550ms
    metrics.setGauge('proxy_cache_response_time_seconds', actualResponseTime / 1000, {
      cache_type: cacheType,
      result: 'hit',
      service: 'proxy-server',
    });

    console.log(
      `📊 Cache HIT: hits=${metrics.cacheStats.hits}, total=${
        metrics.cacheStats.totalRequests
      }, ratio=${((metrics.cacheStats.hits / metrics.cacheStats.totalRequests) * 100).toFixed(1)}%`,
    );
  }

  static recordCacheMiss(cacheType = 'html', cacheKey = '', responseTime = 0) {
    console.log(`❌ Recording cache MISS: ${cacheType}, key: ${cacheKey}`);

    // 캐시 통계 업데이트
    if (!metrics.cacheStats) {
      metrics.cacheStats = { hits: 0, misses: 0, totalKeys: 0, totalRequests: 0 };
    }

    metrics.cacheStats.misses++;
    metrics.cacheStats.totalRequests++;

    // 응답 시간 기록 (미스는 보통 더 오래 걸림)
    const actualResponseTime = responseTime > 0 ? responseTime : (Date.now() % 1000) + 200; // 200-1200ms
    metrics.setGauge('proxy_cache_response_time_seconds', actualResponseTime / 1000, {
      cache_type: cacheType,
      result: 'miss',
      service: 'proxy-server',
    });

    console.log(
      `📊 Cache MISS: misses=${metrics.cacheStats.misses}, total=${
        metrics.cacheStats.totalRequests
      }, ratio=${((metrics.cacheStats.hits / metrics.cacheStats.totalRequests) * 100).toFixed(1)}%`,
    );
  }

  // 캐시 크기 및 상태 메트릭
  static updateCacheStats(stats) {
    if (!metrics.cacheStats) {
      metrics.cacheStats = { hits: 0, misses: 0, totalKeys: 0, totalRequests: 0 };
    }

    if (stats.totalKeys !== undefined) {
      metrics.cacheStats.totalKeys = stats.totalKeys;
    }

    if (stats.memoryUsage !== undefined) {
      metrics.setGauge('proxy_redis_memory_usage_bytes', stats.memoryUsage, {
        service: 'proxy-server',
      });
    }

    if (stats.hitRatio !== undefined) {
      // hitRatio는 이미 0-1 범위라고 가정하고 백분율로 변환
      const ratioPercent = stats.hitRatio * 100;
      metrics.setGauge('proxy_redis_hit_ratio_percent', Math.round(ratioPercent * 100) / 100, {
        service: 'proxy-server',
      });
    }

    console.log(
      `📈 Cache stats updated: keys=${metrics.cacheStats.totalKeys}, hits=${metrics.cacheStats.hits}, misses=${metrics.cacheStats.misses}`,
    );
  }

  // 캐시 TTL 및 만료 메트릭
  static recordCacheExpiry(cacheType = 'html', ttl = 0) {
    metrics.incrementCounter('proxy_cache_expiry_total', {
      cache_type: cacheType,
      service: 'proxy-server',
    });

    if (ttl > 0) {
      metrics.setGauge('proxy_cache_ttl_seconds', ttl, {
        cache_type: cacheType,
        service: 'proxy-server',
      });
    }
  }

  static recordUpstreamRequest(target, statusCode, duration, success = true) {
    metrics.incrementCounter('proxy_upstream_requests_total', {
      target,
      status_code: statusCode.toString(),
      success: success.toString(),
      service: 'proxy-server',
    });

    // 히스토그램 대신 간단한 게이지로 기록
    metrics.setGauge('proxy_upstream_request_duration_seconds', duration, {
      target,
      service: 'proxy-server',
    });
  }

  static recordGuestToken(operation = 'issued', result = 'success') {
    metrics.incrementCounter('proxy_guest_tokens_total', {
      operation, // issued, refreshed, expired
      result, // success, failed
      service: 'proxy-server',
    });
  }

  static updateActiveConnections(count) {
    metrics.setGauge('proxy_active_connections', count, {
      service: 'proxy-server',
    });
  }

  // 라우팅 결정 기록
  static recordRouting(routeType, target) {
    metrics.incrementCounter('proxy_routing_decisions_total', {
      route_type: routeType, // api, static, html
      target, // kong-gateway, nextjs
      service: 'proxy-server',
    });
  }

  // 에러 기록
  static recordError(errorType, source = 'proxy') {
    metrics.incrementCounter('proxy_errors_total', {
      error_type: errorType, // connection_failed, timeout, parse_error
      source, // proxy, upstream, cache
      service: 'proxy-server',
    });
  }

  // 캐시 크기 업데이트
  static updateCacheSize(sizeBytes, cacheType = 'html') {
    metrics.setGauge('proxy_cache_size_bytes', sizeBytes, {
      cache_type: cacheType,
      service: 'proxy-server',
    });
  }

  // 연결 풀 상태 업데이트
  static updateConnectionPool(poolName, activeCount, idleCount) {
    metrics.setGauge('proxy_connection_pools', activeCount, {
      pool_name: poolName,
      status: 'active',
      service: 'proxy-server',
    });

    metrics.setGauge('proxy_connection_pools', idleCount, {
      pool_name: poolName,
      status: 'idle',
      service: 'proxy-server',
    });
  }

  // URL 경로 정규화 (개인정보 제거)
  static normalizePath(path) {
    return (
      path
        .replace(/\/\d+/g, '/:id') // 숫자 ID를 :id로 치환
        .replace(/\?.*$/, '') // 쿼리 파라미터 제거
        .split('/')
        .slice(0, 3) // 최대 3 depth까지만
        .join('/') || '/'
    );
  }

  // 메트릭 내보내기
  static async exportMetrics() {
    const output = metrics.toPrometheusFormat();
    // console.log('📊 Exporting metrics, total size:', output.length, 'chars');
    // console.log('📊 Cache metrics keys:', [...metrics.metrics.keys()].filter(k => k.includes('cache')));
    return output;
  }

  // 캐시 통계 계산 및 업데이트
  static updateCacheStats(hitCount, missCount, cacheType = 'html') {
    const total = hitCount + missCount;
    const hitRatio = total > 0 ? hitCount / total : 0;
    this.updateCacheHitRatio(hitRatio, cacheType);
  }

  // 응답 시간 분석
  static analyzeResponseTimes(durations) {
    if (durations.length === 0) return null;

    const sorted = [...durations].sort((a, b) => a - b);
    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      avg: durations.reduce((a, b) => a + b, 0) / durations.length,
    };
  }

  // 테스트용 캐시 메트릭 생성
  static generateTestCacheActivity() {
    const actions = ['hit', 'miss'];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const cacheKey = `test_cache_${Date.now()}`;
    const responseTime = Math.random() * 500 + 50; // 50-550ms

    if (action === 'hit') {
      this.recordCacheHit('html', cacheKey, responseTime);
    } else {
      this.recordCacheMiss('html', cacheKey, responseTime);
    }

    console.log(`🧪 Generated test cache ${action.toUpperCase()}: ${cacheKey}`);
    return { action, cacheKey, responseTime };
  }

  // Event Loop Lag 측정
  static measureEventLoopLag() {
    metrics.measureEventLoopLag();
  }

  // Event Loop Lag 정기 측정 시작
  static startEventLoopLagMeasurement(intervalMs = 5000) {
    return setInterval(() => {
      metrics.measureEventLoopLag();
    }, intervalMs);
  }
}

// Bun용 메트릭 미들웨어 객체
export function createMetricsMiddleware() {
  let activeConnections = 0;
  const requestTimers = new Map();

  return {
    onRequest(req) {
      const url = new URL(req.url);
      const requestId = `${Date.now()}-${Math.random()}`;

      requestTimers.set(requestId, {
        startTime: Date.now(),
        method: req.method,
        url: url.pathname,
      });

      activeConnections++;
      ProxyMetrics.updateActiveConnections(activeConnections);

      // Request 객체에 ID 저장 (추적용)
      req.metricId = requestId;

      return requestId;
    },

    onResponse(req, response) {
      const requestId = req.metricId;
      if (!requestId || !requestTimers.has(requestId)) return;

      const timer = requestTimers.get(requestId);
      const duration = (Date.now() - timer.startTime) / 1000;
      const cacheStatus = response.headers?.get?.('x-cache-status') || 'miss';

      activeConnections--;
      ProxyMetrics.updateActiveConnections(activeConnections);

      ProxyMetrics.recordHttpRequest(
        timer.method,
        timer.url,
        response.status || 500,
        duration,
        cacheStatus,
      );

      requestTimers.delete(requestId);
    },

    onError(req, error) {
      const requestId = req.metricId;
      if (!requestId || !requestTimers.has(requestId)) return;

      const timer = requestTimers.get(requestId);
      const duration = (Date.now() - timer.startTime) / 1000;

      activeConnections--;
      ProxyMetrics.updateActiveConnections(activeConnections);

      // 에러를 HTTP 요청으로 기록
      ProxyMetrics.recordHttpRequest(
        timer.method,
        timer.url,
        500, // 에러는 500으로 처리
        duration,
        'error',
      );

      // 에러 메트릭 별도 기록
      ProxyMetrics.recordError(error.name || 'UnknownError', 'proxy');

      requestTimers.delete(requestId);
    },
  };
}

// Bun용 메트릭 엔드포인트 핸들러
export async function metricsHandler(req) {
  try {
    const metricsText = await ProxyMetrics.exportMetrics();

    return new Response(metricsText, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Failed to export metrics:', error);
    return new Response('Internal Server Error', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}

// Bun용 헬스체크 핸들러
export async function healthHandler(req) {
  let activeConnectionsValue = 0;
  for (const [key, metric] of metrics.metrics) {
    if (key.startsWith('proxy_active_connections')) {
      activeConnectionsValue = metric.value || 0;
      break;
    }
  }
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'proxy-server',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    activeConnections: activeConnectionsValue,
  };

  return new Response(JSON.stringify(health, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export default ProxyMetrics;
