/**
 * 쿠키 관리 서비스 (Infrastructure Layer)
 *
 * 클라이언트/서버 환경에서 쿠키 관리를 담당합니다.
 * HttpOnly 쿠키를 통한 안전한 토큰 저장 및 조회를 지원합니다.
 */
import type { ProxyLoginResponse, UserRole } from '@/domains/auth/types/auth';
import type { NextApiResponse } from 'next';
import type { NextResponse } from 'next/server';

/**
 * 토큰 결과 인터페이스
 */
export interface TokenResult {
  success: boolean;
  data?: {
    access_token: string;
    role: string;
    exp: number;
    iat: number;
  };
  message?: string;
  error?: string;
}

/**
 * 토큰 데이터 인터페이스
 */
interface TokenData {
  access_token: string;
  role: UserRole;
  exp: number;
  iat: number;
}

/**
 * 쿠키 설정 결과
 */
interface CookieSetResult {
  success: boolean;
  message?: string;
  cookiesSet?: string[];
}

/**
 * 쿠키 보안 옵션 상수
 */
const COOKIE_CONFIG = {
  PATH: '/',
  SAME_SITE: 'Strict' as const,
  HTTP_ONLY: true,
} as const;

/**
 * 쿠키 이름 상수
 */
const COOKIE_NAMES = {
  ACCESS_TOKEN: 'access_token',
  ACCESS_TYPE: 'access_type',
} as const;

/**
 * 쿠키 서비스 클래스
 */
export class CookieService {
  /**
   * 프로덕션 환경 여부 확인
   */
  private isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  /**
   * 기본 쿠키 옵션 생성
   */
  private createBaseCookieOptions(): string[] {
    return [
      'HttpOnly',
      `Path=${COOKIE_CONFIG.PATH}`,
      `SameSite=${COOKIE_CONFIG.SAME_SITE}`,
      ...(this.isProduction() ? ['Secure'] : []),
    ];
  }

  /**
   * 개별 쿠키 문자열 생성
   */
  private createCookie(name: string, value: string, maxAge?: number, httpOnly = true): string {
    const baseOptions = httpOnly
      ? this.createBaseCookieOptions()
      : this.createBaseCookieOptions().filter((o) => o !== 'HttpOnly');
    const options = [`${name}=${encodeURIComponent(value)}`, ...baseOptions];

    if (maxAge && maxAge > 0) {
      options.push(`Max-Age=${maxAge}`);
    }

    return options.join('; ');
  }

  /**
   * 토큰 만료 시간 계산
   */
  private calculateMaxAge(tokenResult: TokenResult): number | undefined {
    if (!tokenResult.data?.exp) return undefined;

    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    let maxAge: number;

    if (tokenResult.data.iat) {
      const tokenLifetime = tokenResult.data.exp - tokenResult.data.iat;
      const elapsedTime = currentTimeInSeconds - tokenResult.data.iat;
      maxAge = Math.max(0, tokenLifetime - elapsedTime);
    } else {
      maxAge = tokenResult.data.exp - currentTimeInSeconds;
    }

    if (maxAge <= 0) {
      console.error('❌ 토큰이 이미 만료되었습니다:', { maxAge });
      return undefined; // Let the caller handle expired tokens
    }

    return maxAge;
  }

  /**
   * 토큰 쿠키 배열 생성
   */
  createTokenCookies(tokenResult: TokenResult): string[] {
    const cookies: string[] = [];
    const maxAge = this.calculateMaxAge(tokenResult);
    if (maxAge !== undefined && tokenResult.data?.access_token) {
      cookies.push(
        this.createCookie(COOKIE_NAMES.ACCESS_TOKEN, tokenResult.data.access_token, maxAge),
      );
    }

    if (tokenResult.data?.role) {
      cookies.push(this.createCookie(COOKIE_NAMES.ACCESS_TYPE, tokenResult.data.role, maxAge));
    }

    return cookies;
  }

  /**
   * 쿠키 문자열 파싱
   */
  private parseCookieString(cookieString: string): [string, string] {
    const [key, value] = cookieString.trim().split('=');
    return [key || '', value || ''];
  }

  /**
   * 쿠키 헤더를 파싱하여 객체로 변환
   */
  private parseServerCookies(cookieHeader: string): Record<string, string> {
    return cookieHeader
      .split(';')
      .map((cookie) => this.parseCookieString(cookie))
      .reduce(
        (acc, [key, value]) => {
          if (key && value) {
            acc[key] = decodeURIComponent(value);
          }
          return acc;
        },
        {} as Record<string, string>,
      );
  }

  /**
   * 클라이언트 쿠키에서 특정 쿠키 찾기
   */
  private findClientCookie(cookieName: string): string | null {
    // 서버 사이드에서는 document가 없으므로 null 반환
    if (typeof window === 'undefined' || typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    const targetCookie = cookies.find((cookie) => cookie.trim().startsWith(`${cookieName}=`));

    if (targetCookie) {
      const [, value] = targetCookie.split('=');
      return value || null;
    }

    return null;
  }

  /**
   * 서버사이드에서 쿠키 헤더로부터 토큰 추출
   */
  getTokenFromHeader(cookieHeader?: string): string | null {
    if (!cookieHeader) return null;

    try {
      const cookies = this.parseServerCookies(cookieHeader);
      return cookies[COOKIE_NAMES.ACCESS_TOKEN] || null;
    } catch (error) {
      console.error('❌ 서버사이드 쿠키 파싱 에러:', error);
      return null;
    }
  }

  /**
   * 클라이언트에서 토큰 조회
   */
  getToken(): string | null {
    return this.findClientCookie(COOKIE_NAMES.ACCESS_TOKEN);
  }

  /**
   * 사용자 역할 조회
   */
  getUserRole(): string | null {
    // 서버 사이드에서는 null 반환 (findClientCookie에서 이미 처리됨)
    return this.findClientCookie(COOKIE_NAMES.ACCESS_TYPE);
  }

  /**
   * 토큰 존재 여부 확인
   */
  hasToken(): boolean {
    return Boolean(this.getToken());
  }

  /**
   * API Response에 토큰 쿠키 설정
   */
  setAuthCookies(res: NextApiResponse, tokenData: TokenData): CookieSetResult {
    try {
      if (!tokenData?.access_token || !tokenData?.role) {
        return {
          success: false,
          message: '토큰 데이터가 불완전합니다 (access_token 또는 role 누락)',
        };
      }

      const tokenResult: TokenResult = {
        success: true,
        data: {
          access_token: tokenData.access_token,
          role: tokenData.role,
          exp: tokenData.exp,
          iat: tokenData.iat,
        },
      };

      const cookies = this.createTokenCookies(tokenResult);
      res.setHeader('Set-Cookie', cookies);

      return {
        success: true,
        message: '쿠키 설정 완료',
        cookiesSet: cookies,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  /**
   * 로그인 응답 데이터에서 토큰을 추출하여 쿠키 설정
   */
  setLoginCookies(res: NextApiResponse, loginResponseData: ProxyLoginResponse): CookieSetResult {
    const tokenData = loginResponseData?.data;

    if (!tokenData) {
      return {
        success: false,
        message: '로그인 응답 데이터에서 토큰 정보를 찾을 수 없습니다',
      };
    }

    return this.setAuthCookies(res, tokenData);
  }

  /**
   * 인증 쿠키 제거
   */
  clearAuthCookies(res: NextApiResponse): CookieSetResult {
    try {
      const expiredCookies = [
        'access_token=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0',
        'access_type=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0',
      ];

      res.setHeader('Set-Cookie', expiredCookies);
      return {
        success: true,
        message: '인증 쿠키 제거 완료',
        cookiesSet: expiredCookies,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  /**
   * Edge Runtime용 토큰 쿠키 설정 (미들웨어용)
   */
  setTokenCookiesEdge(
    response: NextResponse,
    tokenData: { access_token: string; role: string; maxAge: number },
  ): CookieSetResult {
    try {
      if (!tokenData?.access_token || !tokenData?.role) {
        return {
          success: false,
          message: '토큰 데이터가 불완전합니다 (token 또는 role 누락)',
        };
      }

      const cookieOptions = {
        httpOnly: true,
        secure: this.isProduction(),
        sameSite: 'strict' as const,
        path: '/',
        maxAge: tokenData.maxAge,
      };

      response.cookies.set('access_token', tokenData.access_token, cookieOptions);
      response.cookies.set('access_type', tokenData.role, cookieOptions);

      return {
        success: true,
        message: 'Edge Runtime 쿠키 설정 완료',
        cookiesSet: [`access_token=${tokenData.access_token}`, `access_type=${tokenData.role}`],
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }
}

// 싱글톤 인스턴스 export
export const cookieService = new CookieService();

// 하위 호환성을 위한 함수 export
export function createTokenCookies(tokenResult: TokenResult): string[] {
  return cookieService.createTokenCookies(tokenResult);
}

export function setAuthCookies(res: NextApiResponse, tokenData: TokenData): CookieSetResult {
  return cookieService.setAuthCookies(res, tokenData);
}

export function setLoginCookies(
  res: NextApiResponse,
  loginResponseData: ProxyLoginResponse,
): CookieSetResult {
  return cookieService.setLoginCookies(res, loginResponseData);
}

export function clearAuthCookies(res: NextApiResponse): CookieSetResult {
  return cookieService.clearAuthCookies(res);
}

export function setTokenCookiesEdge(
  response: NextResponse,
  tokenData: { access_token: string; role: string; maxAge: number },
): CookieSetResult {
  return cookieService.setTokenCookiesEdge(response, tokenData);
}
