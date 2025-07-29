// 입력 타입 - 클라이언트에서 받는 데이터
export interface MemberInput {
  id: string; // 로그인에 사용하는 ID
  email: string;
  name: string;
  password: string;
}

// DB 출력 타입 - 데이터베이스에서 가져오는 데이터 (비밀번호 포함)
export interface MemberOutput {
  uid: string;
  id: string;
  email: string;
  name: string;
  password: string; // DB에서는 비밀번호를 포함
  createdAt: Date;
  updatedAt: Date;
}

export interface MemberParams {
  id: string;
}

export interface MemberBody {
  email: string;
  name: string;
}

// API 응답 타입 - 클라이언트에게 반환하는 데이터 (비밀번호 제외)
export interface MemberResponse {
  id: string;
  email: string;
  name: string;
  createdAt: string; // JSON 직렬화를 위해 string으로 변경
  updatedAt: string; // JSON 직렬화를 위해 string으로 변경
}

// 표준 API 응답 타입 - 성공 응답
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

// 표준 API 응답 타입 - 오류 응답
export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
}

// 인증 관련 응답 타입
export interface AuthResponse {
  data: MemberResponse;
  authenticated: boolean;
  message: string;
}

// 페이지네이션 관련 타입
export interface PaginationQuery {
  skip?: number | string;
  take?: number | string;
}

// 페이지네이션 결과 타입
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    skip: number;
    take: number;
    total: number;
    hasMore: boolean;
  };
}

// 타입 가드 함수들
export function isMemberInput(obj: unknown): obj is MemberInput {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof (obj as any).id === 'string' &&
    typeof (obj as any).email === 'string' &&
    typeof (obj as any).name === 'string' &&
    typeof (obj as any).password === 'string'
  );
}

export function hasIdParam(params: unknown): params is { id: string } {
  return params !== null && typeof params === 'object' && typeof (params as any).id === 'string';
}

// 에러 타입들
export abstract class BaseHttpError extends Error {
  public abstract readonly statusCode: number;
  public abstract readonly errorCode: string;

  constructor(message: string) {
    super(message);
  }

  toResponse() {
    return {
      success: false,
      error: this.message,
      code: this.errorCode,
      statusCode: this.statusCode,
    };
  }
}

export class MemberNotFoundError extends BaseHttpError {
  public readonly statusCode = 404;
  public readonly errorCode = 'MEMBER_NOT_FOUND';

  constructor(message = 'Member not found') {
    super(message);
    this.name = 'MemberNotFoundError';
  }
}

export class DuplicateValueError extends BaseHttpError {
  public readonly statusCode = 409;
  public readonly errorCode = 'DUPLICATE_VALUE';

  constructor(field: string) {
    super(`${field} already in use`);
    this.name = 'DuplicateValueError';
  }
}

export class AuthenticationError extends BaseHttpError {
  public readonly statusCode = 422;
  public readonly errorCode = 'AUTHENTICATION_FAILED';

  constructor(message = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends BaseHttpError {
  public readonly statusCode = 400;
  public readonly errorCode = 'VALIDATION_FAILED';
  public readonly fields: Record<string, string>;

  constructor(message = 'Validation failed', fields: Record<string, string> = {}) {
    super(message);
    this.name = 'ValidationError';
    this.fields = fields;
  }

  toResponse() {
    return {
      success: false,
      error: this.message,
      code: this.errorCode,
      statusCode: this.statusCode,
      fields: this.fields,
    };
  }
}

// 애플리케이션 상수
export const Constants = {
  PAGINATION: {
    DEFAULT_SKIP: 0,
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 6,
    MIN_NAME_LENGTH: 2,
    MIN_ID_LENGTH: 3,
  },
};

// fastify의 요청 타입에 prisma 추가
declare module 'fastify' {
  interface FastifyInstance {
    prisma: import('@prisma/client').PrismaClient;
  }
}
