import { authService } from '../services/auth';
import { cookieUtils } from '../utils/cookie';
import { LoggingUtils } from '../utils/logging';
import type { TokenData } from '../types';

export interface AuthResult {
  accessToken: string | null;
  newTokenData: TokenData | null;
}

export class AuthMiddleware {
  /**
   * 요청에서 토큰을 추출하거나 새로 발급
   */
  async processAuth(req: Request): Promise<AuthResult> {
    let accessToken: string | null = null;
    let newTokenData: TokenData | null = null;

    // 기존 쿠키에서 토큰 추출
    if (cookieUtils.hasAccessToken(req)) {
      accessToken = cookieUtils.getAccessTokenFromRequest(req);
      // LoggingUtils.logTokenStatus(true, false);
    } else {
      // 토큰이 없으면 게스트 토큰 발급
      // LoggingUtils.logTokenStatus(false, false);

      const tokenData = await authService.issueGuestToken();
      if (tokenData) {
        accessToken = tokenData.access_token;
        newTokenData = tokenData;
        // LoggingUtils.logTokenStatus(true, true);
      } else {
        // LoggingUtils.logTokenStatus(false, true);
      }
    }

    return { accessToken, newTokenData };
  }
}

export const authMiddleware = new AuthMiddleware();
