import { NextRequest, NextResponse } from 'next/server';

// 메트릭 기록 함수 (record API 호출)
async function recordRequestMetric(
  method: string,
  route: string,
  status: number,
  duration: number,
) {
  try {
    // 내부 API 호출이므로 async하게 처리 (응답 속도에 영향 주지 않음)
    fetch('/api/metrics/record', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'request',
        route: normalizeRoute(route),
        method,
        status,
        duration,
      }),
    }).catch((error) => {
      console.warn('Failed to record request metric:', error);
    });
  } catch (error) {
    console.warn('Failed to record request metric:', error);
  }
}

// 라우트 정규화 (개인정보 제거, 동적 라우트 통합)
function normalizeRoute(route: string): string {
  return (
    route
      .replace(/\/\d+/g, '/[id]') // 숫자 ID를 [id]로 치환
      .replace(/\/[a-f0-9-]{36}/g, '/[uuid]') // UUID를 [uuid]로 치환
      .replace(/\?.*$/, '') // 쿼리 파라미터 제거
      .split('/')
      .slice(0, 4) // 최대 4 depth까지만
      .join('/') || '/'
  );
}

// Next.js API 라우트용 메트릭 미들웨어
export function withMetrics<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse> | NextResponse,
) {
  return async (...args: T): Promise<NextResponse> => {
    const startTime = Date.now();
    const request = args[0] as NextRequest;
    const method = request.method;
    const route = request.nextUrl.pathname;

    try {
      const response = await handler(...args);
      const duration = Date.now() - startTime;
      const status = response.status;

      // 메트릭 비동기 기록 (응답 속도에 영향 없음)
      recordRequestMetric(method, route, status, duration);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const status = 500;

      // 에러도 메트릭에 기록
      recordRequestMetric(method, route, status, duration);

      throw error;
    }
  };
}

// Higher-order function으로 사용할 수 있는 메트릭 래퍼
export function metricsWrapper<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse> | NextResponse,
) {
  return withMetrics(handler);
}

// 기본 내보내기
export default withMetrics;
