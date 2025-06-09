import { RedisClient, redis } from '../utils/redisClient';
import { TokenPayload } from '../interfaces/auth';
import { BaseError, ErrorCode } from '../middlewares/errorMiddleware';
import { Config } from '../config/config';

export class SessionService {
    private redisClient: RedisClient;


    constructor(config: Config) {

        try {
            // config에서 Redis 설정을 가져오거나 기본 클라이언트 사용
            this.redisClient = redis;
        } catch (error) {
            throw new Error('세션 서비스를 초기화할 수 없습니다');
        }
    }

    /**
     * 토큰에 해당하는 세션 저장
     */
    public async storeSession(token: string, data: TokenPayload, ttlSeconds?: number): Promise<TokenPayload> {
        try {
            const sessionKey = `token:${token}`;
            const sessionData = JSON.stringify(data);

            await this.redisClient.set(sessionKey, sessionData, ttlSeconds);
            return data;
        } catch (error) {
            throw new BaseError(
                ErrorCode.INTERNAL_ERROR,
                'Failed to store user session',
                undefined,
                500
            );
        }
    }

    /**
     * 토큰으로 세션 정보 조회
     */
    public async getSession(token: string): Promise<TokenPayload | null> {
        try {
            const sessionKey = `token:${token}`;
            const sessionData = await this.redisClient.get(sessionKey);

            if (!sessionData) {
                return null;
            }

            return JSON.parse(sessionData) as TokenPayload;
        } catch (error) {
            throw new BaseError(
                ErrorCode.INTERNAL_ERROR,
                'Failed to retrieve user session',
                undefined,
                500
            );
        }
    }

    /**
     * 토큰 세션 삭제
     */
    public async removeSession(token: string): Promise<void> {
        try {
            const sessionKey = `token:${token}`;
            await this.redisClient.del(sessionKey);
        } catch (error) {
            throw new BaseError(
                ErrorCode.INTERNAL_ERROR,
                'Failed to remove user session',
                undefined,
                500
            );
        }
    }
}