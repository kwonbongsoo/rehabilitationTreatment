import { redisClient } from './redis';
import { CacheError } from '../middleware/errorHandler';

export interface CacheOptions {
  ttl?: number; // TTL in seconds
  skipParams?: boolean; // URL 파라미터 제거 여부
}

export class HtmlCacheService {
  private readonly DEFAULT_TTL = 60; // 1분
  private readonly CACHE_PREFIX = 'html_cache:';
  private readonly cacheKeyMap = new Map<string, string>(); // URL -> 캐시키 매핑

  constructor() {}

  /**
   * URL에서 파라미터를 제거하고 캐시 키를 생성 (최적화된 버전)
   * 어드민에서 데이터를 등록 하면 데이터가 변경 되지만
   * 파라미터와 상관없이 데이터가 일치한 경우에만 캐시키를 생성
   */
  private generateCacheKey(url: string, skipParams: boolean = true, contentType?: string): string {
    // 캐시키 맵에서 이미 생성된 키가 있는지 확인
    const cacheMapKey = `${url}:${skipParams}`;
    if (this.cacheKeyMap.has(cacheMapKey)) {
      return this.cacheKeyMap.get(cacheMapKey)!;
    }

    const urlObj = new URL(url);
    const prefix = this.CACHE_PREFIX;
    let cacheKey: string;

    if (skipParams) {
      const cleanPath = urlObj.pathname === '/' ? '/' : urlObj.pathname.replace(/\/$/, '');
      // HTML의 경우 모든 파라미터 제거
      cacheKey = `${prefix}${urlObj.host}${cleanPath}`;
    } else {
      // 파라미터 포함한 전체 URL 사용 (향후 필요시 사용)
      // cacheKey = `${prefix}${urlObj.host}${urlObj.pathname}${urlObj.search}`;

      // 현재는 항상 파라미터 제거 방식 사용
      const cleanPath = urlObj.pathname === '/' ? '/' : urlObj.pathname.replace(/\/$/, '');
      cacheKey = `${prefix}${urlObj.host}${cleanPath}`;
    }

    // 맵 크기 제한 (메모리 누수 방지)
    if (this.cacheKeyMap.size > 1000) {
      // LRU 방식으로 오래된 키 제거
      const firstKey = this.cacheKeyMap.keys().next().value;
      this.cacheKeyMap.delete(firstKey);
    }

    this.cacheKeyMap.set(cacheMapKey, cacheKey);
    return cacheKey;
  }

  /**
   * 캐시할 URL인지 확인
   */
  private shouldCache(url: string): boolean {
    const urlObj = new URL(url);
    const path = urlObj.pathname;

    // RSC 요청은 절대 캐시하지 않음
    if (urlObj.searchParams.has('_rsc')) {
      return false;
    }

    // 캐시 대상 경로들
    const cacheablePaths = ['/', '/categories'];

    const shouldCacheResult = cacheablePaths.some((cachePath) => {
      if (cachePath === '/') {
        return path === '/';
      }
      return path.startsWith(cachePath);
    });

    return shouldCacheResult;
  }

  /**
   * HTML 콘텐츠를 캐시에서 가져오기 (비동기 최적화)
   */
  async get(url: string, options: CacheOptions = {}, contentType?: string): Promise<string | null> {
    if (!this.shouldCache(url)) {
      return null;
    }

    if (!redisClient.isReady()) {
      // Redis가 준비되지 않은 경우 즉시 null 반환 (블로킹 방지)
      return null;
    }

    try {
      const cacheKey = this.generateCacheKey(url, options.skipParams ?? true, contentType);

      // 비동기 Redis 조회 - 타임아웃 설정으로 블로킹 방지
      const cachedContent = await Promise.race([
        redisClient.get(cacheKey),
        new Promise<null>(
          (_, reject) => setTimeout(() => reject(new Error('Redis timeout')), 2000), // 2000ms 타임아웃
        ),
      ]);

      if (cachedContent) {
        console.log(`Cache HIT: ${cacheKey}`);
        return cachedContent;
      } else {
        console.log(`Cache MISS: ${cacheKey}`);
        return null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      // 에러 발생 시 null 반환하여 원본 요청 진행
      return null;
    }
  }

  /**
   * HTML 콘텐츠를 캐시에 저장 (비동기 최적화)
   */
  async set(
    url: string,
    content: string,
    options: CacheOptions = {},
    contentType?: string,
  ): Promise<boolean> {
    if (!this.shouldCache(url)) {
      return false;
    }

    if (!redisClient.isReady()) {
      return false;
    }

    try {
      const cacheKey = this.generateCacheKey(url, options.skipParams ?? true, contentType);
      const ttl = options.ttl || this.DEFAULT_TTL;

      // 분산 락 없이 단순 SET 사용으로 오버헤드 제거
      // 백그라운드에서 비동기 저장 (블로킹 방지)
      const setPromise = Promise.race([
        redisClient.set(cacheKey, content, ttl),
        new Promise<boolean>(
          (_, reject) => setTimeout(() => reject(new Error('Redis set timeout')), 3000), // 3000ms 타임아웃
        ),
      ]);

      // 백그라운드에서 실행 (응답 블로킹 방지)
      setPromise
        .then((success) => {
          if (success) {
            console.log(`Cache SET: ${cacheKey} (TTL: ${ttl}s)`);
          } else {
            console.error(`Cache SET failed: ${cacheKey}`);
          }
        })
        .catch((error) => {
          console.error('Background cache set error:', error);
        });

      // 즉시 true 반환하여 응답 속도 향상
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      // 에러 발생해도 응답은 정상 진행
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
      throw new CacheError(
        `Failed to delete cache for ${url}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
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
