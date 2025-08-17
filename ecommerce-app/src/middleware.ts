/**
 * Next.js 미들웨어 - 토큰 관리 및 인증 처리
 *
 * Edge Runtime에서 실행되어 빠른 성능 제공
 * 조건부 게스트 토큰 발급 및 인증 검증
 *
 * 참고: HTTP 메트릭은 글로벌 메트릭 시스템(/monitoring/application-metrics/)에서 수집
 */
import { setTokenCookiesEdge } from '@/domains/auth/services';
import { NextRequest, NextResponse } from 'next/server';
import { HeaderBuilderFactory } from '@/lib/server/headerBuilder';

/**
 * 토큰 확인을 건너뛸 경로들 - API 요청, JSON 파일, 정적 파일 접근
 */
const SKIP_ROUTES = [
  '/_next/',
  '/favicon.ico',
  '/public/',
  '/static/',
  '.json', // JSON 파일 요청들
  '.xml', // XML 파일들 (sitemap 등)
  '.txt', // 텍스트 파일들 (robots.txt 등)
  '.ico', // 아이콘 파일들
  '/manifest', // PWA manifest 파일들
  '/sitemap', // 사이트맵 파일들
  '/.well-known',
  '/_next/static/', // 명시적 추가
  '/_next/image/', // 명시적 추가
  '/api/metrics', // 메트릭 엔드포인트는 모니터링에서 제외
];

/**
 * 쿠키에서 토큰 추출
 */
function getTokenFromCookies(request: NextRequest): string | null {
  return request.cookies.get('access_token')?.value || null;
}

/**
 * HTTP 메트릭 기록 함수 (Edge Runtime 호환)
 */
async function recordHttpMetric(
  method: string,
  route: string,
  status: number,
  duration: number,
  request: NextRequest,
): Promise<void> {
  try {
    // Edge Runtime에서는 절대 URL이 필요
    const baseUrl = new URL(request.url).origin;
    const metricUrl = `${baseUrl}/api/metrics/record`;
    
    // API 엔드포인트로 메트릭 전송 (백그라운드)
    if (typeof fetch !== 'undefined') {
      fetch(metricUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'request',
          route,
          method,
          status,
          duration: duration * 1000, // 밀리초로 변환
        }),
      }).catch(() => {
        // 메트릭 기록 실패는 조용히 무시
      });
    }
    
    // 개발 환경에서 로그 출력
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Next.js Metric: ${method} ${route} - ${status} (${duration.toFixed(3)}s)`);
    }
  } catch {
    // 메트릭 기록 실패는 조용히 무시
  }
}

/**
 * 게스트 토큰 발급 API 호출
 */
async function issueGuestToken(): Promise<{
  access_token: string;
  role: string;
  maxAge: number;
} | null> {
  const authServiceUrl = process.env.AUTH_SERVICE_URL;
  const authPrefix = process.env.AUTH_PREFIX;
  const authBasicKey = process.env.AUTH_BASIC_KEY;

  if (!authServiceUrl || !authPrefix || !authBasicKey) {
    throw new Error('Auth service configuration is missing');
  }

  try {
    const requestUrl = `${authServiceUrl}${authPrefix}/guest-token`;
    const headers = await HeaderBuilderFactory.createForMiddlewareBasicAuth().build();

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Guest token API failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success || !data.data?.access_token) {
      throw new Error('Invalid auth service response');
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const tokenLifetime = data.data.exp - data.data.iat;
    const elapsedTime = currentTime - data.data.iat;
    const remainingTime = Math.max(0, tokenLifetime - elapsedTime);
    const maxAge = Math.max(0, remainingTime - 60); // 1분(60초) 일찍 만료

    return {
      access_token: data.data.access_token,
      role: data.data.role || 'guest',
      maxAge,
    };
  } catch {
    throw new Error('Failed to issue guest token');
  }
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const { pathname } = request.nextUrl;
  const method = request.method;
  const isPrefetch = request.headers.get('x-nextjs-data') === '1';

  // Health check 및 웜업 요청 감지
  const userAgent = request.headers.get('User-Agent') || '';
  const healthCheckPatterns = [
    'health',
    'ping',
    'monitor',
    'check',
    'probe',
    'ELB-HealthChecker', // AWS ALB
    'GoogleHC', // Google Load Balancer
    'kube-probe', // Kubernetes
    'Warmup-Request', // 내부 웜업 요청
  ];
  const isHealthCheck = healthCheckPatterns.some((pattern) =>
    userAgent.toLowerCase().includes(pattern.toLowerCase()),
  );

  if (isPrefetch || isHealthCheck || SKIP_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  try {
    const response = NextResponse.next();

    const token = getTokenFromCookies(request);

    if (!token) {
      const tokenData = await issueGuestToken();
      if (tokenData) {
        setTokenCookiesEdge(response, tokenData);
      }
    }

    // HTTP 메트릭 기록 (백그라운드에서 실행, await 제거하여 블로킹 방지)
    const duration = (Date.now() - startTime) / 1000;
    const normalizedRoute = pathname.replace(/\/\d+/g, '/:id'); // ID를 일반화

    // 백그라운드에서 메트릭 기록 (블로킹하지 않음)
    recordHttpMetric(method, normalizedRoute, response.status || 200, duration, request).catch(() => {
      // 메트릭 기록 실패는 조용히 무시
    });

    return response;
  } catch {
    // 에러 발생 시에도 메트릭 기록
    const duration = (Date.now() - startTime) / 1000;
    const normalizedRoute = pathname.replace(/\/\d+/g, '/:id');
    recordHttpMetric(method, normalizedRoute, 500, duration, request);

    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/metrics|metric-api).*)'],
};
