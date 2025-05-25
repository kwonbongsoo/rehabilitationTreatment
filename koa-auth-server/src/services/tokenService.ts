import jwt from 'jsonwebtoken';
import { TokenPayload } from '../interfaces/auth';
import { Config } from '../config/config';
import { AuthenticationError, BusinessError } from '../middlewares/errorMiddleware';

export class TokenService {
    private config: Config;

    constructor(config?: Config) {
        this.config = config || new Config();
    }

    /**
     * JWT 토큰 생성
     */
    public generateToken(payload: TokenPayload): string {
        try {
            const secret = this.config.getJwtSecret();
            const expiresIn = this.config.getJwtExpiresIn();

            return jwt.sign(payload, secret, { expiresIn });
        } catch (error) {
            throw new BusinessError(
                'Failed to generate token',
                500,
                'TOKEN_GENERATION_ERROR'
            );
        }
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
            return { status: 500, message: 'Internal server error' };
        }
    }

    /**
     * 타입 가드: TokenPayload 인터페이스 확인
     */
    private isTokenPayload(obj: any): obj is TokenPayload {
        return (
            obj &&
            typeof obj.id === 'string' &&
            typeof obj.role === 'string' &&
            typeof obj.name === 'string'
        );
    }
}