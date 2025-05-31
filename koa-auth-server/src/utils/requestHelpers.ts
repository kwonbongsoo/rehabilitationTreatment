import { Context } from 'koa';
import { LoginBody } from '../interfaces/auth';
import { ValidationError, AuthenticationError } from '../middlewares/errorMiddleware';

/**
 * 요청 본문에서 로그인 자격 증명 추출
 */
export function extractCredentials(ctx: Context): LoginBody {
    return ctx.request.body as LoginBody;
}

/**
 * 자격 증명 유효성 검사
 * @throws {ValidationError} 유효성 검사 실패 시
 */
export function validateCredentials(credentials: LoginBody): void {
    const { id, password } = credentials;
    const errors: Record<string, string> = {};

    if (!id) {
        errors.id = 'Id is required';
    } else if (id.length < 3) {
        errors.id = 'Id must be at least 3 characters';
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
 * Authorization 헤더에서 Bearer 토큰 추출
 * @throws {Error} 토큰 형식이 잘못된 경우
 */
export function extractBearerToken(authHeader: string | undefined): string {
    if (!authHeader) {
        throw new AuthenticationError('Authorization header missing');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        throw new AuthenticationError('Invalid token format');
    }

    return parts[1];
}