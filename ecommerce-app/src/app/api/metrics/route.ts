import { NextResponse } from 'next/server';

// CPU 사용률 계산을 위한 저장소
let lastCpuUsage = process.cpuUsage();
let lastCpuTime = Date.now();

// 전역 메트릭 클라이언트 캐시
let globalMetricsClient: any = null;

// 메트릭 클라이언트 초기화 함수 (싱글톤)
async function initializeMetricsClient() {
  if (globalMetricsClient) {
    return globalMetricsClient;
  }

  try {
    // Docker 환경에서 복사된 메트릭 모듈 우선 사용
    try {
      const path = require('path');
      const url = require('url');
      const metricsPath = path.join(process.cwd(), 'monitoring', 'nextjs-metrics.mjs');
      const metricsUrl = url.pathToFileURL(metricsPath).href;
      console.log('Attempting to load Docker metrics module from:', metricsUrl);
      // @ts-ignore - Docker runtime에만 존재하는 파일
      const metricsModule = await import(metricsUrl);
      console.log('✅ Using Docker metrics module (already initialized)');
      globalMetricsClient = metricsModule.client;
      return globalMetricsClient;
    } catch (dockerError) {
      console.warn(
        'Docker metrics module not found, using fallback:',
        dockerError instanceof Error ? dockerError.message : dockerError,
      );
    }

    // 폴백: prom-client 직접 사용
    const promClient = await import('prom-client');
    const client = promClient.default;

    // 기존 레지스트리 클리어 (중복 등록 방지)
    client.register.clear();

    // Prometheus 기본 메트릭 수집 활성화
    client.collectDefaultMetrics({
      prefix: 'nextjs_',
    });

    console.log('✅ Using fallback prom-client');
    globalMetricsClient = client;
    return globalMetricsClient;
  } catch (error) {
    console.error('Failed to initialize metrics client:', error);
    throw error;
  }
}

// 메트릭 데이터 가져오기 함수
async function getMetricsData() {
  try {
    // record 엔드포인트의 metricsStore를 직접 import하여 사용
    const { metricsStore } = await import('./record/route');

    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const fiveMinutesAgo = now - 5 * 60 * 1000;

    // 총 요청 수
    const totalRequests = Array.from(metricsStore.requests.values()).reduce(
      (sum, count) => sum + count,
      0,
    );

    // 평균 응답시간
    const allResponseTimes = Array.from(metricsStore.responseTime.values()).flat();
    const avgResponseTime =
      allResponseTimes.length > 0
        ? allResponseTimes.reduce((sum, time) => sum + time, 0) / allResponseTimes.length
        : 0;

    // 시간 윈도우 기반 Request Rate 계산
    const requestsLastFiveMinutes = metricsStore.requestTimestamps.filter(
      (timestamp) => timestamp > fiveMinutesAgo,
    ).length;
    const requestRateFiveMin = Math.round(requestsLastFiveMinutes / 5); // 5분간 평균 분당 요청

    const requestsLastOneMinute = metricsStore.requestTimestamps.filter(
      (timestamp) => timestamp > oneMinuteAgo,
    ).length;
    const requestRateOneMin = requestsLastOneMinute; // 1분간 총 요청

    // 가장 최신의 Request Rate 사용 (1분간 데이터 우선)
    const requestRate = requestsLastOneMinute > 0 ? requestRateOneMin : requestRateFiveMin;

    // 총 에러 수
    const totalErrors = Array.from(metricsStore.errors.values()).reduce(
      (sum, count) => sum + count,
      0,
    );

    // 실행 시간 계산
    const timeElapsed = (now - metricsStore.lastResetTime) / 1000 / 60;

    return {
      totalRequests,
      avgResponseTime: Math.round(avgResponseTime * 100) / 100,
      requestRate,
      requestRateOneMin,
      requestRateFiveMin,
      totalErrors,
      timeElapsed: Math.round(timeElapsed * 100) / 100,
      requestsBreakdown: metricsStore.requests, // 라우트별 요청 수
    };
  } catch (error) {
    console.warn('Failed to fetch metrics data:', error);
  }

  // 기본값 반환
  return {
    totalRequests: 0,
    avgResponseTime: 0,
    requestRate: 0,
    requestRateOneMin: 0,
    requestRateFiveMin: 0,
    totalErrors: 0,
    timeElapsed: 0,
    requestsBreakdown: new Map<string, number>(),
  };
}

// 메트릭 수집 함수
async function getPrometheusMetrics() {
  try {
    // 메트릭 클라이언트 초기화
    const client = await initializeMetricsClient();

    const timestamp = Date.now();
    const memoryUsage = process.memoryUsage();
    const currentCpuUsage = process.cpuUsage();
    const currentTime = Date.now();

    // CPU 사용률 계산 (전체 대비 백분율)
    const timeDiff = (currentTime - lastCpuTime) * 1000; // 마이크로초 단위
    const userCpuPercent = ((currentCpuUsage.user - lastCpuUsage.user) / timeDiff) * 100;
    const systemCpuPercent = ((currentCpuUsage.system - lastCpuUsage.system) / timeDiff) * 100;
    const totalCpuPercent = userCpuPercent + systemCpuPercent;

    // CPU 사용률 업데이트
    lastCpuUsage = currentCpuUsage;
    lastCpuTime = currentTime;

    // 메모리 사용률 계산 (MB 단위)
    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const rssMB = Math.round(memoryUsage.rss / 1024 / 1024);
    const memoryUsagePercent = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);

    // 저장된 메트릭 데이터 가져오기
    const metricsData = await getMetricsData();
    const {
      totalRequests,
      avgResponseTime,
      requestRate,
      requestRateOneMin,
      totalErrors,
      requestsBreakdown,
    } = metricsData;

    // Prometheus 메트릭 형식으로 출력
    const promClientMetrics = await client.register.metrics();

    // Event Loop Lag 측정
    const eventLoopLagStart = process.hrtime.bigint();
    const eventLoopLagPromise = new Promise<number>((resolve) => {
      setImmediate(() => {
        const lag = Number(process.hrtime.bigint() - eventLoopLagStart) / 1e9;
        resolve(lag);
      });
    });
    const eventLoopLag = await eventLoopLagPromise;

    const customMetrics = `
# HELP nextjs_cpu_usage_percent CPU usage percentage
# TYPE nextjs_cpu_usage_percent gauge
nextjs_cpu_usage_percent{service="nextjs-frontend",type="user"} ${userCpuPercent.toFixed(2)}
nextjs_cpu_usage_percent{service="nextjs-frontend",type="system"} ${systemCpuPercent.toFixed(2)}
nextjs_cpu_usage_percent{service="nextjs-frontend",type="total"} ${totalCpuPercent.toFixed(2)}

# HELP nextjs_event_loop_lag_seconds Event loop lag in seconds
# TYPE nextjs_event_loop_lag_seconds gauge
nextjs_event_loop_lag_seconds{service="nextjs-frontend"} ${eventLoopLag.toFixed(6)}

# HELP nextjs_memory_usage_mb Memory usage in megabytes
# TYPE nextjs_memory_usage_mb gauge
nextjs_memory_usage_mb{service="nextjs-frontend",type="heap_used"} ${heapUsedMB}
nextjs_memory_usage_mb{service="nextjs-frontend",type="heap_total"} ${heapTotalMB}
nextjs_memory_usage_mb{service="nextjs-frontend",type="rss"} ${rssMB}

# HELP nextjs_memory_usage_percent Memory usage percentage
# TYPE nextjs_memory_usage_percent gauge
nextjs_memory_usage_percent{service="nextjs-frontend"} ${memoryUsagePercent}

# HELP nextjs_request_rate_per_minute Request rate per minute
# TYPE nextjs_request_rate_per_minute gauge
nextjs_request_rate_per_minute{service="nextjs-frontend",window="5min"} ${requestRate}
nextjs_request_rate_per_minute{service="nextjs-frontend",window="1min"} ${requestRateOneMin || requestRate}

# HELP http_requests_total Total number of HTTP requests (Prometheus Counter format)
# TYPE http_requests_total counter
${Array.from(requestsBreakdown.entries())
  .map(([route, count]) => {
    const [method, path] = route.split(':');
    return `http_requests_total{job="nextjs-frontend",method="${method}",route="${path}",service="nextjs-frontend"} ${count}`;
  })
  .join('\n')}

# HELP nextjs_avg_response_time_ms Average response time in milliseconds
# TYPE nextjs_avg_response_time_ms gauge
nextjs_avg_response_time_ms{service="nextjs-frontend"} ${avgResponseTime.toFixed(2)}

# HELP nextjs_total_requests_current Total requests since last reset
# TYPE nextjs_total_requests_current gauge
nextjs_total_requests_current{service="nextjs-frontend"} ${totalRequests}

# HELP nextjs_total_errors_current Total errors since last reset
# TYPE nextjs_total_errors_current gauge
nextjs_total_errors_current{service="nextjs-frontend"} ${totalErrors}

# HELP nextjs_uptime_seconds Application uptime in seconds
# TYPE nextjs_uptime_seconds gauge
nextjs_uptime_seconds{service="nextjs-frontend"} ${process.uptime()}

# HELP nextjs_metrics_timestamp Current timestamp
# TYPE nextjs_metrics_timestamp gauge
nextjs_metrics_timestamp{service="nextjs-frontend"} ${timestamp}
`;

    return promClientMetrics + customMetrics;
  } catch (error) {
    console.error('Failed to collect metrics:', error);
    return `# Failed to collect metrics
# Error: ${error instanceof Error ? error.message : 'Unknown error'}
`;
  }
}

// 메트릭 기록 함수 (다른 부분에서 호출할 수 있도록) - record 엔드포인트에 위임
export function recordMetric(
  type: string,
  route: string,
  value?: number,
  method?: string,
  status?: number,
) {
  // 이 함수는 record 엔드포인트의 함수와 동일한 기능을 제공
  // 실제 로직은 record/route.ts에 구현되어 있음
  console.log(`📊 Recording metric: ${type} for ${route}`, { value, method, status });
}

export async function GET() {
  try {
    const metrics = await getPrometheusMetrics();

    return new NextResponse(metrics, {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('Metrics endpoint error:', error);

    return new NextResponse(
      `# Error collecting metrics
# ${error instanceof Error ? error.message : 'Unknown error'}
`,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      },
    );
  }
}

export async function POST() {
  return new NextResponse('Method not allowed', { status: 405 });
}

export async function PUT() {
  return new NextResponse('Method not allowed', { status: 405 });
}

export async function DELETE() {
  return new NextResponse('Method not allowed', { status: 405 });
}
