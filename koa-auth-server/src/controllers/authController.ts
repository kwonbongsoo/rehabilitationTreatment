import { Context } from 'koa';
import { AuthService } from '../services/authService';
import { Config } from '../config/config';
import { extractCredentials, extractBearerToken } from '../utils/requestHelpers';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHelpers';
import { AuthenticationError, ValidationError } from '../middlewares/errorMiddleware';

export class AuthController {
    private authService: AuthService;
    private config: Config;

    constructor(authService?: AuthService, config?: Config) {
        // 의존성 주입 패턴 적용
        this.authService = authService || new AuthService();
        this.config = config || new Config();
    }

    /**
     * 사용자 로그인 처리
     */
    public login = async (ctx: Context): Promise<void> => {
        try {
            const credentials = extractCredentials(ctx);

            const { token } = await this.authService.login(credentials);
            sendSuccessResponse(ctx, { token });
        } catch (err: unknown) {
            // 에러 타입에 따른 다양한 응답 처리
            if (err instanceof ValidationError) {
                sendErrorResponse(ctx, err, 400);
            } else if (err instanceof AuthenticationError) {
                sendErrorResponse(ctx, err, 401);
            } else {
                sendErrorResponse(ctx, err, 500, 'Login failed');
            }
        }
    };

    /**
     * 게스트 토큰 발급
     */
    public guestToken = async (ctx: Context): Promise<void> => {
        try {
            const { token } = await this.authService.createGuestToken();
            sendSuccessResponse(ctx, { token });
        } catch (err: unknown) {
            sendErrorResponse(ctx, err, 500, 'Failed to generate guest token');
        }
    };

    /**
     * 사용자 프로필 정보 반환
     */
    public profile = async (ctx: Context): Promise<void> => {
        sendSuccessResponse(ctx, { user: ctx.state.user });
    };

    /**
     * 공개 접근 가능한 엔드포인트
     */
    public public = async (ctx: Context): Promise<void> => {
        sendSuccessResponse(ctx, {
            message: '게스트/유저 모두 접근 가능',
            user: ctx.state.user
        });
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
            sendSuccessResponse(ctx, { user: userInfo });
        } catch (err: unknown) {
            sendErrorResponse(ctx, err, 500, 'Failed to retrieve user info');
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

            // secret 인자 제거
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
                message: 'Successfully logged out'
            });
        } catch (err) {
            // 모든 오류는 여기서 처리
            sendErrorResponse(ctx, err, 500, 'Logout failed');
        }
    };
}