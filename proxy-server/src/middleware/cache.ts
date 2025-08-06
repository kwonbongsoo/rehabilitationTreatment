import { htmlCacheService } from '../services/cache';
import { BaseError, ErrorCode } from '../common/errors';

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

      // HTML 내용 유효성 검증
      if (!this.isValidHtmlContent(responseText, response.status)) {
        console.warn('Invalid HTML content detected, skipping cache', {
          url,
          status: response.status,
          contentLength: responseText.length,
          hasDoctype: responseText.includes('<!DOCTYPE'),
        });

        // 유효하지 않은 HTML은 캐시하지 않고 그대로 반환
        return new Response(responseText, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...Object.fromEntries(response.headers.entries()),
            'X-Cache': 'SKIP',
            'X-Cache-Reason': 'Invalid HTML content',
          },
        });
      }

      // 캐시 데이터 구성
      const cacheData = {
        content: responseText,
        contentType,
        etag: response.headers.get('etag'),
        contentLanguage: response.headers.get('content-language'),
        timestamp: Date.now(), // 캐시 저장 시간 추가
      };

      try {
        await htmlCacheService.set(
          url,
          JSON.stringify(cacheData),
          { ttl: options.ttl },
          contentType,
        );
      } catch (cacheSetError) {
        console.error('Failed to save cache:', cacheSetError);
        // 캐시 저장 실패해도 원본 응답은 반환
      }

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
      console.error('Cache response error:', error);

      // 에러 발생 시에도 원본 응답 반환
      return response;
    }
  }

  /**
   * HTML 내용이 유효한지 검증
   */
  private isValidHtmlContent(content: string, statusCode: number): boolean {
    // 빈 내용 체크
    if (!content || content.trim().length === 0) {
      return false;
    }

    // 에러 상태 코드는 캐시하지 않음
    if (statusCode >= 400) {
      return false;
    }

    // Next.js 에러 페이지 감지
    const errorIndicators = [
      'Application error: a client-side exception has occurred',
      '__NEXT_ERROR__',
      'This page could not be found',
      '500 - Internal Server Error',
      '404 - This page could not be found',
      'Error: ECONNREFUSED',
      'TypeError: fetch failed',
      'ETIMEDOUT',
      'ENOTFOUND',
    ];

    // 에러 지시자가 포함된 내용은 캐시하지 않음
    const hasErrorIndicator = errorIndicators.some((indicator) => content.includes(indicator));

    if (hasErrorIndicator) {
      return false;
    }

    // HTML 문서 구조 최소 요구사항 확인
    const hasBasicHtmlStructure = content.includes('<html') || content.includes('<!DOCTYPE');

    if (!hasBasicHtmlStructure) {
      return false;
    }

    // 너무 짧은 응답은 에러 메시지일 가능성이 높음
    // 하지만 정상적인 HTML 구조가 있으면 허용
    if (content.length < 30000 && !content.includes('<body>')) {
      return false;
    }

    return true;
  }

  /**
   * 캐시된 HTML 콘텐츠로 Response 생성 (압축 없이 단순 전달)
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
        if (key !== 'content-type') {
          headers[key] = value;
        }
      });
    }

    // 압축 없이 원본 콘텐츠 그대로 반환 (CPU 절약)
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
