import { config } from '../config';
import { BaseProxyHandler } from './base';
import { ProxyHeaderUtils } from '../utils/proxy-headers';

export class KongHandler extends BaseProxyHandler {
  protected getTargetName(): string {
    return 'Kong Gateway';
  }

  async handleRequest(req: Request, accessToken?: string): Promise<Response> {
    const url = new URL(req.url);
    const targetUrl = `${config.kongGatewayUrl}${url.pathname}${url.search}`;

    // 프록시 헤더 구성 (Authorization 포함)
    const headers = ProxyHeaderUtils.createProxyHeaders(req, accessToken);

    // 토큰 로깅
    // ProxyHeaderUtils.logAuthorizationHeader(accessToken, 'Kong');

    // 수정된 요청 생성
    const modifiedRequest = new Request(req.url, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
    });

    return this.proxyRequest(modifiedRequest, targetUrl);
  }
}

export const kongHandler = new KongHandler();
