import { config } from '../config';
import { BaseProxyHandler } from './base';
import { ProxyHeaderUtils } from '../utils/proxy-headers';
import { BaseError, ErrorCode } from '../common/errors';

export class KongHandler extends BaseProxyHandler {
  protected getTargetName(): string {
    return 'Kong Gateway';
  }

  async handleRequest(req: Request, accessToken?: string): Promise<Response> {
    const url = new URL(req.url);
    const targetUrl = `${config.kongGatewayUrl}${url.pathname}${url.search}`;

    try {
      // 프록시 헤더 구성 (Authorization 포함)
      const headers = ProxyHeaderUtils.createProxyHeaders(req, accessToken);

      // 수정된 요청 생성
      const modifiedRequest = new Request(req.url, {
        method: req.method,
        headers,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      });

      return await this.proxyRequest(modifiedRequest, targetUrl);
    } catch (error) {
      console.error('Kong handler error:', error);
      
      if (error instanceof BaseError) {
        throw error;
      }
      
      // Kong Gateway 특화 에러 처리
      if (error instanceof Error) {
        if (error.message.includes('ECONNREFUSED')) {
          throw new BaseError(
            ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE,
            'Kong Gateway is unavailable',
            { context: { targetUrl, method: req.method } },
            503
          );
        }
        
        if (error.message.includes('timeout')) {
          throw new BaseError(
            ErrorCode.EXTERNAL_SERVICE_TIMEOUT,
            'Kong Gateway request timeout',
            { context: { targetUrl, method: req.method } },
            504
          );
        }
      }
      
      throw new BaseError(
        ErrorCode.EXTERNAL_SERVICE_ERROR,
        'Failed to process Kong Gateway request',
        { context: { targetUrl, method: req.method, error: error instanceof Error ? error.message : 'Unknown error' } },
        502
      );
    }
  }
}

export const kongHandler = new KongHandler();
