/**
 * API 에러 처리 시스템 (Common 모듈 기반)
 * - common/src/errors의 BaseError 확장
 * - API 특화 에러 타입 추가
 * - 사용자 친화적 메시지 지원
 */

import { BaseError, ErrorCode } from '@ecommerce/common';
import type { ErrorDetails } from './types';

/**
 * API 전용 에러 코드 확장
 */
export const ApiErrorCode = {
  ...ErrorCode,
  // 네트워크 관련 (4xxx)
  NETWORK_ERROR: 'NET_4001',
  TIMEOUT_ERROR: 'NET_4002',
  CONNECTION_ERROR: 'NET_4003',

  // API 클라이언트 관련 (6xxx)
  REQUEST_CANCELLED: 'API_6001',
  INVALID_RESPONSE: 'API_6002',
  PARSING_ERROR: 'API_6003',
} as const;

export type ApiErrorType =
  | 'network_error' // 네트워크 연결 오류
  | 'timeout_error' // 요청 타임아웃
  | 'validation_error' // 입력 데이터 검증 오류
  | 'authentication_error' // 인증 오류
  | 'authorization_error' // 권한 오류
  | 'not_found_error' // 리소스 없음
  | 'conflict_error' // 데이터 충돌
  | 'rate_limit_error' // 요청 횟수 제한
  | 'server_error' // 서버 내부 오류
  | 'unknown_error'; // 알 수 없는 오류

/**
 * API 에러 클래스 (BaseError 확장)
 */
export class ApiError extends BaseError {
  public readonly type: ApiErrorType;
  public readonly timestamp: string;

  constructor(message: string, statusCode: number, details?: ErrorDetails, type?: ApiErrorType) {
    const errorCode = ApiError.getErrorCodeFromStatus(statusCode);
    super(errorCode as ErrorCode, message, details, statusCode);

    this.name = 'ApiError';
    this.type = type || this.inferErrorType(statusCode);
    this.timestamp = new Date().toISOString();
  }

  /**
   * HTTP 상태 코드에서 에러 코드 매핑
   */
  private static getErrorCodeFromStatus(statusCode: number): string {
    switch (statusCode) {
      case 0:
        return ApiErrorCode.NETWORK_ERROR;
      case 400:
        return ApiErrorCode.VALIDATION_ERROR;
      case 401:
        return ApiErrorCode.INVALID_CREDENTIALS;
      case 403:
        return ApiErrorCode.INTERNAL_ERROR;
      case 404:
        return ApiErrorCode.RESOURCE_NOT_FOUND;
      case 408:
        return ApiErrorCode.TIMEOUT_ERROR;
      case 409:
        return ApiErrorCode.DUPLICATE_RESOURCE;
      case 429:
        return ApiErrorCode.RATE_LIMIT_EXCEEDED;
      case 500:
      case 502:
      case 503:
      case 504:
        return ApiErrorCode.INTERNAL_ERROR;
      default:
        return ApiErrorCode.INTERNAL_ERROR;
    }
  }

  /**
   * 상태 코드를 기반으로 에러 타입 추론
   */
  private inferErrorType(statusCode: number): ApiErrorType {
    switch (statusCode) {
      case 0:
        return 'network_error';
      case 400:
        return 'validation_error';
      case 401:
        return 'authentication_error';
      case 403:
        return 'authorization_error';
      case 404:
        return 'not_found_error';
      case 408:
        return 'timeout_error';
      case 409:
        return 'conflict_error';
      case 429:
        return 'rate_limit_error';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'server_error';
      default:
        return 'unknown_error';
    }
  }

  /**
   * 사용자 친화적 메시지 반환
   */
  getUserMessage(): string {
    switch (this.type) {
      case 'network_error':
        return '네트워크 연결을 확인해주세요.';
      case 'timeout_error':
        return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
      case 'validation_error':
        return this.details?.field
          ? `${this.details.field} 항목을 확인해주세요.`
          : '입력 정보를 확인해주세요.';
      case 'authentication_error':
        return '로그인이 필요합니다.';
      case 'authorization_error':
        return '접근 권한이 없습니다.';
      case 'not_found_error':
        return '요청한 정보를 찾을 수 없습니다.';
      case 'conflict_error':
        return '이미 존재하는 정보입니다.';
      case 'rate_limit_error':
        return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
      case 'server_error':
        return '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
      default:
        return this.message || '알 수 없는 오류가 발생했습니다.';
    }
  }

  /**
   * 재시도 가능한 에러인지 확인
   */
  isRetryable(): boolean {
    return ['network_error', 'timeout_error', 'rate_limit_error', 'server_error'].includes(
      this.type,
    );
  }

  /**
   * 확장된 JSON 직렬화 (BaseError의 toResponse 확장)
   */
  toJSON() {
    return {
      ...this.toResponse(),
      type: this.type,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      userMessage: this.getUserMessage(),
      isRetryable: this.isRetryable(),
    };
  }
}

/**
 * Common 모듈의 기존 에러들을 API 컨텍스트에서 재활용
 */
import {
  ValidationError,
  AuthenticationError,
  NotFoundError,
  DuplicateResourceError,
} from '@ecommerce/common';

/**
 * 에러 생성 헬퍼 함수들 (Common 모듈 기반)
 */
export const ErrorFactory = {
  /**
   * 네트워크 에러 생성
   */
  networkError(message = '네트워크 연결을 확인해주세요'): ApiError {
    return new ApiError(message, 0, undefined, 'network_error');
  },

  /**
   * 타임아웃 에러 생성
   */
  timeoutError(message = '요청 시간이 초과되었습니다'): ApiError {
    return new ApiError(message, 408, undefined, 'timeout_error');
  },

  /**
   * 인증 에러 생성 (Common 모듈 활용)
   */
  authenticationError(message = '인증이 필요합니다'): AuthenticationError {
    return new AuthenticationError(message);
  },

  /**
   * 권한 에러 생성
   */
  authorizationError(message = '접근 권한이 없습니다'): ApiError {
    return new ApiError(message, 403, undefined, 'authorization_error');
  },

  /**
   * 검증 에러 생성 (Common 모듈 활용)
   */
  validationError(message: string, field?: string): ValidationError {
    return new ValidationError(message, field ? { field, reason: message } : undefined);
  },

  /**
   * 리소스 없음 에러 생성 (Common 모듈 활용)
   */
  notFoundError(message = '요청한 정보를 찾을 수 없습니다'): NotFoundError {
    return new NotFoundError(message);
  },

  /**
   * 중복 리소스 에러 생성 (Common 모듈 활용)
   */
  duplicateResourceError(message: string, details?: ErrorDetails): DuplicateResourceError {
    return new DuplicateResourceError(message, details);
  },

  /**
   * 서버 에러 생성
   */
  serverError(message = '서버 오류가 발생했습니다'): ApiError {
    return new ApiError(message, 500, undefined, 'server_error');
  },

  /**
   * 요청 취소 에러 생성
   */
  requestCancelledError(message = '요청이 취소되었습니다'): ApiError {
    return new ApiError(
      message,
      408,
      { code: ApiErrorCode.REQUEST_CANCELLED, message },
      'timeout_error',
    );
  },
};

/**
 * 에러 타입 체크 유틸리티
 */
export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};

/**
 * BaseError 기반 에러인지 확인 (Common 모듈 포함)
 */
export const isBaseError = (error: unknown): error is BaseError => {
  return error instanceof BaseError;
};

/**
 * 특정 타입의 API 에러인지 확인
 */
export const isApiErrorType = (error: unknown, type: ApiErrorType): boolean => {
  return isApiError(error) && error.type === type;
};

/**
 * 에러에서 사용자 메시지 추출 (공통 인터페이스)
 */
export const getUserMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.getUserMessage();
  }

  if (isBaseError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '알 수 없는 오류가 발생했습니다.';
};
