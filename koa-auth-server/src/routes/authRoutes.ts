import Router from 'koa-router';
import { AuthController } from '../controllers/authController';
import { generateGuestToken } from '../utils/guestToken';
import { checkAuthUser, checkAuthOrGuest } from '../middleware/authMiddleware';

const authController = new AuthController();

export function setAuthRoutes(router: Router) {
    // 로그인, 회원가입은 인증 필요 없음
    router.post('/login', authController.login);
    router.post('/register', authController.register);

    // 게스트 토큰 발급은 인증 필요 없음
    router.post('/auth/guest', async (ctx) => {
        const token = generateGuestToken();
        ctx.body = { token };
    });

    // 예시: 로그인 유저만 접근 가능한 API
    router.get('/profile', checkAuthUser, async (ctx) => {
        ctx.body = { user: ctx.state.user };
    });

    // 예시: 게스트/유저 모두 접근 가능한 API
    router.get('/public', checkAuthOrGuest, async (ctx) => {
        ctx.body = { message: '게스트/유저 모두 접근 가능', user: ctx.state.user };
    });

    router.get('/userinfo', checkAuthUser, authController.userInfo.bind(authController));

    return router.routes();
}