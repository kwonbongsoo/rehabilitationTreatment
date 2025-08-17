import { NextRequest, NextResponse } from 'next/server';

// 메트릭 저장소 (in-memory) - 시간 윈도우 기반 Request Rate 계산을 위한 개선
const metricsStore = {
  requests: new Map<string, number>(),
  responseTime: new Map<string, number[]>(),
  errors: new Map<string, number>(),
  lastResetTime: Date.now(),
  // Request Rate 계산을 위한 시간 윈도우 (최근 5분간의 요청 기록)
  requestTimestamps: [] as number[],
  // 실시간 요청 카운터 (1분 윈도우)
  minutelyRequests: new Map<number, number>(),
};

// 메트릭 기록 함수 - Request Rate 계산 개선
function recordMetric(type: string, route: string, value?: number, method?: string, status?: number) {
  const key = `${method || 'GET'}:${route}`;
  const now = Date.now();
  
  switch (type) {
    case 'request':
      // 기존 요청 카운터
      metricsStore.requests.set(key, (metricsStore.requests.get(key) || 0) + 1);
      
      // Request Rate 계산을 위한 타임스탬프 기록
      metricsStore.requestTimestamps.push(now);
      
      // 5분(300초) 이전 기록 정리
      const fiveMinutesAgo = now - 300000; // 5분 = 300,000ms
      metricsStore.requestTimestamps = metricsStore.requestTimestamps.filter(timestamp => timestamp > fiveMinutesAgo);
      
      // 분 단위 요청 카운터 업데이트
      const currentMinute = Math.floor(now / 60000); // 분 단위로 버킷팅
      metricsStore.minutelyRequests.set(currentMinute, (metricsStore.minutelyRequests.get(currentMinute) || 0) + 1);
      
      // 10분 이전 분 단위 데이터 정리
      const tenMinutesAgo = currentMinute - 10;
      for (const [minute] of metricsStore.minutelyRequests) {
        if (minute < tenMinutesAgo) {
          metricsStore.minutelyRequests.delete(minute);
        }
      }
      break;
    case 'response_time':
      if (value !== undefined) {
        const times = metricsStore.responseTime.get(key) || [];
        times.push(value);
        // 최근 1000개 응답시간만 유지 (메모리 관리)
        if (times.length > 1000) {
          times.shift();
        }
        metricsStore.responseTime.set(key, times);
      }
      break;
    case 'error':
      if (status && status >= 400) {
        metricsStore.errors.set(key, (metricsStore.errors.get(key) || 0) + 1);
      }
      break;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, route, method, status, duration } = body;

    // 메트릭 기록
    if (type === 'request') {
      recordMetric('request', route, undefined, method, status);
      
      // 응답 시간도 함께 기록
      if (duration !== undefined) {
        recordMetric('response_time', route, duration, method);
      }
      
      // 에러도 함께 기록
      if (status >= 400) {
        recordMetric('error', route, undefined, method, status);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to record metric:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record metric' },
      { status: 500 }
    );
  }
}

// 메트릭 데이터 조회 (내부용)
export async function GET() {
  try {
    // 총 요청 수
    const totalRequests = Array.from(metricsStore.requests.values()).reduce((sum, count) => sum + count, 0);
    
    // 평균 응답 시간
    const allResponseTimes = Array.from(metricsStore.responseTime.values()).flat();
    const avgResponseTime = allResponseTimes.length > 0 
      ? allResponseTimes.reduce((sum, time) => sum + time, 0) / allResponseTimes.length 
      : 0;
    
    // 개선된 요청 비율 계산 (분당) - 최근 5분간의 실제 요청을 기반으로
    const now = Date.now();
    const fiveMinutesAgo = now - 300000; // 5분
    const oneMinuteAgo = now - 60000; // 1분
    
    // 최근 5분간 Request Rate (분당)
    const requestsLastFiveMinutes = metricsStore.requestTimestamps.filter(timestamp => timestamp > fiveMinutesAgo).length;
    const requestRateFiveMin = Math.round(requestsLastFiveMinutes / 5); // 5분간 평균
    
    // 최근 1분간 Request Rate (초당에서 분당으로 변환)
    const requestsLastOneMinute = metricsStore.requestTimestamps.filter(timestamp => timestamp > oneMinuteAgo).length;
    const requestRateOneMin = requestsLastOneMinute; // 1분간 총 요청
    
    // 현재 분 단위 실시간 Request Rate
    const currentMinute = Math.floor(now / 60000);
    const currentMinuteRequests = metricsStore.minutelyRequests.get(currentMinute) || 0;
    
    // 가장 최신의 Request Rate 사용 (1분간 데이터 우선)
    const requestRate = requestsLastOneMinute > 0 ? requestRateOneMin : requestRateFiveMin;
    
    // 총 에러 수
    const totalErrors = Array.from(metricsStore.errors.values()).reduce((sum, count) => sum + count, 0);
    
    return NextResponse.json({
      totalRequests,
      avgResponseTime: Math.round(avgResponseTime * 100) / 100,
      requestRate,
      requestRateFiveMin,
      requestRateOneMin,
      currentMinuteRequests,
      totalErrors,
      timeElapsed: Math.round((now - metricsStore.lastResetTime) / 1000 / 60 * 100) / 100,
      lastResetTime: metricsStore.lastResetTime,
      recentRequestCount: metricsStore.requestTimestamps.length,
    });
  } catch (error) {
    console.error('Failed to get metrics:', error);
    return NextResponse.json(
      { error: 'Failed to get metrics' },
      { status: 500 }
    );
  }
}

// 메트릭 초기화 (관리용)
export async function DELETE() {
  try {
    metricsStore.requests.clear();
    metricsStore.responseTime.clear();
    metricsStore.errors.clear();
    metricsStore.lastResetTime = Date.now();
    
    return NextResponse.json({ success: true, message: 'Metrics reset' });
  } catch (error) {
    console.error('Failed to reset metrics:', error);
    return NextResponse.json(
      { error: 'Failed to reset metrics' },
      { status: 500 }
    );
  }
}

// 모듈 내보내기 (다른 파일에서 사용할 수 있도록)
export { metricsStore, recordMetric };