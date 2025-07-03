import { Context } from 'koa';
import { AuthService } from '../services/authService';
import { extractCredentials, extractBearerToken } from '../utils/requestHelpers';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHelpers';
import { AuthenticationError, ValidationError, BaseError } from '../middlewares/errorMiddleware';

export class AuthController {
  private authService: AuthService;
  private static instance: AuthController;

  private constructor(authService?: AuthService) {
    // 의존성 주입 패턴 적용
    this.authService = authService || AuthService.getInstance();
  }

  public static getInstance(): AuthController {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController(AuthService.getInstance());
    }
    return AuthController.instance;
  }

  /**
   * 사용자 로그인 처리
   */
  public login = async (ctx: Context): Promise<void> => {
    try {
      const credentials = extractCredentials(ctx);

      // 기존 게스트 토큰 추출 (X-Previous-Token 헤더에서)
      const previousToken = ctx.headers['x-previous-token'] as string | undefined;

      const tokenPayload = await this.authService.login(credentials, previousToken);
      sendSuccessResponse(ctx, tokenPayload);
    } catch (err: unknown) {
      // BaseError(ApiError 포함)는 자체 statusCode를 사용
      // sendErrorResponse에서 자동으로 처리
      sendErrorResponse(ctx, err, 500, 'Login failed');
    }
  };

  /**
   * 게스트 토큰 발급
   */
  public guestToken = async (ctx: Context): Promise<void> => {
    try {
      const tokenPayload = await this.authService.createGuestToken();
      sendSuccessResponse(ctx, tokenPayload);
    } catch (err: unknown) {
      sendErrorResponse(ctx, err, 500, 'Failed to generate guest token');
    }
  };

  /**
   * 토큰 기반 사용자 정보 조회
   */
  public userInfo = async (ctx: Context): Promise<void> => {
    try {
      const token = extractBearerToken(ctx.headers.authorization);

      if (!token) {
        sendErrorResponse(ctx, new Error('Authorization header missing'), 401);
        return;
      }

      const userInfo = await this.authService.getUserInfoByToken(token);
      sendSuccessResponse(ctx, userInfo);
    } catch (err: unknown) {
      sendErrorResponse(ctx, err, 500, 'Failed to retrieve user info');
    }
  };

  /**
   * 토큰 기반 사용자 정보 조회
   */
  public sessionInfo = async (ctx: Context): Promise<void> => {
    try {
      const token = extractBearerToken(ctx.headers.authorization);

      if (!token) {
        sendErrorResponse(ctx, new Error('Authorization header missing'), 401);
        return;
      }

      const userInfo = await this.authService.getSessionInfoByToken(token);
      sendSuccessResponse(ctx, userInfo);
    } catch (err: unknown) {
      sendErrorResponse(ctx, err, 500, 'Failed to retrieve session info');
    }
  };

  /**
   * 토큰 유효성 검증
   */
  public verify = async (ctx: Context): Promise<void> => {
    try {
      const token = extractBearerToken(ctx.headers.authorization);
      if (!token) {
        sendErrorResponse(ctx, new Error('Authorization header missing'), 401);
        return;
      }

      const { status, message } = await this.authService.verifyTokenWithStatus(token);

      ctx.status = status;
      ctx.body = { success: status === 200, message };
    } catch (err: unknown) {
      sendErrorResponse(ctx, err, 500, 'Token verification failed');
    }
  };

  /**
   * 사용자 로그아웃 처리
   */
  public logout = async (ctx: Context): Promise<void> => {
    try {
      const token = ctx.state.token;
      if (!token) {
        sendErrorResponse(ctx, new Error('Token is required'), 400);
        return;
      }

      // Redis에서 토큰 세션 삭제 (이제 예외를 던짐)
      await this.authService.removeSession(token);

      // 성공 시 항상 이 코드에 도달
      sendSuccessResponse(ctx, {
        message: 'Successfully logged out',
      });
    } catch (err) {
      // 모든 오류는 여기서 처리
      sendErrorResponse(ctx, err, 500, 'Logout failed');
    }
  };
}
