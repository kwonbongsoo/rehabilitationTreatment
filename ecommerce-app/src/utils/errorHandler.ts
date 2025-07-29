/**
 * Common 패키지의 에러 클래스를 활용한 Next.js 전용 에러 핸들러
 */

import { BaseError, ErrorCode } from '@ecommerce/common';

/**
 * Next.js 클라이언트 에러 정규화
 */
export function normalizeError(error: unknown): {
  code: string;
  message: string;
  statusCode: number;
  canRetry: boolean;
} {
  // BaseError 또는 그 하위 클래스인 경우
  if (error instanceof BaseError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      canRetry: error.statusCode >= 500, // 서버 에러만 재시도 가능
    };
  }

  // 일반 Error 객체인 경우
  if (error instanceof Error) {

    // 인증 관련 에러 감지 (401)
    if (
      error.message.toLowerCase().includes('auth') ||
      error.message.toLowerCase().includes('login') ||
      error.message.toLowerCase().includes('token')
    ) {
      return {
        code: ErrorCode.INVALID_CREDENTIALS,
        message: '로그인이 필요합니다.',
        statusCode: 401,
        canRetry: false,
      };
    }

    // 네트워크 에러 감지
    if (
      error.message.toLowerCase().includes('network') ||
      error.message.toLowerCase().includes('fetch')
    ) {
      return {
        code: ErrorCode.SERVICE_UNAVAILABLE,
        message: '네트워크 연결을 확인해주세요.',
        statusCode: 503,
        canRetry: true,
      };
    }

    return {
      code: ErrorCode.INTERNAL_ERROR,
      message: error.message,
      statusCode: 500,
      canRetry: true,
    };
  }

  // 기타 모든 경우
  return {
    code: ErrorCode.INTERNAL_ERROR,
    message: '알 수 없는 오류가 발생했습니다.',
    statusCode: 500,
    canRetry: true,
  };
}

/**
 * 에러 상황에 따른 사용자 액션 제안
 */
export function getErrorActions(error: ReturnType<typeof normalizeError>) {
  const actions: Array<{
    label: string;
    action: 'retry' | 'reload' | 'navigate' | 'login';
    href?: string;
  }> = [];

  // 재시도 가능한 에러
  if (error.canRetry) {
    actions.push({ label: '다시 시도', action: 'retry' });
  }

  // 인증 에러
  if (error.statusCode === 401) {
    // 401 에러 시 즉시 새로고침
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
    actions.push({ label: '로그인', action: 'login', href: '/auth/login' });
  }

  // 404 에러
  if (error.statusCode === 404) {
    actions.push({ label: '홈으로', action: 'navigate', href: '/' });
  }

  // 서버 에러
  if (error.statusCode >= 500) {
    actions.push({ label: '새로고침', action: 'reload' });
  }

  return actions;
}

/**
 * 에러 메시지 사용자 친화적 변환
 */
export function getUserFriendlyMessage(error: ReturnType<typeof normalizeError>): string {
  switch (error.code) {
    case ErrorCode.INVALID_CREDENTIALS:
      return '로그인 정보가 올바르지 않습니다.';
    case ErrorCode.TOKEN_EXPIRED:
      return '로그인이 만료되었습니다. 다시 로그인해주세요.';
    case ErrorCode.VALIDATION_ERROR:
      return '입력 정보를 확인해주세요.';
    case ErrorCode.RESOURCE_NOT_FOUND:
      return '요청하신 페이지를 찾을 수 없습니다.';
    case ErrorCode.SERVICE_UNAVAILABLE:
      return '서비스가 일시적으로 이용할 수 없습니다.';
    case ErrorCode.RATE_LIMIT_EXCEEDED:
      return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
    default:
      return error.message || '일시적인 오류가 발생했습니다.';
  }
}
