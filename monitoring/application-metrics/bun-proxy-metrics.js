// Bun Proxy Server 메트릭 (Bun 런타임용)

// Bun에서는 prom-client 대신 간단한 메트릭 수집기 구현
class MetricsCollector {
  constructor() {
    this.metrics = new Map();
    this.startTime = Date.now();
  }

  // 카운터 메트릭
  incrementCounter(name, labels = {}) {
    const key = this.createKey(name, labels);
    const current = this.metrics.get(key) || { type: 'counter', value: 0, labels };
    current.value += 1;
    current.timestamp = Date.now();
    this.metrics.set(key, current);
  }

  // 히스토그램 메트릭 (간단 구현)
  recordHistogram(name, value, labels = {}) {
    const key = this.createKey(name, labels);
    const current = this.metrics.get(key) || { 
      type: 'histogram', 
      values: [], 
      labels,
      count: 0,
      sum: 0
    };
    
    current.values.push(value);
    current.count += 1;
    current.sum += value;
    current.timestamp = Date.now();
    
    // 최근 1000개 값만 유지 (메모리 절약)
    if (current.values.length > 1000) {
      current.values = current.values.slice(-1000);
    }
    
    this.metrics.set(key, current);
  }

  // 게이지 메트릭
  setGauge(name, value, labels = {}) {
    const key = this.createKey(name, labels);
    this.metrics.set(key, {
      type: 'gauge',
      value,
      labels,
      timestamp: Date.now()
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
        } else if (metric.type === 'histogram') {
          // 히스토그램의 경우 count, sum, bucket 정보 제공
          output += `${metric.key.replace('}', '_count}')} ${metric.count}\n`;
          output += `${metric.key.replace('}', '_sum}')} ${metric.sum}\n`;
          
          // 간단한 백분위수 계산
          if (metric.values.length > 0) {
            const sorted = [...metric.values].sort((a, b) => a - b);
            const p95 = sorted[Math.floor(sorted.length * 0.95)];
            const p99 = sorted[Math.floor(sorted.length * 0.99)];
            
            output += `${metric.key.replace('}', '_p95}')} ${p95 || 0}\n`;
            output += `${metric.key.replace('}', '_p99}')} ${p99 || 0}\n`;
          }
        }
      }
      output += '\n';
    }

    return output;
  }

  getHelpText(name) {
    const helpTexts = {
      'proxy_http_requests_total': 'Total HTTP requests handled by proxy',
      'proxy_http_request_duration_seconds': 'HTTP request duration in seconds',
      'proxy_cache_operations_total': 'Total cache operations',
      'proxy_cache_hit_ratio': 'Cache hit ratio',
      'proxy_upstream_requests_total': 'Total requests forwarded to upstream',
      'proxy_upstream_request_duration_seconds': 'Upstream request duration',
      'proxy_guest_tokens_total': 'Total guest tokens issued',
      'proxy_memory_usage_bytes': 'Memory usage in bytes',
      'proxy_active_connections': 'Number of active connections'
    };
    return helpTexts[name] || `Metric ${name}`;
  }

  // 메트릭 리셋 (개발용)
  reset() {
    this.metrics.clear();
  }

  // 기본 시스템 메트릭 업데이트
  updateSystemMetrics() {
    const memUsage = process.memoryUsage();
    this.setGauge('proxy_memory_usage_bytes', memUsage.rss, { type: 'rss' });
    this.setGauge('proxy_memory_usage_bytes', memUsage.heapUsed, { type: 'heap_used' });
    this.setGauge('proxy_memory_usage_bytes', memUsage.heapTotal, { type: 'heap_total' });
    
    // 업타임
    const uptimeSeconds = (Date.now() - this.startTime) / 1000;
    this.setGauge('proxy_uptime_seconds', uptimeSeconds);
  }
}

// 글로벌 메트릭 수집기 인스턴스
const metrics = new MetricsCollector();

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
      service: 'proxy-server'
    };

    metrics.incrementCounter('proxy_http_requests_total', labels);
    metrics.recordHistogram('proxy_http_request_duration_seconds', duration, {
      method,
      path: this.normalizePath(path),
      service: 'proxy-server'
    });
  }

  static recordCacheOperation(operation, status, cacheType = 'html') {
    metrics.incrementCounter('proxy_cache_operations_total', {
      operation, // hit, miss, set, delete
      status,    // success, failure
      cache_type: cacheType,
      service: 'proxy-server'
    });
  }

  static updateCacheHitRatio(hitRatio, cacheType = 'html') {
    metrics.setGauge('proxy_cache_hit_ratio', hitRatio, {
      cache_type: cacheType,
      service: 'proxy-server'
    });
  }

  static recordUpstreamRequest(target, statusCode, duration, success = true) {
    metrics.incrementCounter('proxy_upstream_requests_total', {
      target,
      status_code: statusCode.toString(),
      success: success.toString(),
      service: 'proxy-server'
    });

    metrics.recordHistogram('proxy_upstream_request_duration_seconds', duration, {
      target,
      service: 'proxy-server'
    });
  }

  static recordGuestToken(operation = 'issued') {
    metrics.incrementCounter('proxy_guest_tokens_total', {
      operation, // issued, refreshed, expired
      service: 'proxy-server'
    });
  }

  static updateActiveConnections(count) {
    metrics.setGauge('proxy_active_connections', count, {
      service: 'proxy-server'
    });
  }

  // URL 경로 정규화 (개인정보 제거)
  static normalizePath(path) {
    return path
      .replace(/\/\d+/g, '/:id')  // 숫자 ID를 :id로 치환
      .replace(/\?.*$/, '')       // 쿼리 파라미터 제거
      .split('/')
      .slice(0, 3)                // 최대 3 depth까지만
      .join('/') || '/';
  }

  // 메트릭 내보내기
  static async exportMetrics() {
    return metrics.toPrometheusFormat();
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
      avg: durations.reduce((a, b) => a + b, 0) / durations.length
    };
  }
}

// 메트릭 미들웨어 함수
export function createMetricsMiddleware() {
  let activeConnections = 0;

  return async (req, res, next) => {
    const startTime = Date.now();
    activeConnections++;
    ProxyMetrics.updateActiveConnections(activeConnections);

    try {
      await next();
    } finally {
      activeConnections--;
      ProxyMetrics.updateActiveConnections(activeConnections);
      
      const duration = (Date.now() - startTime) / 1000;
      const cacheStatus = res.headers?.['x-cache-status'] || 'miss';
      
      ProxyMetrics.recordHttpRequest(
        req.method,
        req.url,
        res.statusCode || 500,
        duration,
        cacheStatus
      );
    }
  };
}

// 메트릭 엔드포인트 핸들러
export async function metricsHandler(req, res) {
  try {
    const metricsText = await ProxyMetrics.exportMetrics();
    
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end(metricsText);
  } catch (error) {
    console.error('Failed to export metrics:', error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}

// 헬스체크 핸들러
export async function healthHandler(req, res) {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'proxy-server',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    activeConnections: metrics.metrics.get('proxy_active_connections')?.value || 0
  };

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(health, null, 2));
}

export default ProxyMetrics;