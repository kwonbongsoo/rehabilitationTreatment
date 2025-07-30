import { cookieUtils } from '../utils/cookie';
import { LoggingUtils } from '../utils/logging';
import { authMiddleware } from '../middleware/auth';
import { kongHandler } from './kong';
import { nextJsHandler } from './nextjs';

export class ProxyHandler {
  async handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);

    // 1. 인증 처리 (토큰 추출 또는 발급)
    const { accessToken, newTokenData } = await authMiddleware.processAuth(req);

    // 2. URL 기반 라우팅
    let response: Response;

    if (url.pathname.startsWith('/api/')) {
      // API 요청 -> Kong Gateway로 프록시
      LoggingUtils.logRouting(url.pathname, 'API', '🐉');
      response = await kongHandler.handleRequest(req, accessToken ?? undefined);
    } else {
      // 페이지 요청 -> Next.js로 프록시
      // LoggingUtils.logRouting(url.pathname, 'page', '⚛️');
      response = await nextJsHandler.handleRequest(req, accessToken ?? undefined);
    }

    // 3. 새 토큰 발급 시 쿠키 설정
    if (newTokenData) {
      return cookieUtils.setTokenCookies(response, newTokenData);
    }

    return response;
  }
}

export const proxyHandler = new ProxyHandler();
