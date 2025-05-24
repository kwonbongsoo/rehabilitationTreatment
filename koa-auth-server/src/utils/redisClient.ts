import Redis from 'ioredis';
import { Config } from '../config/config';

/**
 * Redis 클라이언트 클래스
 * 키-값 저장소 작업을 추상화하고 타입 안전성 보장
 */
export class RedisClient {
    private client: Redis;

    /**
     * Redis 클라이언트 초기화
     * @param config 설정 객체 (의존성 주입 용이)
     */
    constructor(config?: Config) {
        const configInstance = config || new Config();

        try {
            // Config 클래스에서 Redis 설정 가져오기
            const redisConfig = configInstance.getRedisConfig();
            this.client = new Redis(redisConfig);

            // 연결 이벤트 리스너 추가
            this.client.on('connect', () => {
                console.log('Redis 서버에 연결됨');
            });

            this.client.on('error', (err) => {
                console.error('Redis 연결 오류:', err);
                // 오류 발생 시에도 앱이 계속 실행되도록 함
            });
        } catch (error) {
            console.error('Redis 연결 실패:', error);
            throw new Error('Redis 연결을 초기화할 수 없습니다');
        }
    }

    /**
     * 키-값 쌍 저장
     * @param key 저장할 키
     * @param value 저장할 값
     * @param ttl 만료 시간(초), 지정 안하면 영구 저장
     * @returns Promise 객체
     */
    public async set(key: string, value: string, ttl?: number): Promise<'OK'> {
        if (ttl) {
            return this.client.set(key, value, 'EX', ttl);
        }
        return this.client.set(key, value);
    }

    /**
     * 키에 해당하는 값 조회
     * @param key 조회할 키
     * @returns 저장된 값 또는 null
     */
    public async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    /**
     * 키 삭제
     * @param key 삭제할 키
     * @returns 삭제된 키 수
     */
    public async delete(key: string): Promise<number> {
        return this.client.del(key);
    }

    /**
     * 키 존재 여부 확인
     * @param key 확인할 키
     * @returns 존재 여부
     */
    public async exists(key: string): Promise<boolean> {
        const result = await this.client.exists(key);
        return result === 1;
    }

    /**
     * 키 만료 시간 설정
     * @param key 대상 키
     * @param ttl 만료 시간(초)
     * @returns 성공 여부
     */
    public async expire(key: string, ttl: number): Promise<boolean> {
        const result = await this.client.expire(key, ttl);
        return result === 1;
    }

    /**
     * 해시 필드 설정
     * @param key 해시 키
     * @param field 필드 이름
     * @param value 필드 값
     */
    public async hset(key: string, field: string, value: string): Promise<number> {
        return this.client.hset(key, field, value);
    }

    /**
     * 해시 필드 조회
     * @param key 해시 키
     * @param field 필드 이름
     * @returns 필드 값
     */
    public async hget(key: string, field: string): Promise<string | null> {
        return this.client.hget(key, field);
    }

    /**
     * 연결 종료
     */
    public async close(): Promise<void> {
        await this.client.quit();
    }
}

// 싱글톤 인스턴스 제공
export const redis = new RedisClient();