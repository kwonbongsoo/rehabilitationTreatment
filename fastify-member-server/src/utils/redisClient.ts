import Redis from 'ioredis';

export class RedisClient {
  private client: Redis;
  constructor() {
    try {
      const redisConfig = {
        host: process.env.REDIS_URL || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectTimeout: 10000, // 10초
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 500, 3000);
          if (process.env.NODE_ENV !== 'production') {
            console.log(`Redis 연결 재시도... (${times}번째, ${delay}ms 후)`);
          }
          if (times > 10) return null; // 10번 시도 후 포기
          return delay;
        },
      };

      this.client = new Redis(redisConfig);

      // 이벤트 리스너로 에러 처리 개선
      this.client.on('error', (err) => {
        // 프로덕션에서는 에러 상세 정보 마스킹
        if (process.env.NODE_ENV === 'production') {
          console.error('Redis 연결 오류 발생');
        } else {
          console.error('Redis 에러:', err.message);
        }
      });

      this.client.on('connect', () => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('Redis 서버에 연결됨 (connect 이벤트)');
        }
      });

      this.client.on('ready', () => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('Redis 클라이언트 준비 완료 (ready 이벤트)');
        }
      });

      this.client.on('reconnecting', () => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('Redis 재연결 중...');
        }
      });

      this.client.on('close', () => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('Redis 연결 종료됨');
        }
      });
    } catch (error) {
      console.error('Redis 초기화 실패:', error);
      throw error;
    }
  }

  /**
   * 멱등성 키 저장 - TTL과 함께
   */
  public async setex(key: string, ttlSeconds: number, value: string): Promise<void> {
    try {
      await this.client.setex(key, ttlSeconds, value);
    } catch (error) {
      this.handleRedisError(error, 'setex', key);
    }
  }

  /**
   * 값 조회
   */
  public async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      this.handleRedisError(error, 'get', key);
      return null;
    }
  }

  /**
   * 값 설정
   */
  public async set(key: string, value: string): Promise<void> {
    try {
      await this.client.set(key, value);
    } catch (error) {
      this.handleRedisError(error, 'set', key);
    }
  }

  /**
   * 키 삭제
   */
  public async del(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      this.handleRedisError(error, 'del', key);
      return 0;
    }
  }

  /**
   * 여러 키 삭제
   */
  public async delMultiple(...keys: string[]): Promise<number> {
    try {
      return await this.client.del(...keys);
    } catch (error) {
      this.handleRedisError(error, 'del', keys.join(', '));
      return 0;
    }
  }

  /**
   * 패턴으로 키 검색 - SCAN 사용으로 성능 최적화
   * Redis KEYS 명령어는 O(N) 복잡도로 성능상 위험하므로 SCAN 사용
   */
  public async scanKeys(pattern: string, count: number = 100): Promise<string[]> {
    try {
      const keys: string[] = [];
      let cursor = '0';
      
      do {
        const result = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', count);
        cursor = result[0];
        keys.push(...result[1]);
      } while (cursor !== '0');
      
      return keys;
    } catch (error) {
      this.handleRedisError(error, 'scan', pattern);
      return [];
    }
  }


  /**
   * 키의 TTL 확인
   */
  public async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      this.handleRedisError(error, 'ttl', key);
      return -1;
    }
  }

  /**
   * Redis 연결 상태 확인
   */
  public async ping(): Promise<string> {
    try {
      const result = await this.client.ping();
      if (process.env.NODE_ENV !== 'production') {
        console.log('Redis ping 성공:', result);
      }
      return result;
    } catch (error) {
      this.handleRedisError(error, 'ping', 'ping');
      return 'ERROR'; // 컴파일러용
    }
  }

  /**
   * 연결 테스트 및 강제 연결
   */
  public async testConnection(): Promise<boolean> {
    try {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Redis 연결 테스트 시작...');
      }

      // lazyConnect가 true이므로 첫 번째 명령어로 연결 시도
      const result = await this.client.ping();
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('Redis 연결 성공! Ping 결과:', result);
        console.log('Redis 연결 상태:', this.client.status);
      }

      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'production') {
        console.error('Redis 연결 테스트 실패');
      } else {
        console.error('Redis 연결 테스트 실패:', (error as Error).message);
      }
      return false;
    }
  }

  /**
   * 연결 종료
   */
  public disconnect(): void {
    this.client.disconnect();
  }

  /**
   * Redis 에러 처리 헬퍼
   */
  private handleRedisError(error: unknown, operation: string, key: string): never {
    // 프로덕션에서는 민감한 정보 로깅 방지
    if (process.env.NODE_ENV === 'production') {
      console.error(`Redis ${operation} 작업 실패`);
    } else {
      console.error(`Redis ${operation} 작업 실패 (${key}):`, (error as Error).message || error);
    }

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error(`Redis 작업 타임아웃: ${operation}`);
      }

      if (error.message.includes('connection') || error.message.includes('ECONNREFUSED')) {
        throw new Error('Redis 서버 연결 불가');
      }

      throw new Error(`Redis ${operation} 작업 실패: ${error.message}`);
    }

    throw new Error(`Redis ${operation} 작업 중 알 수 없는 오류 발생`);
  }
}

// 싱글톤 인스턴스
export const redisClient = new RedisClient();
