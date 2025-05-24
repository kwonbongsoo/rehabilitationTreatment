import { Context, Next } from 'koa';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

/**
 * 글로벌 에러 핸들러 미들웨어
 * 모든 예외를 중앙에서 처리하여 일관된 오류 응답 제공
 */
export async function errorHandlerMiddleware(ctx: Context, next: Next): Promise<void> {
    try {
        await next();
    } catch (err: unknown) {
        console.error('API Error:', err);

        // 비즈니스 예외 처리
        if (err instanceof BusinessError) {
            // API 에러인지 확인
            const isApiError = err instanceof ApiError;

            ctx.status = err.statusCode;
            ctx.body = {
                success: false,
                message: err.message,
                code: err.errorCode,
                // API 에러는 추가 정보 제공
                ...(isApiError && {
                    type: 'api_error',
                    service: (err as ApiError).service
                })
            };
            return;
        }

        // JWT 관련 예외 처리 - 타입 안전성 개선
        if (
            err instanceof JsonWebTokenError ||
            err instanceof TokenExpiredError ||
            isJwtError(err)
        ) {
            ctx.status = 401;
            ctx.body = {
                success: false,
                message: getErrorMessage(err),
                code: 'INVALID_TOKEN'
            };
            return;
        }

        // 기타 예외는 내부 서버 오류로 처리
        ctx.status = 500;
        ctx.body = {
            success: false,
            message: process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : getErrorMessage(err),
            code: 'INTERNAL_ERROR'
        };
    }
}

/**
 * 객체가 JWT 에러 형식인지 확인하는 타입 가드
 */
function isJwtError(err: unknown): err is { name: string; message: string } {
    return (
        typeof err === 'object' &&
        err !== null &&
        'name' in err &&
        (
            (err as { name: string }).name === 'JsonWebTokenError' ||
            (err as { name: string }).name === 'TokenExpiredError'
        )
    );
}

/**
 * 다양한 에러 타입에서 안전하게 메시지를 추출
 */
function getErrorMessage(err: unknown): string {
    if (err instanceof Error) {
        return err.message;
    }

    if (typeof err === 'object' && err !== null && 'message' in err) {
        const message = (err as { message: unknown }).message;
        if (typeof message === 'string') {
            return message;
        }
    }

    if (typeof err === 'string') {
        return err;
    }

    return 'Unknown error';
}

// === 기본 에러 클래스 ===

/**
 * 비즈니스 에러 클래스 - 서비스에서 던질 예외의 기본 클래스
 */
export class BusinessError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 400,
        public errorCode: string = 'BAD_REQUEST'
    ) {
        super(message);
        this.name = 'BusinessError';
    }
}

/**
 * 인증 에러 클래스 - 인증 실패 시 사용
 */
export class AuthenticationError extends BusinessError {
    constructor(message: string = 'Authentication failed') {
        super(message, 401, 'UNAUTHORIZED');
        this.name = 'AuthenticationError';
    }
}

/**
 * 권한 에러 클래스 - 권한 부족 시 사용
 */
export class ForbiddenError extends BusinessError {
    constructor(message: string = 'Access denied') {
        super(message, 403, 'FORBIDDEN');
        this.name = 'ForbiddenError';
    }
}

/**
 * 리소스 없음 에러 클래스 - 요청한 리소스가 존재하지 않을 때 
 */
export class NotFoundError extends BusinessError {
    constructor(message: string = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}

/**
 * 충돌 에러 클래스 - 중복 데이터 등 일관성 제약 위반 시
 */
export class ConflictError extends BusinessError {
    constructor(message: string = 'Resource conflict') {
        super(message, 409, 'CONFLICT');
        this.name = 'ConflictError';
    }
}

// === API 관련 에러 클래스 ===

/**
 * API 에러 클래스 - 외부 API 통신 관련 기본 에러
 */
export class ApiError extends BusinessError {
    constructor(
        public message: string = 'API request failed',
        public statusCode: number = 502,
        public service: string = 'unknown'
    ) {
        super(message, statusCode, 'API_ERROR');
        this.name = 'ApiError';
    }
}

/**
 * API 타임아웃 에러
 */
export class ApiTimeoutError extends ApiError {
    constructor(message: string = 'API request timed out', service: string = 'unknown') {
        super(message, 504, service);
        this.name = 'ApiTimeoutError';
        this.errorCode = 'API_TIMEOUT';
    }
}

/**
 * API 서비스 불가 에러
 */
export class ApiUnavailableError extends ApiError {
    constructor(message: string = 'API service unavailable', service: string = 'unknown') {
        super(message, 503, service);
        this.name = 'ApiUnavailableError';
        this.errorCode = 'API_UNAVAILABLE';
    }
}

/**
 * API 요청 한도 초과 에러
 */
export class ApiRateLimitError extends ApiError {
    constructor(message: string = 'API rate limit exceeded', service: string = 'unknown') {
        super(message, 429, service);
        this.name = 'ApiRateLimitError';
        this.errorCode = 'API_RATE_LIMIT';
    }
}

/**
 * API 응답 형식 오류
 */
export class ApiResponseFormatError extends ApiError {
    constructor(message: string = 'Invalid API response format', service: string = 'unknown') {
        super(message, 502, service);
        this.name = 'ApiResponseFormatError';
        this.errorCode = 'API_RESPONSE_FORMAT';
    }
}

/**
 * 유효성 검사 에러 - 입력값 유효성 검사 실패 시
 */
export class ValidationError extends BusinessError {
    constructor(
        message: string = 'Validation failed',
        public errors: Record<string, string> = {}
    ) {
        super(message, 400, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
    }
}