import dotenv from 'dotenv';
dotenv.config();
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { createAuthRouter } from './routes/authRoutes';
import { errorHandlerMiddleware } from './middlewares/errorMiddleware';
import { requestLogger } from './middlewares/logger';
import { AuthController } from './controllers/authController';
import { AuthService } from './services/authService';

/**
 * 환경 변수 검증
 */
function validateConfig(): void {
    const requiredEnvVars = ['JWT_SECRET', 'REDIS_URL'];

    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            throw new Error(`Missing required environment variable: ${envVar}`);
        }
    }
}

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

    try {

        // 컨트롤러 생성
        const authController = new AuthController(new AuthService());

        // 라우터 생성 및 등록 (라우팅 로직만 포함)
        const authRouter = createAuthRouter(authController);
        app.use(authRouter.routes());
        app.use(authRouter.allowedMethods());
    } catch (error) {
        console.error('라우터 설정 실패:', error);
        throw new Error('라우터를 설정할 수 없습니다');
    }

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