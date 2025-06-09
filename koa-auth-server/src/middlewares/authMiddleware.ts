import { Context, Next } from 'koa';
import { ForbiddenError, AuthenticationError } from './errorMiddleware';
import { extractBearerToken } from '../utils/requestHelpers';

/**
 * 인증 미들웨어 클래스
 * - 토큰 존재 여부만 확인
 * - 쿠키의 access_type으로 역할 확인
 * - 서비스 호출 없이 독립적으로 작동
 */
export class AuthMiddleware {
    /**
     * 토큰 존재 확인 미들웨어 - 토큰이 있어야 함 (검증은 컨트롤러에서)
     */
    public requireToken = async (ctx: Context, next: Next): Promise<void> => {
        try {
            // 헬퍼 함수 사용
            ctx.state.token = extractBearerToken(ctx.headers.authorization);
            await next();
        } catch (error) {
            // 에러는 그대로 전달 (이미 적절한 에러 타입)
            throw error;
        }
    };

    /**
     * 로그인 사용자 필요 미들웨어 - 게스트 거부
     * 쿠키의 access_type으로 확인
     */
    public requireUser = async (ctx: Context, next: Next): Promise<void> => {
        try {
            // 헬퍼 함수 사용
            ctx.state.token = extractBearerToken(ctx.headers.authorization);

            // 쿠키에서 access_type 확인
            const accessType = ctx.cookies.get('access_type');            // 게스트 거부
            if (!accessType || accessType === 'guest') {
                throw new ForbiddenError('This endpoint requires a logged-in user');
            }

            await next();
        } catch (error) {
            // 에러 타입 보존
            if (error instanceof ForbiddenError) {
                throw error;
            }
            if (error instanceof AuthenticationError) {
                throw error;
            }
            throw new AuthenticationError(
                error instanceof Error ? error.message : 'Invalid token format'
            );
        }
    };

    /**
     * 관리자 역할 필요 미들웨어
     */
    public requireAdmin = async (ctx: Context, next: Next): Promise<void> => {
        // 먼저 토큰 존재 확인
        const authHeader = ctx.headers.authorization;
        if (!authHeader) {
            throw new AuthenticationError('Authorization header missing');
        }

        try {
            // 토큰 형식 확인
            ctx.state.token = extractBearerToken(authHeader);

            // 쿠키에서 access_type 확인
            const accessType = ctx.cookies.get('access_type');            // 관리자만 허용
            if (!accessType || accessType !== 'admin') {
                throw new ForbiddenError('Admin privileges required');
            } await next();
        } catch (error) {
            if (error instanceof ForbiddenError) {
                throw error;
            }
            throw new AuthenticationError(
                error instanceof Error ? error.message : 'Invalid token format'
            );
        }
    };

    /**
     * 특정 역할들만 허용하는 미들웨어 생성기
     */
    public allowRoles = (roles: string[]) => {
        return async (ctx: Context, next: Next): Promise<void> => {
            // 먼저 토큰 존재 확인
            const authHeader = ctx.headers.authorization;
            if (!authHeader) {
                throw new AuthenticationError('Authorization header missing');
            }

            try {
                // 토큰 형식 확인
                ctx.state.token = extractBearerToken(authHeader);

                // 쿠키에서 access_type 확인
                const accessType = ctx.cookies.get('access_type');                // 역할 확인
                if (!accessType || !roles.includes(accessType)) {
                    throw new ForbiddenError(`Required role: ${roles.join(' or ')}`);
                }

                await next();
            } catch (error) {
                if (error instanceof ForbiddenError) {
                    throw error;
                }
                throw new AuthenticationError(
                    error instanceof Error ? error.message : 'Invalid token format'
                );
            }
        };
    };
}

// 미들웨어 인스턴스 생성 (싱글톤)
export const authMiddleware = new AuthMiddleware();

// 함수 형태로 내보내기 (사용 편의성)
export const requireToken = authMiddleware.requireToken;
export const requireUser = authMiddleware.requireUser;
export const requireAdmin = authMiddleware.requireAdmin;
export const allowRoles = authMiddleware.allowRoles;