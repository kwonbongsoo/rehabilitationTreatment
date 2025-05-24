import { Context, Next } from 'koa';

export class HttpError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'HttpError';
    }
}

export class ApiError extends HttpError {
    constructor(
        status: number,
        message: string,
        public readonly originalError?: unknown,
        public readonly source: string = 'external-api'
    ) {
        super(status, message);
        this.name = 'ApiError';
    }
}


export async function errorHandler(ctx: Context, next: Next): Promise<void> {
    try {
        await next();
    } catch (err: unknown) {
        ctx.status = err instanceof HttpError ? err.status : 500;
        ctx.body = {
            message: err instanceof Error ? err.message : 'Internal Server Error',
            status: ctx.status
        };

        // API 에러인 경우 추가 로깅
        if (err instanceof ApiError) {
            console.error(`API Error from ${err.source}:`, err.originalError || err);
        } else {
            console.error('Application Error:', err);
        }

        ctx.app.emit('error', err, ctx);
    }
}