import { htmlCacheService } from '../services/cache';

export interface CacheMiddlewareOptions {
  ttl?: number;
  skipCache?: boolean;
}

export class CacheMiddleware {
  /**
   * 캐시에서 HTML 콘텐츠 조회
   */
  async checkCache(
    url: string,
    contentType?: string,
  ): Promise<{ content: string; headers: Record<string, string> } | null> {
    try {
      const cachedData = await htmlCacheService.get(url, {}, contentType);
      if (!cachedData) return null;

      try {
        const parsed = JSON.parse(cachedData);
        return {
          content: parsed.content,
          headers: {
            'content-type': parsed.contentType || 'text/html; charset=utf-8',
            ...(parsed.etag && { etag: parsed.etag }),
            ...(parsed.contentLanguage && { 'content-language': parsed.contentLanguage }),
          },
        };
      } catch {
        // 기존 캐시 형태 (문자열)인 경우 호환성 유지
        return {
          content: cachedData,
          headers: { 'content-type': 'text/html; charset=utf-8' },
        };
      }
    } catch (error) {
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

      // 캐시 데이터 구성
      const cacheData = {
        content: responseText,
        contentType,
        etag: response.headers.get('etag'),
        contentLanguage: response.headers.get('content-language'),
      };

      await htmlCacheService.set(url, JSON.stringify(cacheData), { ttl: options.ttl }, contentType);

      // 새로운 Response 객체 반환
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
      return response;
    }
  }

  /**
   * 캐시된 HTML 콘텐츠로 Response 생성 (gzip 압축 적용)
   */
  createCachedResponse(content: string, cachedHeaders?: Record<string, string>): Response {
    const headers: Record<string, string> = {
      'Content-Type': cachedHeaders?.['content-type'] || 'text/html; charset=utf-8',
      'X-Cache': 'HIT',
      'Cache-Control': 'public, max-age=3600',
      Connection: 'keep-alive',
      'Keep-Alive': 'timeout=60, max=1000',
    };

    // 캐시된 헤더 정보 추가
    if (cachedHeaders) {
      Object.entries(cachedHeaders).forEach(([key, value]) => {
        if (key !== 'content-type' && key !== 'content-encoding') {
          headers[key] = value;
        }
      });
    }

    try {
      // HTML 콘텐츠 gzip 압축
      const compressed = Bun.gzipSync(new TextEncoder().encode(content));

      // 압축 헤더 설정
      headers['Content-Encoding'] = 'gzip';
      headers['Vary'] = 'Accept-Encoding';
      headers['Content-Length'] = compressed.length.toString();

      return new Response(compressed, {
        status: 200,
        statusText: 'OK',
        headers,
      });
    } catch (error) {
      // 압축 실패 시 원본 반환
      return new Response(content, {
        status: 200,
        statusText: 'OK',
        headers,
      });
    }
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
