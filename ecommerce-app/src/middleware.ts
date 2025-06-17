/**
 * Next.js 미들웨어 - 토큰 관리 및 인증 처리
 *
 * Edge Runtime에서 실행되어 빠른 성능 제공
 * 조건부 게스트 토큰 발급 및 인증 검증
 */
import { NextRequest, NextResponse } from 'next/server';

/**
 * 토큰 확인이 필요한 경로들
 */
const PROTECTED_ROUTES = ['/profile', '/orders', '/cart', '/checkout'];

/**
 * 토큰 확인을 건너뛸 경로들 - API 요청, JSON 파일, 정적 파일 접근
 */
const SKIP_ROUTES = [
  '/api/',
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
];

/**
 * Retrieves the access token from the request cookies.
 *
 * @returns The access token string if present, otherwise `null`.
 */
function getTokenFromCookies(request: NextRequest): string | null {
  return request.cookies.get('access_token')?.value || null;
}
/**
 * Requests and returns a guest authentication token from the external auth service.
 *
 * Reads configuration from environment variables and sends a POST request to the guest-token endpoint with Basic authentication.
 * If successful, returns an object containing the token, role, and remaining max age in seconds; otherwise, returns null.
 *
 * @returns An object with the guest token, role, and maxAge in seconds, or null if issuance fails.
 *
 * @remark Returns null if required environment variables are missing, the API request fails, or the response is invalid.
 */
async function issueGuestToken(): Promise<{ token: string; role: string; maxAge: number } | null> {
  try {
    const authServiceUrl = process.env.AUTH_SERVICE_URL;
    const authPrefix = process.env.AUTH_PREFIX;
    if (!authServiceUrl || !authPrefix) {
      console.error('❌ [Middleware] Auth service configuration missing:', {
        authServiceUrl: !!authServiceUrl,
        authPrefix: !!authPrefix,
      });
      return null;
    }
    const authBasicKey = process.env.AUTH_BASIC_KEY;

    if (!authBasicKey) {
      console.error('❌ [Middleware] Auth basic key missing');
      return null;
    }

    const requestUrl = `${authServiceUrl}${authPrefix}/guest-token`;
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-Middleware',
        Authorization: `Basic ${authBasicKey}`,
      },
    });
    if (!response.ok) {
      console.error(
        `❌ [Middleware] Guest token API failed: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const data = await response.json();
    // Auth 서비스 응답 구조 검증
    if (!data.success || !data.data?.token) {
      console.error('❌ [Middleware] Invalid auth service response:', data);
      return null;
    }

    // 토큰 만료 시간 계산 (iat 기반)
    const currentTime = Math.floor(Date.now() / 1000);
    const tokenLifetime = data.data.exp - data.data.iat;
    const elapsedTime = currentTime - data.data.iat;
    const maxAge = Math.max(0, tokenLifetime - elapsedTime);

    return {
      token: data.data.token,
      role: data.data.role || 'guest',
      maxAge,
    };
  } catch (error) {
    console.error('❌ [Middleware] Guest token issuance failed:', error);
    return null;
  }
}

/**
 * Sets HTTP-only cookies for the access token and user role on the response.
 *
 * @param response - The outgoing response to which cookies will be attached.
 * @param tokenData - An object containing the token string, user role, and cookie max age in seconds.
 *
 * @remark
 * Cookies are set as secure only in production environments.
 */
function setTokenCookies(
  response: NextResponse,
  tokenData: { token: string; role: string; maxAge: number },
): void {
  const isProduction = process.env.NODE_ENV === 'production';

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
    path: '/',
    maxAge: tokenData.maxAge,
  };

  response.cookies.set('access_token', tokenData.token, cookieOptions);
  response.cookies.set('access_type', tokenData.role, cookieOptions);
}

/**
 * Middleware for conditional token management and guest token issuance.
 *
 * For protected routes, issues a guest token and sets authentication cookies if no token is present. Skips token checks for specified static and API routes. Allows all requests to proceed without blocking or redirecting.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 건너뛸 경로 확인
  if (SKIP_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const token = getTokenFromCookies(request);

  // 보호된 라우트 확인
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route)); // 토큰이 없는 경우에만 게스트 토큰 발급
  if (!token) {
    const tokenData = await issueGuestToken();
    if (tokenData) {
      const response = NextResponse.next();
      setTokenCookies(response, tokenData);
      return response;
    } else {
      return NextResponse.next(); // 실패해도 계속 진행
    }
  }

  // 토큰이 있는 경우 - 조용히 통과 (리다이렉트 없음)
  return NextResponse.next();
}

/**
 * 미들웨어가 실행될 경로 설정
 */
export const config = {
  matcher: [
    /*
     * 다음 경로들을 제외한 모든 요청에 대해 실행:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
