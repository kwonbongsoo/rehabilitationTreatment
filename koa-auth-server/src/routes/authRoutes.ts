import Router from 'koa-router';
import { AuthController } from '../controllers/authController';
import { AuthMiddleware } from '../middlewares/authMiddleware';

/**
 * Creates and configures a Koa router with authentication-related endpoints under the `/api/auth` prefix.
 *
 * The router includes public endpoints for login and guest token issuance (protected by basic authentication), token verification, session information, user profile and info retrieval, logout, and a health check endpoint.
 *
 * @param controller - The authentication controller instance used to handle route logic.
 * @returns A configured Koa router instance with authentication routes.
 */
export function createAuthRouter(controller: AuthController): Router {
  const router = new Router({
    prefix: '/api/auth',
  });
  const authController = new AuthController();
  const authMiddleware = new AuthMiddleware();

  /**
   * 공개 엔드포인트 (인증 불필요)
   */
  router.post('/login', authMiddleware.verifyBasicAuth, authController.login);
  router.post('/guest-token', authMiddleware.verifyBasicAuth, authController.guestToken);
  router.get('/public', authController.public);

  /**
   * 게스트, 사용자 토큰 검증
   */

  router.get('/verify', authMiddleware.requireToken, authController.verify);

  router.get('/session-info', authMiddleware.requireToken, authController.sessionInfo);

  /**
   * 로그인 사용자 필요 엔드포인트
   */
  router.get('/profile', authMiddleware.requireUser, authController.profile);
  router.get('/user-info', authMiddleware.requireUser, authController.userInfo);
  router.post('/logout', authMiddleware.requireUser, authController.logout);

  // 헬스 체크 엔드포인트
  router.get('/health', async (ctx) => {
    ctx.body = {
      status: 'ok',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
    };
  });
  return router;
}
