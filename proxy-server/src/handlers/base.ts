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
    headers.set('X-Proxy-Server', 'bun-proxy');
    headers.set('X-Proxy-Target', this.getTargetName().toLowerCase());

    const contentType = headers.get('content-type') || '';
    const originalEncoding = response.headers.get('content-encoding');

    // 이미 압축된 응답이면 압축 헤더를 제거하고 압축 해제된 데이터 전송
    if (originalEncoding === 'gzip' && this.isCompressibleContent(contentType)) {
      // 압축 헤더 제거 (브라우저가 압축 해제를 시도하지 않도록)
      headers.delete('content-encoding');
      headers.delete('vary');
      headers.delete('content-length');

      try {
        // response.text()나 response.arrayBuffer()는 자동으로 압축 해제
        const decompressedData = await response.text();

        return new Response(decompressedData, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      } catch (error) {
        console.error('Decompression failed:', error);
        // 실패 시 원본 body 그대로 (압축 헤더 제거 상태)
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      }
    }

    // 압축되지 않은 압축 가능한 콘텐츠만 압축
    if (!originalEncoding && this.isCompressibleContent(contentType)) {
      try {
        // 응답 본문을 텍스트로 읽기 (자동 압축 해제)
        const text = await response.text();

        // gzip 압축
        const compressed = Bun.gzipSync(new TextEncoder().encode(text));

        // 압축 헤더 설정
        headers.set('Content-Encoding', 'gzip');
        headers.set('Vary', 'Accept-Encoding');
        headers.set('Content-Length', compressed.length.toString());

        return new Response(compressed, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      } catch (error) {
        console.error('Compression failed:', error);
        // 압축 실패 시 원본 응답 반환
        headers.delete('content-encoding');
        headers.delete('content-length');
        headers.delete('vary');

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      }
    }

    // 압축 불가능하거나 이미 다른 방식으로 압축된 경우 원본 반환
    headers.delete('content-encoding');
    headers.delete('content-length');
    headers.delete('vary');

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
