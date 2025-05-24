import dotenv from 'dotenv';
dotenv.config();

import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import { validateConfig } from './utils/config';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';
import { setAuthRoutes } from './routes/authRoutes';

export function createApp(): Koa {
    // 환경변수 검증
    validateConfig();

    const app = new Koa();
    const router = new Router();

    // 미들웨어 등록 (순서 중요)
    app.use(errorHandler);
    app.use(requestLogger);
    app.use(bodyParser());

    // 라우터 등록
    app.use(setAuthRoutes(router));
    app.use(router.allowedMethods());

    return app;
}