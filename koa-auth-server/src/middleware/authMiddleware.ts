import { Context, Next } from 'koa';
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET as string;

// 역할 타입 정의
export type UserRole = 'guest' | 'user' | 'admin';

const roles = ['guest', 'user', 'admin'] as const;

interface DecodedToken {
    role?: UserRole;
    [key: string]: any;
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
        const decoded = jwt.verify(token, secret) as DecodedToken;
        // role이 'guest', 'user', 'admin' 중 하나인지 확인
        if (!decoded.role || !roles.includes(decoded.role)) {
            ctx.status = 403;
            ctx.body = { message: 'Forbidden: Invalid token role' };
            return;
        }
        ctx.state.user = decoded;
        await next();
    } catch (err) {
        ctx.status = 403;
        ctx.body = { message: 'Forbidden: Invalid or expired token' };
    }
};


// 로그인 유저만 허용하는 미들웨어
export const checkAuthUser = async (ctx: Context, next: Next) => {
    const authHeader = ctx.headers['authorization'];
    if (!authHeader) {
        ctx.status = 401;
        ctx.body = { message: 'Unauthorized: No token provided' };
        return;
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, secret) as DecodedToken;
        // role이 'user' 또는 'admin'만 허용
        if (!decoded.role || (decoded.role !== 'user' && decoded.role !== 'admin')) {
            ctx.status = 403;
            ctx.body = { message: 'Forbidden: Only authenticated users allowed' };
            return;
        }
        ctx.state.user = decoded;
        await next();
    } catch (err) {
        ctx.status = 403;
        ctx.body = { message: 'Forbidden: Invalid or expired token' };
    }
};