import { Context } from 'koa';
import { BaseError } from '../middlewares/errorMiddleware';

/**
 * 성공 응답 생성
 */
export function sendSuccessResponse(ctx: Context, data: any = {}): void {
  ctx.status = 200;
  ctx.body = {
    success: true,
    ...data,
  };
}

/**
 * 오류 응답 생성
 * BaseError의 statusCode를 우선적으로 사용
 */
export function sendErrorResponse(
  ctx: Context,
  error: unknown,
  defaultStatus: number = 500,
  defaultMessage: string = 'Something went wrong',
): void {
  // BaseError 인스턴스인 경우 해당 statusCode 사용
  if (error instanceof BaseError) {
    ctx.status = error.statusCode;
    ctx.body = {
      success: false,
      message: error.message,
      code: error.code,
    };
    return;
  }

  // 일반 Error 객체인 경우
  if (error instanceof Error) {
    // Error 객체에 statusCode 속성이 있는 경우 (예: HTTP 에러)
    const statusCode = (error as any).statusCode || (error as any).status;
    ctx.status = statusCode || defaultStatus;
    ctx.body = {
      success: false,
      message: error.message,
      code: (error as any).code || 'UNKNOWN_ERROR',
    };
    return;
  }

  // 기타 경우 기본값 사용
  ctx.status = defaultStatus;
  ctx.body = {
    success: false,
    message: defaultMessage,
    code: 'UNKNOWN_ERROR',
  };
}

/**
 * 데이터 없음 응답 생성
 */
export function sendNotFoundResponse(ctx: Context, message: string = 'Resource not found'): void {
  ctx.status = 404;
  ctx.body = {
    success: false,
    message,
  };
}
