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

    // RSC 요청인지 확인
    const isRSCRequest = url.searchParams.has('_rsc');

    // HTML 요청이고 캐시 가능한 경우에만 캐시 확인
    if (!isRSCRequest && req.method === 'GET' && cacheMiddleware.isCacheable(targetUrl)) {
      const cachedData = await cacheMiddleware.checkCache(targetUrl, 'text/html');
      if (cachedData) {
        return cacheMiddleware.createCachedResponse(cachedData.content, cachedData.headers);
      }
    }

    // 프록시 헤더 구성 (Authorization 포함)
    const headers = ProxyHeaderUtils.createProxyHeaders(req, accessToken);

    // 헤더 로깅 (디버깅용)
    const modifiedRequest = new Request(req.url, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
    });

    // LoggingUtils.logRequestHeaders(modifiedRequest, 'Next.js');

    // 실제 요청 프록시
    const response = await this.proxyRequest(modifiedRequest, targetUrl);

    // HTML 요청이고 캐시 가능한 경우에만 응답을 캐시에 저장
    if (!isRSCRequest && req.method === 'GET' && cacheMiddleware.isCacheable(targetUrl)) {
      return await cacheMiddleware.cacheResponse(targetUrl, response);
    }

    return response;
  }
}

export const nextJsHandler = new NextJsHandler();
