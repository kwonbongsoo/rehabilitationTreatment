import { Context, Next } from 'koa';
import jwt from 'jsonwebtoken';
import { TokenPayload, UserRole } from '../interfaces/auth';

const secret = process.env.JWT_SECRET as string;

// 허용되는 역할 상수로 정의 
const roles: readonly UserRole[] = ['guest', 'user', 'admin'] as const;

// 타입 가드 함수
function isValidTokenPayload(payload: any): payload is TokenPayload {
    return (
        typeof payload === 'object' &&
        payload !== null &&
        typeof payload.id === 'string' &&
        typeof payload.role === 'string' &&
        roles.includes(payload.role as UserRole)
    );
}

export const checkAuthOrGuest = async (ctx: Context, next: Next) => {
    const authHeader = ctx.headers['authorization'];
    if (!authHeader) {
        ctx.status = 401;
        ctx.body = { message: 'Unauthorized: No token provided' };
        return;
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, secret);

        // 타입 검증
        if (!isValidTokenPayload(decoded)) {
            ctx.status = 403;
            ctx.body = { message: 'Forbidden: Invalid token format' };
            return;
        }

        // role이 'guest', 'user', 'admin' 중 하나인지 확인
        if (!roles.includes(decoded.role)) {
            ctx.status = 403;
            ctx.body = { message: 'Forbidden: Invalid token role' };
            return;
        }

        // 타입이 검증된 사용자 정보 할당
        ctx.state.user = decoded;
        await next();
    } catch (err) {
        ctx.status = 403;
        ctx.body = { message: 'Forbidden: Invalid or expired token' };
    }
};

// 로그인 유저만 허용하는 미들웨어
export const checkAuthUser = async (ctx: Context, next: Next) => {
    // 기존 코드 유지
    // ...
}