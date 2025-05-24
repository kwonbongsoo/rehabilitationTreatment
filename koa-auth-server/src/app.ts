import dotenv from 'dotenv';
dotenv.config();

import Koa from 'koa';
import cors from '@koa/cors'
import bodyParser from 'koa-bodyparser';
import { validateConfig } from './utils/config';
import { requestLogger } from './middlewares/logger';
import { authRouter } from './routes/authRoutes';
import { errorHandlerMiddleware } from './middlewares/errorMiddleware';

/**
 * Koa 애플리케이션 생성 및 설정
 */
export function createApp(): Koa {
    const app = new Koa();

    // 환경변수 검증
    validateConfig();

    // 글로벌 에러 핸들러
    app.use(errorHandlerMiddleware);
    // 요청 로거 미들웨어
    app.use(requestLogger);

    // 기본 미들웨어
    app.use(bodyParser());
    app.use(cors({
        credentials: true,
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowHeaders: ['Authorization', 'Content-Type']
    }));

    // 라우터 등록
    app.use(authRouter.routes());
    app.use(authRouter.allowedMethods());

    // 404 핸들러
    app.use(async (ctx) => {
        ctx.status = 404;
        ctx.body = {
            success: false,
            message: 'Endpoint not found'
        };
    });

    return app;
}