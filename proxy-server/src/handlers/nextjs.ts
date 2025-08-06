import { config } from '../config';
import { BaseProxyHandler } from './base';
import { ProxyHeaderUtils } from '../utils/proxy-headers';
import { LoggingUtils } from '../utils/logging';
import { cacheMiddleware } from '../middleware/cache';
import { BaseError, ErrorCode } from '../common/errors';

export class NextJsHandler extends BaseProxyHandler {
  protected getTargetName(): string {
    return 'Next.js';
  }

  async handleRequest(req: Request, accessToken?: string | undefined): Promise<Response> {
    const url = new URL(req.url);
    const targetUrl = `${config.nextServer}${url.pathname}${url.search}`;

    try {
      // RSC 요청인지 확인
      const isRSCRequest = url.searchParams.has('_rsc');

      // HTML 요청이고 캐시 가능한 경우에만 캐시 확인
      if (!isRSCRequest && req.method === 'GET' && cacheMiddleware.isCacheable(targetUrl)) {
        try {
          const cachedData = await cacheMiddleware.checkCache(targetUrl, 'text/html');
          if (cachedData) {
            return cacheMiddleware.createCachedResponse(cachedData.content, cachedData.headers);
          }
        } catch (cacheError) {
          console.warn('Cache check error:', cacheError);
          // 캐시 오류 시에도 계속 진행
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
        try {
          // HTML 응답이고 성공 상태인지 검증 후 캐시
          if (this.isValidHtmlResponse(response)) {
            return await cacheMiddleware.cacheResponse(targetUrl, response);
          }
        } catch (cacheError) {
          console.warn('Cache save error:', cacheError);
          // 캐시 저장 실패해도 원본 응답 반환
        }
      }

      return response;
    } catch (error) {
      console.error('NextJS handler error:', error);
      
      if (error instanceof BaseError) {
        throw error;
      }
      
      // 네트워크 에러 등 기타 에러 처리
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new BaseError(
          ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE,
          'Next.js server is unavailable',
          { context: { url: targetUrl, method: req.method } },
          503
        );
      }
      
      if (error instanceof Error && error.message.includes('timeout')) {
        throw new BaseError(
          ErrorCode.EXTERNAL_SERVICE_TIMEOUT,
          'Next.js server request timeout',
          { context: { url: targetUrl, method: req.method } },
          504
        );
      }
      
      throw new BaseError(
        ErrorCode.EXTERNAL_SERVICE_ERROR,
        'Failed to process Next.js request',
        { context: { url: targetUrl, method: req.method, error: error instanceof Error ? error.message : 'Unknown error' } },
        502
      );
    }
  }

  private isValidHtmlResponse(response: Response): boolean {
    // 성공 상태 코드 확인
    if (!response.ok) {
      return false;
    }
    
    // Content-Type이 HTML인지 확인
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return false;
    }
    
    // Next.js 에러 페이지나 404 페이지는 캐시하지 않음
    if (response.status === 404 || response.status >= 400) {
      return false;
    }
    
    return true;
  }
}

export const nextJsHandler = new NextJsHandler();
