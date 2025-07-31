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
    const headers = new Headers(response.headers);
    
    // 메타데이터 헤더 추가
    headers.set('X-Proxy-Server', 'bun-proxy');
    headers.set('X-Proxy-Target', this.getTargetName().toLowerCase());

    // 압축 관련 헤더 제거로 브라우저 디코딩 오류 방지
    const originalEncoding = response.headers.get('content-encoding');
    if (originalEncoding === 'gzip') {
      headers.delete('content-encoding');
      headers.delete('content-length');
      headers.delete('vary');
      
      try {
        // 압축된 응답을 텍스트로 읽기 (자동 해제)
        const decompressedData = await response.text();
        
        return new Response(decompressedData, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      } catch (error) {
        console.error('Decompression failed:', error);
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      }
    }

    // 압축되지 않은 경우 그대로 전달
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
