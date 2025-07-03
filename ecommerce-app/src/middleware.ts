/**
 * Next.js 미들웨어 - 토큰 관리 및 인증 처리
 *
 * Edge Runtime에서 실행되어 빠른 성능 제공
 * 조건부 게스트 토큰 발급 및 인증 검증
 */
import { setTokenCookiesEdge } from '@/domains/auth/services';
import { NextRequest, NextResponse } from 'next/server';

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
];

/**
 * 인증된 유저가 접근하면 안 되는 페이지들 (로그인/회원가입/비밀번호 찾기)
 */
const AUTH_RESTRICTED_ROUTES = ['/auth/login', '/auth/register', '/auth/forgot-password'];

/**
 * 쿠키에서 토큰 추출
 */
function getTokenFromCookies(request: NextRequest): string | null {
  return request.cookies.get('access_token')?.value || null;
}

/**
 * 쿠키에서 유저 역할 추출
 */
function getUserRoleFromCookies(request: NextRequest): string | null {
  return request.cookies.get('access_type')?.value || null;
}

/**
 * 토큰이 유효한 인증된 유저인지 확인 (게스트 제외)
 */
function isAuthenticatedUser(request: NextRequest): boolean {
  const token = getTokenFromCookies(request);
  const role = getUserRoleFromCookies(request);

  // 토큰이 있고, 역할이 'guest'가 아닌 경우만 인증된 유저로 판단
  return Boolean(token && role && role !== 'guest');
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
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-Middleware',
        Authorization: `Basic ${btoa(`${authBasicKey}`)}`,
      },
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
    const maxAge = Math.max(0, tokenLifetime - elapsedTime);

    return {
      access_token: data.data.access_token,
      role: data.data.role || 'guest',
      maxAge,
    };
  } catch (error) {
    throw new Error('Failed to issue guest token');
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPrefetch = request.headers.get('x-nextjs-data') === '1';

  if (isPrefetch || SKIP_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  try {
    // 🚀 인증된 유저가 인증 페이지에 접근하려는 경우 홈으로 리다이렉트
    if (AUTH_RESTRICTED_ROUTES.includes(pathname)) {
      if (isAuthenticatedUser(request)) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    const token = getTokenFromCookies(request);

    if (!token) {
      const tokenData = await issueGuestToken();
      if (tokenData) {
        const response = NextResponse.next();
        setTokenCookiesEdge(response, tokenData);
        return response;
      }
    }
    return NextResponse.next();
  } catch (error) {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
