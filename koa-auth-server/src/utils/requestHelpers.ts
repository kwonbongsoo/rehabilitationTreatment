import { Context } from 'koa';
import { LoginBody } from '../interfaces/auth';
import { AuthenticationError, ValidationError } from '../middlewares/errorMiddleware';

/**
 * 요청 본문에서 로그인 자격 증명 추출
 */
export function extractCredentials(ctx: Context): LoginBody {
  return ctx.request.body as LoginBody;
}

/**
 * 자격 증명 유효성 검사
 * @throws {ValidationError} 유효성 검사 실패 시
 */
export function validateCredentials(credentials: LoginBody): void {
  const { id, password } = credentials;
  const errors: Record<string, string> = {};

  if (!id) {
    errors.id = 'Id is required';
  } else if (id.length < 3) {
    errors.id = 'Id must be at least 3 characters';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  if (Object.keys(errors).length > 0) {
    // ValidationError는 single field validation을 위한 것이므로,
    // 여러 필드 오류가 있을 때는 첫 번째 필드의 오류를 사용
    const firstField = Object.keys(errors)[0];
    throw new ValidationError('Validation failed', {
      field: firstField,
      reason: errors[firstField],
    });
  }
}

/**
 * Authorization 헤더에서 Bearer 토큰 추출
 * @throws {Error} 토큰 형식이 잘못된 경우
 */
export function extractBearerToken(authHeader: string | undefined): string {
  if (!authHeader) {
    throw new AuthenticationError('Authorization header missing');
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new AuthenticationError('Invalid token format');
  }

  return parts[1];
}
