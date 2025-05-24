import { redis } from '../utils/redisClient';
import { generateUserToken } from '../utils/userToken';
import { generateGuestToken } from '../utils/guestToken';
import { verifyJwtToken } from '../utils/jwtVerify';
import { TokenPayload, TokenResponse, TokenVerificationResult } from '../interfaces/auth';
import { HttpError } from '../middleware/errorHandler';
import { MemberApiClient } from '../utils/memberApiClient';

export class AuthService {
    private users: Map<string, string> = new Map();


    public async login(id: string, password: string): Promise<TokenResponse> {
        // MemberApiClient로 로그인 위임
        const tokenPayload = await MemberApiClient.verifyCredentials(id, password);
        const user: TokenPayload = { id, role: 'user', name: tokenPayload.name };
        const token = generateUserToken(user);

        // Redis에 토큰을 키로 유저 정보 저장 (1시간 만료)
        await redis.set(`user:token:${token}`, JSON.stringify(user), 'EX', 60 * 60);

        return { token };
    }

    public async getUserInfoByToken(token: string): Promise<TokenPayload | null> {
        const userInfo = await redis.get(`user:token:${token}`);
        return userInfo ? JSON.parse(userInfo) : null;
    }

    public async verifyToken(token: string, secret: string): Promise<boolean> {
        return verifyJwtToken(token, secret);
    }

    public createGuestToken(): string {
        return generateGuestToken();
    }

    public extractBearerToken(authHeader?: string): string {
        if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
            return authHeader.slice(7);
        }
        return '';
    }

    public async verifyTokenWithStatus(token: string, secret: string): Promise<TokenVerificationResult> {
        if (!token) {
            return { status: 401, message: 'No token' };
        }

        const isValid = await this.verifyToken(token, secret);
        if (isValid) {
            return { status: 200, message: 'OK' };
        } else {
            return { status: 403, message: 'Invalid token' };
        }
    }
}