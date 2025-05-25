import { RedisClient, redis } from '../utils/redisClient';
import { TokenPayload } from '../interfaces/auth';
import { BusinessError } from '../middlewares/errorMiddleware';

export class SessionService {
    private redisClient: RedisClient;

    constructor(redisClient?: RedisClient) {
        this.redisClient = redisClient || redis;
    }

    /**
     * 토큰에 해당하는 세션 저장
     */
    public async storeSession(token: string, data: TokenPayload, ttlSeconds?: number): Promise<void> {
        try {
            const sessionKey = `token:${token}`;
            const sessionData = JSON.stringify(data);

            await this.redisClient.set(sessionKey, sessionData, ttlSeconds);
        } catch (error) {
            throw new BusinessError(
                'Failed to store user session',
                500,
                'SESSION_STORAGE_ERROR'
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
            throw new BusinessError(
                'Failed to retrieve user session',
                500,
                'SESSION_RETRIEVAL_ERROR'
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
            throw new BusinessError(
                'Failed to remove user session',
                500,
                'SESSION_DELETION_ERROR'
            );
        }
    }
}