/**
 * 토큰 관리 서비스 (Infrastructure Layer)
 *
 * 서버사이드 전용 토큰 발급 및 쿠키 설정 담당
 */
import { ServerResponse } from 'http';
import { createTokenCookies, TokenResult } from './cookieService';

/**
 * 쿠키 설정을 포함한 토큰 발급 결과
 */
export interface TokenWithCookieResult extends TokenResult {
  cookieSet?: boolean;
}

/**
 * Auth 서비스 응답 타입
 */
interface AuthServiceResponse {
  success: boolean;
  data: {
    access_token: string;
    role: string;
    exp: number;
    iat: number;
  };
}

/**
 * 토큰 서비스 클래스
 */
export class TokenService {
  /**
   * 환경 변수 검증
   */
  private validateEnvironmentVariables(): { authServiceUrl: string; authPrefix: string } {
    const authServiceUrl = process.env.AUTH_SERVICE_URL;
    const authPrefix = process.env.AUTH_PREFIX;

    if (!authServiceUrl) {
      throw new Error('AUTH_SERVICE_URL 환경 변수가 설정되지 않았습니다');
    }

    if (!authPrefix) {
      throw new Error('AUTH_PREFIX 환경 변수가 설정되지 않았습니다');
    }

    return { authServiceUrl, authPrefix };
  }

  /**
   * Auth 서비스 URL 생성
   */
  private buildAuthServiceUrl(): string {
    const { authServiceUrl, authPrefix } = this.validateEnvironmentVariables();
    return `${authServiceUrl}${authPrefix}/guest-token`;
  }

  /**
   * HTTP 요청 헤더 생성
   */
  private createRequestHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'User-Agent': 'NextJS-SSR',
    };
  }

  /**
   * Auth 서비스 API 호출
   */
  private async callAuthService(url: string): Promise<AuthServiceResponse> {
    const response = await fetch(url, {
      method: 'POST',
      headers: this.createRequestHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Auth 서비스 응답 오류: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 에러를 TokenResult 형태로 변환
   */
  private createErrorResult(error: unknown, context: string): TokenResult {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    console.error(`❌ ${context}:`, error);

    return {
      success: false,
      error: errorMessage,
    };
  }

  /**
   * 게스트 토큰 발급
   */
  private async fetchGuestToken(): Promise<TokenResult> {
    try {
      const authUrl = this.buildAuthServiceUrl();
      const { data, success } = await this.callAuthService(authUrl);

      return {
        success,
        data,
      };
    } catch (error) {
      return this.createErrorResult(error, 'Server: 게스트 토큰 발급 에러');
    }
  }

  /**
   * 토큰 발급 결과 검증
   */
  private isValidTokenResult(tokenResult: TokenResult): boolean {
    return tokenResult.success && Boolean(tokenResult.data?.access_token);
  }

  /**
   * 응답 헤더 설정
   */
  private setResponseHeaders(res: ServerResponse, tokenResult: TokenResult): void {
    const cookieHeaders = createTokenCookies(tokenResult);
    const bearerToken = `Bearer ${tokenResult.data?.access_token || ''}`;

    res.setHeader('Set-Cookie', cookieHeaders);
    res.setHeader('Authorization', bearerToken);
  }

  /**
   * 토큰 발급 + 쿠키 설정 통합 함수
   *
   * @description SSR 환경에서 게스트 토큰을 발급하고 쿠키로 설정합니다
   * @param res - ServerResponse 객체
   * @returns 토큰 발급 및 쿠키 설정 결과
   */
  async issueGuestTokenWithCookie(res: ServerResponse): Promise<TokenWithCookieResult> {
    try {
      // 1. 토큰 발급
      const tokenResult = await this.fetchGuestToken();

      // 2. 토큰 발급 실패 시 조기 반환
      if (!this.isValidTokenResult(tokenResult)) {
        return {
          ...tokenResult,
          cookieSet: false,
        };
      }

      // 3. 쿠키 및 헤더 설정
      this.setResponseHeaders(res, tokenResult);

      // 4. 성공 결과 반환
      return {
        ...tokenResult,
        cookieSet: true,
      };
    } catch (error) {
      return {
        ...this.createErrorResult(error, 'SSR: 토큰 발급 및 쿠키 설정 에러'),
        cookieSet: false,
      };
    }
  }
}

// 싱글톤 인스턴스 export
export const tokenService = new TokenService();
