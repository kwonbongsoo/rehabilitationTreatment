import jwt from 'jsonwebtoken';
import { Config } from '../config/config';
import { MemberApiClient } from '../utils/memberApiClient';
import { LoginBody, TokenPayload, UserRole } from '../interfaces/auth';
import { RedisClient, redis } from '../utils/redisClient';
import {
    BusinessError,
    AuthenticationError,
    ValidationError
} from '../middlewares/errorMiddleware';

export class AuthService {
    private config: Config;
    private memberApiClient: MemberApiClient;
    private redisClient: RedisClient;

    constructor(config?: Config, memberApiClient?: MemberApiClient, redisClient?: RedisClient) {
        this.config = config || new Config();
        this.memberApiClient = memberApiClient || new MemberApiClient(this.config);
        this.redisClient = redisClient || redis;
    }

    /**
     * 자격 증명 유효성 검증 (컨트롤러에서 이동)
     */
    public validateCredentials(credentials: LoginBody): void {
        const { username, password } = credentials;
        const errors: Record<string, string> = {};

        if (!username) {
            errors.username = 'Username is required';
        } else if (username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
        }

        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (Object.keys(errors).length > 0) {
            throw new ValidationError('Validation failed', errors);
        }
    }

    /**
     * 사용자 로그인 처리
     */
    public async login(credentials: LoginBody): Promise<{ token: string }> {
        try {
            // 입력 유효성 검증
            this.validateCredentials(credentials);

            // 자격증명 검증
            const userData = await this.memberApiClient.verifyCredentials(
                credentials.username,
                credentials.password
            );

            // 토큰 생성
            const token = this.generateToken(userData);

            // Redis에 토큰을 키로 하여 사용자 정보 저장
            await this.storeSessionByToken(token, userData);

            return { token };
        } catch (error) {
            if (error instanceof BusinessError) {
                throw error;
            }

            throw new AuthenticationError(
                error instanceof Error ? error.message : 'Invalid credentials'
            );
        }
    }

    /**
     * 게스트 토큰 생성
     */
    public createGuestToken(): string {
        const guestPayload: TokenPayload = {
            id: 'guest',
            role: 'guest' as UserRole,
            name: 'Guest User'
        };

        return this.generateToken(guestPayload);
    }

    /**
     * JWT 토큰 생성
     */
    public generateToken(payload: TokenPayload): string {
        const secret = this.config.getJwtSecret();
        const expiresIn = this.config.getJwtExpiresIn();

        return jwt.sign(payload, secret, { expiresIn });
    }

    /**
     * JWT 토큰 검증
     * @throws {AuthenticationError} 토큰이 유효하지 않은 경우
     */
    public async verifyToken(token: string): Promise<TokenPayload> {
        try {
            // Redis에서 캐싱된 사용자 정보 확인
            const cachedUser = await this.getUserByToken(token);
            if (cachedUser) {
                // Redis에 캐싱된 정보가 있으면 바로 반환 (검증 건너뛰기)
                return cachedUser;
            }

            // 캐싱된 정보가 없으면 토큰 검증 진행
            const secret = this.config.getJwtSecret();
            const decoded = jwt.verify(token, secret) as TokenPayload;

            // 검증된 토큰 정보 Redis에 캐싱 (다음 요청 최적화)
            await this.storeSessionByToken(token, decoded);

            return decoded;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new AuthenticationError('Token expired');
            } else if (error instanceof jwt.JsonWebTokenError) {
                throw new AuthenticationError('Invalid token');
            }

            if (error instanceof AuthenticationError) {
                throw error;
            }

            throw new AuthenticationError(
                error instanceof Error ? error.message : 'Token verification failed'
            );
        }
    }

    /**
     * 토큰 유효성 검증 및 상태 반환
     */
    public async verifyTokenWithStatus(token: string, secret?: string): Promise<{ status: number; message: string }> {
        try {
            const jwtSecret = secret || this.config.getJwtSecret();

            jwt.verify(token, jwtSecret);
            return { status: 200, message: 'Valid token' };
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return { status: 401, message: 'Token expired' };
            } else if (error instanceof jwt.JsonWebTokenError) {
                return { status: 401, message: 'Invalid token' };
            }

            return {
                status: 401,
                message: error instanceof Error ? error.message : 'Invalid token'
            };
        }
    }

    /**
     * 토큰으로부터 사용자 정보 조회
     */
    public async getUserInfoByToken(token: string): Promise<TokenPayload> {
        return this.verifyToken(token);
    }


    /**
     * 사용자 역할 검증
     * @param role 검증할 역할
     * @param allowedRoles 허용된 역할 목록
     * @throws {BusinessError} 허용되지 않은 역할인 경우
     */
    public validateRole(role: UserRole, allowedRoles: UserRole[]): void {
        if (!allowedRoles.includes(role)) {
            throw new BusinessError(
                `Role ${role} is not allowed for this operation`,
                403,
                'FORBIDDEN_ROLE'
            );
        }
    }

    /**
     * 토큰을 키로 사용하여 사용자 세션 정보를 Redis에 저장
     */
    public async storeSessionByToken(token: string, userData: TokenPayload): Promise<void> {
        try {
            // 사용자 정보를 JSON으로 직렬화
            const userDataJson = JSON.stringify(userData);

            // 토큰 만료시간 추출
            const decoded = jwt.decode(token) as { exp?: number };
            if (decoded && decoded.exp) {
                const ttl = decoded.exp - Math.floor(Date.now() / 1000);
                if (ttl > 0) {
                    // 토큰을 키로 사용하여 Redis에 사용자 정보 저장
                    await this.redisClient.set(`token:${token}`, userDataJson, ttl);
                }
            }
        } catch (error) {
            console.warn('Failed to store session in Redis:', error);
        }
    }

    /**
     * 토큰으로 Redis에서 사용자 세션 정보 조회
     */
    public async getUserByToken(token: string): Promise<TokenPayload | null> {
        try {
            const userData = await this.redisClient.get(`token:${token}`);
            if (userData) {
                return JSON.parse(userData) as TokenPayload;
            }
            return null;
        } catch (error) {
            console.warn('Failed to retrieve user data from Redis:', error);
            return null;
        }
    }

    /**
     * 토큰 세션 삭제 (로그아웃)
     */
    public async removeSession(token: string): Promise<boolean> {
        try {
            await this.redisClient.delete(`token:${token}`);
            return true;
        } catch (error) {
            console.warn('Failed to remove session from Redis:', error);
            return false;
        }
    }
}