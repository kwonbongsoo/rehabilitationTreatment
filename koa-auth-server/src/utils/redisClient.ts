import Redis from 'ioredis';
import { Config } from '../config/config';
import {
    BaseError,
    ErrorCode,
    ApiTimeoutError,
    ApiUnavailableError
} from '../middlewares/errorMiddleware';

export class RedisClient {
    private client: Redis;

    constructor(config?: Config) {
        const configInstance = config || new Config();

        try {
            const redisConfig = configInstance.getRedisConfig();
            this.client = new Redis({
                ...redisConfig,
                retryStrategy: (times) => {
                    const delay = Math.min(times * 500, 3000);
                    console.log(`Redis 연결 재시도... (${times}번째, ${delay}ms 후)`);
                    return delay;
                }
            });

            // 이벤트 리스너로 에러 처리 개선
            this.client.on('error', (err) => {
                console.error('Redis 에러:', err);
                // 에러 이벤트는 로깅만 하고, 실제 에러는 작업 실행 시 던짐
            });

            this.client.on('connect', () => {
                console.log('Redis 서버에 연결됨');
            });
        } catch (error) {
            console.error('Redis 초기화 실패:', error);
            throw new BaseError(
                ErrorCode.SERVICE_UNAVAILABLE,
                'Redis 서버를 사용할 수 없음',
                undefined,
                503
            );
        }
    }

    /**
     * 세션 저장 - 타임아웃 및 Redis 에러 처리
     */
    public async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        try {
            if (ttlSeconds) {
                await this.client.set(key, value, 'EX', ttlSeconds);
            } else {
                await this.client.set(key, value);
            }
        } catch (error) {
            this.handleRedisError(error, 'set', key);
        }
    }

    /**
     * 세션 조회 - 타임아웃 및 Redis 에러 처리
     */
    public async get(key: string): Promise<string | null> {
        try {
            return await this.client.get(key);
        } catch (error) {
            this.handleRedisError(error, 'get', key);
            return null; // 컴파일러용 (실제로는 위에서 에러 throw)
        }
    }

    /**
     * 세션 삭제 - 타임아웃 및 Redis 에러 처리
     */
    public async del(key: string): Promise<void> {
        try {
            await this.client.del(key);
        } catch (error) {
            this.handleRedisError(error, 'del', key);
        }
    }

    /**
     * Redis 에러 처리 헬퍼 - 에러 유형별 적절한 비즈니스 에러로 변환
     */
    private handleRedisError(error: unknown, operation: string, key: string): never {
        console.error(`Redis ${operation} 작업 실패 (${key}):`, error);

        // 에러 유형에 따른 분류
        if (error instanceof Error) {
            if (error.message.includes('timeout')) {
                throw new ApiTimeoutError(`Redis 작업 타임아웃: ${operation}`, 'redis-service');
            }

            if (error.message.includes('connection') || error.message.includes('ECONNREFUSED')) {
                throw new ApiUnavailableError('Redis 서버 연결 불가', 'redis-service');
            }            // 그 외 Redis 에러
            throw new BaseError(
                ErrorCode.INTERNAL_ERROR,
                `Redis ${operation} 작업 실패: ${error.message}`,
                undefined,
                500
            );
        }        // 알 수 없는 에러
        throw new BaseError(
            ErrorCode.INTERNAL_ERROR,
            `Redis ${operation} 작업 중 알 수 없는 오류 발생`,
            undefined,
            500
        );
    }
}

// 싱글톤 인스턴스
export const redis = new RedisClient();