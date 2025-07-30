import { config } from '../config';
import { BaseProxyHandler } from './base';
import { ProxyHeaderUtils } from '../utils/proxy-headers';
import { LoggingUtils } from '../utils/logging';
import { cacheMiddleware } from '../middleware/cache';

export class NextJsHandler extends BaseProxyHandler {
  protected getTargetName(): string {
    return 'Next.js';
  }

  async handleRequest(req: Request, accessToken?: string | undefined): Promise<Response> {
    const url = new URL(req.url);
    const targetUrl = `${config.nextServer}${url.pathname}${url.search}`;

    // GET 요청이고 캐시 가능한 경로인 경우 캐시 확인
    if (req.method === 'GET' && cacheMiddleware.isCacheable(targetUrl)) {
      const cachedContent = await cacheMiddleware.checkCache(targetUrl);
      if (cachedContent) {
        return cacheMiddleware.createCachedResponse(cachedContent);
      }
    }

    // 프록시 헤더 구성 (Authorization 포함)
    const headers = ProxyHeaderUtils.createProxyHeaders(req, accessToken);

    // 토큰 로깅
    // ProxyHeaderUtils.logAuthorizationHeader(accessToken, 'Next.js');

    // 헤더 로깅 (디버깅용)
    const modifiedRequest = new Request(req.url, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
    });

    // LoggingUtils.logRequestHeaders(modifiedRequest, 'Next.js');

    // 실제 요청 프록시
    const response = await this.proxyRequest(modifiedRequest, targetUrl);

    // GET 요청이고 캐시 가능한 경우 응답을 캐시에 저장
    if (req.method === 'GET' && cacheMiddleware.isCacheable(targetUrl)) {
      return await cacheMiddleware.cacheResponse(targetUrl, response);
    }

    return response;
  }
}

export const nextJsHandler = new NextJsHandler();
