import { htmlCacheService } from '../services/cache';

export interface CacheMiddlewareOptions {
  ttl?: number;
  skipCache?: boolean;
}

export class CacheMiddleware {
  /**
   * 캐시에서 HTML 콘텐츠 조회
   */
  async checkCache(url: string, contentType?: string): Promise<string | null> {
    try {
      return await htmlCacheService.get(url, {}, contentType);
    } catch (error) {
      console.error('Cache check error:', error);
      return null;
    }
  }

  /**
   * 응답을 캐시에 저장
   */
  async cacheResponse(
    url: string,
    response: Response,
    options: CacheMiddlewareOptions = {},
  ): Promise<Response> {
    try {
      // HTML 응답만 캐시
      const contentType = response.headers.get('content-type') || '';
      const isHTML = contentType.includes('text/html');
      
      if (!isHTML) {
        return response;
      }

      // 성공적인 응답만 캐시
      if (!response.ok) {
        return response;
      }

      // 응답 본문 읽기
      const responseText = await response.text();

      // 캐시에 저장 (content-type 정보 포함)
      await htmlCacheService.set(url, responseText, { ttl: options.ttl }, contentType);

      // 새로운 Response 객체 반환 (원본 Response는 이미 소비됨)
      return new Response(responseText, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          'X-Cache': 'MISS',
          'X-Cache-TTL': (options.ttl || 60).toString(),
        },
      });
    } catch (error) {
      console.error('Cache response error:', error);
      return response;
    }
  }

  /**
   * 캐시된 HTML 콘텐츠로 Response 생성
   */
  createCachedResponse(content: string, originalHeaders?: Headers, contentType?: string): Response {
    // HTML Content-Type 설정
    const defaultContentType = 'text/html; charset=utf-8';

    const headers: Record<string, string> = {
      'Content-Type': defaultContentType,
      'X-Cache': 'HIT',
      'Cache-Control': 'public, max-age=3600',
    };

    // 원본 헤더에서 일부 복사
    if (originalHeaders) {
      const copyHeaders = ['content-encoding', 'content-language', 'vary', 'etag'];

      copyHeaders.forEach((headerName) => {
        const value = originalHeaders.get(headerName);
        if (value) {
          headers[headerName] = value;
        }
      });
    }

    return new Response(content, {
      status: 200,
      statusText: 'OK',
      headers,
    });
  }

  /**
   * 캐시 무효화
   */
  async invalidateCache(url: string): Promise<boolean> {
    try {
      return await htmlCacheService.delete(url);
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return false;
    }
  }

  /**
   * URL이 캐시 가능한지 확인
   */
  isCacheable(url: string): boolean {
    return htmlCacheService.isCacheable(url);
  }

  /**
   * 캐시 통계 정보 (향후 구현)
   */
  async getCacheStats(): Promise<{ hits: number; misses: number; total: number }> {
    // 향후 Redis에서 통계 정보를 가져올 수 있도록 구현
    return { hits: 0, misses: 0, total: 0 };
  }
}

// 싱글톤 인스턴스
export const cacheMiddleware = new CacheMiddleware();
