import Router from 'koa-router';
import { AuthController } from '../controllers/authController';
import { checkAuthUser, checkAuthOrGuest } from '../middleware/authMiddleware';

const authController = new AuthController();

export function setAuthRoutes(router: Router) {
    // 헬스 체크 엔드포인트 추가
    router.get('/health', async (ctx) => {
        ctx.body = { status: 'ok' };
    });

    router.post('/login', authController.login);
    router.post('/auth/guest', authController.guestToken);
    router.get('/auth/verify', authController.verify);
    router.get('/profile', checkAuthUser, authController.profile);
    router.get('/public', checkAuthOrGuest, authController.public);
    router.get('/userinfo', checkAuthUser, authController.userInfo);

    return router.routes();
}