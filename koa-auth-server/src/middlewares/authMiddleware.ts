import { Context, Next } from 'koa';
import { Config } from '../config/config';
import { TokenService } from '../services/tokenService';
import { extractBearerToken } from '../utils/requestHelpers';
import { AuthenticationError, ForbiddenError } from './errorMiddleware';

/**
 * 인증 미들웨어 클래스
 * - 토큰 존재 여부만 확인
 * - 토큰에서 role 정보를 직접 확인
 * - 서비스 호출 없이 독립적으로 작동
 */
export class AuthMiddleware {
  private static instance: AuthMiddleware;
  private tokenService: TokenService;

  constructor() {
    // TokenService 인스턴스 생성
    this.tokenService = TokenService.getInstance(new Config());
  }

  public static getInstance(): AuthMiddleware {
    if (!AuthMiddleware.instance) {
      AuthMiddleware.instance = new AuthMiddleware();
    }
    return AuthMiddleware.instance;
  }

  /**
   * Basic 키 검증 미들웨어
   */
  public async verifyBasicAuth(ctx: Context, next: Next) {
    try {
      const authHeader = ctx.headers.authorization;

      // 헤더에 Authorization이 없거나 형식이 잘못된 경우
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        throw new AuthenticationError('Authorization header missing');
      }

      // Base64 디코딩
      const base64Credentials = authHeader.split(' ')[1].trim();
      const key = Buffer.from(base64Credentials, 'base64')
        .toString('utf-8')
        .replace(/\r?\n|\r/g, '')
        .trim();

      // 환경 변수에 저장된 키와 비교
      const expected = process.env.AUTH_BASIC_KEY?.trim();
      if (!expected) {
        throw new AuthenticationError('Server misconfiguration: AUTH_BASIC_KEY not set');
      } else if (key !== expected) {
        throw new ForbiddenError('Forbidden: Invalid API key');
      }

      // 검증 성공
      await next();
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw error;
      }
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError(
        error instanceof Error ? error.message : 'Invalid token format',
      );
    }
  }
  /**
   * 토큰 존재 확인 미들웨어 - 토큰이 있어야 함 (검증은 컨트롤러에서)
   */
  public requireToken = async (ctx: Context, next: Next): Promise<void> => {
    ctx.state.token = extractBearerToken(ctx.headers.authorization);
    await next();
  };

  /**
   * 로그인 사용자 필요 미들웨어 - 게스트 거부
   * 토큰에서 role을 직접 확인
   */
  public requireUser = async (ctx: Context, next: Next): Promise<void> => {
    try {
      // 토큰 추출
      const token = extractBearerToken(ctx.headers.authorization);
      if (!token) {
        throw new AuthenticationError('Authorization header missing or invalid format');
      }

      ctx.state.token = token;

      // 토큰 검증 및 페이로드 추출
      const payload = this.tokenService.verifyToken(token);

      // 게스트 토큰 거부
      if (payload.role === 'guest') {
        throw new ForbiddenError('This endpoint requires a logged-in user');
      }

      await next();
    } catch (error) {
      // 에러 타입 보존
      if (error instanceof ForbiddenError) {
        throw error;
      }
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError(
        error instanceof Error ? error.message : 'Invalid token format',
      );
    }
  };

  /**
   * 관리자 역할 필요 미들웨어
   */
  public requireAdmin = async (ctx: Context, next: Next): Promise<void> => {
    try {
      // 토큰 추출
      const token = extractBearerToken(ctx.headers.authorization);
      if (!token) {
        throw new AuthenticationError('Authorization header missing');
      }

      ctx.state.token = token;

      // 토큰 검증 및 페이로드 추출
      const payload = this.tokenService.verifyToken(token);

      // 관리자 권한 확인
      if (payload.role !== 'admin') {
        throw new ForbiddenError('Admin privileges required');
      }

      await next();
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw error;
      }
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError(
        error instanceof Error ? error.message : 'Token verification failed',
      );
    }
  };

  /**
   * 특정 역할들만 허용하는 미들웨어 생성기
   */
  public allowRoles = (roles: string[]) => {
    return async (ctx: Context, next: Next): Promise<void> => {
      try {
        // 토큰 추출
        const token = extractBearerToken(ctx.headers.authorization);
        if (!token) {
          throw new AuthenticationError('Authorization header missing');
        }

        ctx.state.token = token;

        // 토큰 검증 및 페이로드 추출
        const payload = this.tokenService.verifyToken(token);

        // 역할 확인
        if (!roles.includes(payload.role)) {
          throw new ForbiddenError(`Required role: ${roles.join(' or ')}`);
        }

        await next();
      } catch (error) {
        if (error instanceof ForbiddenError) {
          throw error;
        }
        if (error instanceof AuthenticationError) {
          throw error;
        }
        throw new AuthenticationError(
          error instanceof Error ? error.message : 'Token verification failed',
        );
      }
    };
  };
}

// 미들웨어 인스턴스 생성 (싱글톤)
export const authMiddleware = AuthMiddleware.getInstance();

// 함수 형태로 내보내기 (사용 편의성)
export const requireToken = authMiddleware.requireToken;
export const requireUser = authMiddleware.requireUser;
export const requireAdmin = authMiddleware.requireAdmin;
export const allowRoles = authMiddleware.allowRoles;
