import { Context } from 'koa';

/**
 * 성공 응답 생성
 */
export function sendSuccessResponse(ctx: Context, data: any = {}): void {
    ctx.status = 200;
    ctx.body = {
        success: true,
        ...data
    };
}

/**
 * 오류 응답 생성
 */
export function sendErrorResponse(
    ctx: Context,
    error: unknown,
    status: number = 500,
    defaultMessage: string = 'Something went wrong'
): void {
    ctx.status = status;
    ctx.body = {
        success: false,
        message: error instanceof Error ? error.message : defaultMessage,
        code: error instanceof Error && 'code' in error ? (error as any).code : 'UNKNOWN_ERROR'
    };
}

/**
 * 데이터 없음 응답 생성
 */
export function sendNotFoundResponse(ctx: Context, message: string = 'Resource not found'): void {
    ctx.status = 404;
    ctx.body = {
        success: false,
        message
    };
}