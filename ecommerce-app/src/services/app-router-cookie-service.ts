import { NextResponse } from 'next/server';
import type { ProxyLoginResponse } from '@/api/models/auth';

/**
 * App Router용 쿠키 설정 옵션
 */
interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
  path?: string;
}

/**
 * App Router용 로그인 쿠키 설정
 */
export function setAppRouterLoginCookies(
  response: NextResponse,
  loginData: ProxyLoginResponse,
): void {
  const isProduction = process.env.NODE_ENV === 'production';

  const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7일
  };

  // 액세스 토큰 설정
  if (loginData.data.access_token) {
    response.cookies.set('access_token', loginData.data.access_token, cookieOptions);
  }

  // 역할 정보 설정 (HttpOnly가 아닌 쿠키로, 클라이언트에서 접근 가능)
  if (loginData.data.role) {
    response.cookies.set('access_type', loginData.data.role, {
      ...cookieOptions,
      httpOnly: false, // 클라이언트에서 접근 가능
      maxAge: 60 * 60 * 24 * 7, // 7일
    });
  }
}

/**
 * App Router용 로그아웃 쿠키 삭제
 */
export function clearAppRouterAuthCookies(response: NextResponse): void {
  const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // 즉시 삭제
  };

  // 모든 인증 관련 쿠키 삭제
  response.cookies.set('access_token', '', cookieOptions);
  response.cookies.set('access_type', '', {
    ...cookieOptions,
    httpOnly: false,
  });
}
