import { redisClient } from './redis';

export interface CacheOptions {
  ttl?: number; // TTL in seconds
  skipParams?: boolean; // URL 파라미터 제거 여부
}

export class HtmlCacheService {
  private readonly DEFAULT_TTL = 60; // 1분
  private readonly CACHE_PREFIX = 'html_cache:';

  constructor() {}

  /**
   * URL에서 파라미터를 제거하고 캐시 키를 생성
   */
  private generateCacheKey(url: string, skipParams: boolean = true): string {
    const urlObj = new URL(url);

    if (skipParams) {
      // 파라미터 제거하고 경로만 사용
      const cleanPath = urlObj.pathname === '/' ? '/' : urlObj.pathname.replace(/\/$/, '');
      return `${this.CACHE_PREFIX}${urlObj.host}${cleanPath}`;
    }

    // 파라미터 포함한 전체 URL 사용
    return `${this.CACHE_PREFIX}${urlObj.host}${urlObj.pathname}${urlObj.search}`;
  }

  /**
   * 캐시할 URL인지 확인
   */
  private shouldCache(url: string): boolean {
    const urlObj = new URL(url);
    const path = urlObj.pathname;

    // 캐시 대상 경로들
    const cacheablePaths = ['/', '/categories'];

    return cacheablePaths.some((cachePath) => {
      if (cachePath === '/') {
        return path === '/';
      }
      return path.startsWith(cachePath);
    });
  }

  /**
   * HTML 콘텐츠를 캐시에서 가져오기
   */
  async get(url: string, options: CacheOptions = {}): Promise<string | null> {
    if (!this.shouldCache(url)) {
      return null;
    }

    if (!redisClient.isReady()) {
      console.warn('Redis not ready, skipping cache get');
      return null;
    }

    try {
      const cacheKey = this.generateCacheKey(url, options.skipParams ?? true);
      const cachedContent = await redisClient.get(cacheKey);

      if (cachedContent) {
        console.log(`Cache HIT: ${cacheKey}`);
        return cachedContent;
      } else {
        console.log(`Cache MISS: ${cacheKey}`);
        return null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * HTML 콘텐츠를 캐시에 저장
   */
  async set(url: string, content: string, options: CacheOptions = {}): Promise<boolean> {
    if (!this.shouldCache(url)) {
      return false;
    }

    if (!redisClient.isReady()) {
      console.warn('Redis not ready, skipping cache set');
      return false;
    }

    try {
      const cacheKey = this.generateCacheKey(url, options.skipParams ?? true);
      const ttl = options.ttl || this.DEFAULT_TTL;

      // 분산 락을 사용하여 캐시 저장
      const success = await redisClient.setWithLock(cacheKey, content, ttl);

      if (success) {
        console.log(`Cache SET with lock: ${cacheKey} (TTL: ${ttl}s)`);
      } else {
        console.error(`Cache SET with lock failed: ${cacheKey}`);
      }

      return success;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * 특정 URL의 캐시 삭제
   */
  async delete(url: string, options: CacheOptions = {}): Promise<boolean> {
    if (!redisClient.isReady()) {
      console.warn('Redis not ready, skipping cache delete');
      return false;
    }

    try {
      const cacheKey = this.generateCacheKey(url, options.skipParams ?? true);
      const success = await redisClient.del(cacheKey);

      if (success) {
        console.log(`Cache DELETE: ${cacheKey}`);
      }

      return success;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * 캐시 키 생성 (디버깅/테스트용)
   */
  getCacheKey(url: string, skipParams: boolean = true): string {
    return this.generateCacheKey(url, skipParams);
  }

  /**
   * 캐시 가능한 URL인지 확인 (외부에서 사용)
   */
  isCacheable(url: string): boolean {
    return this.shouldCache(url);
  }
}

// 싱글톤 인스턴스
export const htmlCacheService = new HtmlCacheService();
