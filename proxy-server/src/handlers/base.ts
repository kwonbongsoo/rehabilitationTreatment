import { config } from '../config';
import { ProxyRequestError, createErrorContext } from '../middleware/errorHandler';
import { BaseError, ErrorCode } from '../common/errors';

export abstract class BaseProxyHandler {
  protected abstract getTargetName(): string;

  protected async proxyRequest(req: Request, targetUrl: string): Promise<Response> {
    try {
      // Keep-alive 헤더를 포함한 최적화된 요청 설정
      const proxyHeaders = new Headers(Object.fromEntries(req.headers.entries()));
      proxyHeaders.set('Connection', 'keep-alive');
      proxyHeaders.set('Keep-Alive', 'timeout=60, max=1000');

      // 타임아웃 설정으로 fetch 요청
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

      try {
        const response = await fetch(targetUrl, {
          method: req.method,
          headers: proxyHeaders,
          body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
          // Bun fetch 최적화 옵션
          keepalive: true,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (config.enableRequestLogging) {
          // console.log(
          //   `✅ ${this.getTargetName()} response: ${response.status} ${response.statusText}`,
          // );
        }

        return await this.createProxyResponse(response, req);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      console.error(`${this.getTargetName()} proxy error:`, error);

      // AbortError 처리 (타임아웃)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new BaseError(
          ErrorCode.EXTERNAL_SERVICE_TIMEOUT,
          `${this.getTargetName()} request timeout`,
          { context: { targetUrl, method: req.method, timeout: 10000 } },
          504,
        );
      }

      // 네트워크 에러 처리
      if (
        error instanceof TypeError &&
        (error.message.includes('fetch') || error.message.includes('Failed to fetch'))
      ) {
        throw new BaseError(
          ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE,
          `${this.getTargetName()} is unavailable`,
          { context: { targetUrl, method: req.method, error: error.message } },
          503,
        );
      }

      // 연결 에러 처리
      if (
        error instanceof Error &&
        (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND'))
      ) {
        throw new BaseError(
          ErrorCode.CONNECTION_ERROR,
          `Cannot connect to ${this.getTargetName()}`,
          { context: { targetUrl, method: req.method, error: error.message } },
          503,
        );
      }

      // 기타 에러
      if (error instanceof BaseError) {
        throw error;
      }

      // 알 수 없는 에러
      const context = createErrorContext(req);
      throw new ProxyRequestError(
        `Failed to connect to ${this.getTargetName()}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        context,
        502,
      );
    }
  }

  protected async createProxyResponse(response: Response, req: Request): Promise<Response> {
    try {
      const headers = new Headers(response.headers);

      // 메타데이터 헤더 추가
      headers.set('X-Proxy-Server', 'bun-proxy');
      headers.set('X-Proxy-Target', this.getTargetName().toLowerCase());
      headers.set('X-Proxy-Timestamp', new Date().toISOString());

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
        } catch (decompressError) {
          console.error('Decompression failed:', decompressError);

          // 디컴프레션 실패 시 BaseError로 래핑
          throw new BaseError(
            ErrorCode.INTERNAL_ERROR,
            'Failed to decompress response',
            {
              context: {
                targetName: this.getTargetName(),
                originalEncoding,
                error:
                  decompressError instanceof Error
                    ? decompressError.message
                    : 'Unknown decompression error',
              },
            },
            502,
          );
        }
      }

      // 압축되지 않은 경우 그대로 전달
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (error) {
      console.error('Failed to create proxy response:', error);

      if (error instanceof BaseError) {
        throw error;
      }

      throw new BaseError(
        ErrorCode.INTERNAL_ERROR,
        'Failed to process proxy response',
        {
          context: {
            targetName: this.getTargetName(),
            responseStatus: response.status,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
        502,
      );
    }
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
