import jwt from 'jsonwebtoken';
import { BaseTokenPayload, TokenPayload, TokenPayloadI, UserToken, UserTokenPayload } from '../interfaces/auth';
import { Config } from '../config/config';
import { AuthenticationError, BaseError, ErrorCode } from '../middlewares/errorMiddleware';
import { MemberBase } from '../interfaces/member';

export class TokenService {
    constructor(private readonly config: Config) { }

    /**
     * 유저 토큰 생성
     */
    public generateUserToken(userInfo: UserToken): TokenPayloadI {
        const tokenTiming = this.config.getTokenTimingConfig();

        const payload: UserTokenPayload = {
            id: userInfo.id,
            name: userInfo.name,
            email: userInfo.email,
            role: 'user',
            exp: tokenTiming.expiresAt,
            iat: tokenTiming.issuedAt,
        };

        const token = jwt.sign(payload, this.config.getJwtSecret());

        return {
            token,
            payload
        };
    }

    /**
     * 게스트 토큰 생성
     */
    public generateGuestToken(): TokenPayloadI {
        const tokenTiming = this.config.getTokenTimingConfig();

        const payload: BaseTokenPayload = {
            role: 'guest',
            exp: tokenTiming.expiresAt,
            iat: tokenTiming.issuedAt,
        };

        const token = jwt.sign(payload, this.config.getJwtSecret());

        return {
            token,
            payload
        };
    }

    /**
     * 토큰을 검증하고 페이로드 반환
     */
    public verifyToken(token: string): TokenPayload {
        try {
            const secret = this.config.getJwtSecret();
            const decoded = jwt.verify(token, secret);

            // 토큰 페이로드 검증
            if (typeof decoded !== 'object' || !this.isTokenPayload(decoded)) {
                throw new AuthenticationError('Invalid token payload');
            }

            return decoded;
        } catch (error) {
            if (error instanceof AuthenticationError) {
                throw error;
            }

            if (error instanceof jwt.JsonWebTokenError) {
                throw new AuthenticationError('Invalid token');
            }

            if (error instanceof jwt.TokenExpiredError) {
                throw new AuthenticationError('Token expired');
            }

            throw new AuthenticationError('Token verification failed');
        }
    }

    /**
     * 토큰 검증 결과를 상태코드와 메시지로 반환
     */
    public verifyTokenWithStatus(token: string): { status: number; message: string } {
        try {
            this.verifyToken(token);
            return { status: 200, message: 'Valid token' };
        } catch (error) {
            if (error instanceof AuthenticationError) {
                return { status: 401, message: error.message };
            }
            const errorMessage = error instanceof Error ? error.message : 'Internal server error';
            return { status: 500, message: errorMessage };
        }
    }

    /**
     * 타입 가드: TokenPayload 인터페이스 확인
     */
    private isTokenPayload(obj: any): obj is TokenPayload {
        return (
            obj &&
            typeof obj.role === 'string'
        );
    }
}