import { Context, Next } from 'koa';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import {
  BaseError,
  ErrorCode,
  ErrorResponse,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  DuplicateResourceError,
} from '@ecommerce/common';

// Re-export error classes for backward compatibility
export {
  BaseError,
  AuthenticationError,
  ForbiddenError,
  ValidationError,
  NotFoundError,
  DuplicateResourceError,
  ErrorCode,
} from '@ecommerce/common';

export type {
  ErrorResponse,
} from '@ecommerce/common';

/**
 * 글로벌 에러 핸들러 미들웨어
 * 모든 예외를 중앙에서 처리하여 일관된 오류 응답 제공
 */
export const errorMiddleware = async (ctx: Context, next: Next): Promise<void> => {
  try {
    await next();
  } catch (error) {
    // 구체적인 에러 타입부터 먼저 체크
    if (error instanceof AuthenticationError) {
      ctx.status = 401;
      ctx.body = {
        error: {
          code: 'UNAUTHORIZED',
          message: error.message,
          details: null,
        },
      };
    } else if (error instanceof ValidationError) {
      ctx.status = 400;
      ctx.body = {
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          details: error.details,
        },
      };
    } else if (error instanceof NotFoundError) {
      ctx.status = 404;
      ctx.body = {
        error: {
          code: 'NOT_FOUND',
          message: error.message,
          details: null,
        },
      };
    } else if (error instanceof DuplicateResourceError) {
      ctx.status = 409;
      ctx.body = {
        error: {
          code: 'DUPLICATE_RESOURCE',
          message: error.message,
          details: error.details,
        },
      };
    } else if (error instanceof BaseError) {
      ctx.status = error.statusCode;
      ctx.body = {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      };
    } else if (error instanceof JsonWebTokenError) {
      ctx.status = 401;
      ctx.body = {
        error: {
          code: 'INVALID_TOKEN',
          message: error.message,
          details: null,
        },
      };
    } else if (error instanceof TokenExpiredError) {
      ctx.status = 401;
      ctx.body = {
        error: {
          code: 'TOKEN_EXPIRED',
          message: error.message,
          details: null,
        },
      };
    } else {
      ctx.status = 500;
      ctx.body = {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
          details: null,
        },
      };
    }
  }
};

/**
 * 객체가 JWT 에러 형식인지 확인하는 타입 가드
 */
function isJwtError(err: unknown): err is { name: string; message: string } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'name' in err &&
    ((err as { name: string }).name === 'JsonWebTokenError' ||
      (err as { name: string }).name === 'TokenExpiredError')
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

// === 로컬에서만 필요한 추가 에러 클래스들 ===
// 기본 에러 클래스들은 @ecommerce/common 패키지에서 가져옵니다

export class ConflictError extends BaseError {
  constructor(message: string = 'Resource conflict') {
    super(ErrorCode.DUPLICATE_RESOURCE, message, undefined, 409);
  }
}

// === API 관련 에러 클래스 ===

export class ApiError extends BaseError {
  constructor(
    message: string = 'API request failed',
    statusCode: number = 502,
    public service: string = 'unknown',
  ) {
    super(ErrorCode.INTERNAL_ERROR, message, { context: { service } }, statusCode);
  }
}

export class ApiTimeoutError extends ApiError {
  constructor(message: string = 'API request timed out', service: string = 'unknown') {
    super(message, 504, service);
  }
}

export class ApiUnavailableError extends ApiError {
  constructor(message: string = 'API service unavailable', service: string = 'unknown') {
    super(message, 503, service);
  }
}

export class ApiRateLimitError extends ApiError {
  constructor(message: string = 'API rate limit exceeded', service: string = 'unknown') {
    super(message, 429, service);
  }
}

export class ApiResponseFormatError extends ApiError {
  constructor(message: string = 'Invalid API response format', service: string = 'unknown') {
    super(message, 502, service);
  }
}
