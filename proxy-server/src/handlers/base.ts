import { config } from '../config';
import { ProxyRequestError, createErrorContext } from '../middleware/errorHandler';

export abstract class BaseProxyHandler {
  protected abstract getTargetName(): string;

  protected async proxyRequest(req: Request, targetUrl: string): Promise<Response> {
    try {
      // Keep-alive 헤더를 포함한 최적화된 요청 설정
      const proxyHeaders = new Headers(Object.fromEntries(req.headers.entries()));
      proxyHeaders.set('Connection', 'keep-alive');
      proxyHeaders.set('Keep-Alive', 'timeout=60, max=1000');

      const response = await fetch(targetUrl, {
        method: req.method,
        headers: proxyHeaders,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
        // Bun fetch 최적화 옵션
        keepalive: true,
      });

      if (config.enableRequestLogging) {
        // console.log(
        //   `✅ ${this.getTargetName()} response: ${response.status} ${response.statusText}`,
        // );
      }

      return await this.createProxyResponse(response, req);
    } catch (error) {
      console.error(`${this.getTargetName()} proxy error:`, error);
      const context = createErrorContext(req);
      throw new ProxyRequestError(
        `Failed to connect to ${this.getTargetName()}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        context,
        error instanceof TypeError && error.message.includes('fetch') ? 503 : 502,
      );
    }
  }

  protected async createProxyResponse(response: Response, req: Request): Promise<Response> {
    // Pass-through: 원본 헤더와 본문을 그대로 전달 (CPU 절약)
    const headers = new Headers(response.headers);
    
    // 안전한 메타데이터 헤더만 추가 (크기/압축 관련 헤더는 건드리지 않음)
    headers.set('X-Proxy-Server', 'bun-proxy');
    headers.set('X-Proxy-Target', this.getTargetName().toLowerCase());

    // 원본 응답 그대로 전달 (압축 상태 유지)
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  private isCompressibleContent(contentType: string): boolean {
    const compressibleTypes = [
      'text/html',
      'text/css',
      'text/javascript',
      'application/javascript',
      'application/json',
      'text/plain',
      'application/xml',
      'text/xml',
    ];

    return compressibleTypes.some((type) => contentType.includes(type));
  }
}
