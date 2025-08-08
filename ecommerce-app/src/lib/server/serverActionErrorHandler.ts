/**
 * Server Actions 전용 에러 핸들러
 * Common 패키지의 BaseError를 활용하여 표준화된 에러 응답 제공
 */

import { BaseError, ErrorCode } from '@ecommerce/common';

/**
 * Server Action 결과 타입
 */
export interface ServerActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  code?: string;
}

/**
 * Server Action 에러를 표준 응답으로 변환
 */
export function handleServerActionError(error: unknown, context?: string): ServerActionResult {
  // BaseError 또는 그 하위 클래스인 경우
  if (error instanceof BaseError) {
    return {
      success: false,
      error: error.message,
      statusCode: error.statusCode,
      code: error.code,
    };
  }

  // 일반 Error인 경우
  if (error instanceof Error) {
    // 인증 관련 에러 감지
    if (
      error.message.toLowerCase().includes('auth') ||
      error.message.toLowerCase().includes('credentials') ||
      error.message.toLowerCase().includes('token')
    ) {
      return {
        success: false,
        error: '인증에 실패했습니다.',
        statusCode: 401,
        code: ErrorCode.INVALID_CREDENTIALS,
      };
    }

    // 네트워크/연결 에러
    if (
      error.message.toLowerCase().includes('fetch') ||
      error.message.toLowerCase().includes('network') ||
      error.message.toLowerCase().includes('connection')
    ) {
      return {
        success: false,
        error: '서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.',
        statusCode: 503,
        code: ErrorCode.SERVICE_UNAVAILABLE,
      };
    }

    // 검증 에러
    if (
      error.message.toLowerCase().includes('validation') ||
      error.message.toLowerCase().includes('invalid')
    ) {
      return {
        success: false,
        error: error.message,
        statusCode: 400,
        code: ErrorCode.VALIDATION_ERROR,
      };
    }

    return {
      success: false,
      error: error.message,
      statusCode: 500,
      code: ErrorCode.INTERNAL_ERROR,
    };
  }

  // 기타 모든 경우
  return {
    success: false,
    error: context ? `${context} 중 오류가 발생했습니다.` : '알 수 없는 오류가 발생했습니다.',
    statusCode: 500,
    code: ErrorCode.INTERNAL_ERROR,
  };
}

/**
 * API 응답을 Server Action 결과로 변환
 */
export async function handleApiResponseForServerAction<T>(
  response: Response,
  context?: string,
): Promise<ServerActionResult<T>> {
  try {
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = '서버 오류가 발생했습니다.';

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        // JSON 파싱 실패 시 기본 메시지 사용
      }

      return {
        success: false,
        error: errorMessage,
        statusCode: response.status,
        code: ErrorCode.INTERNAL_ERROR,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    return handleServerActionError(error, context) as ServerActionResult<T>;
  }
}

/**
 * Server Action 래퍼 - 표준화된 에러 처리
 */
export function withServerActionErrorHandling<T extends readonly unknown[], R>(
  action: (...args: T) => Promise<R>,
  context?: string,
) {
  return async (...args: T): Promise<R> => {
    try {
      return await action(...args);
    } catch (error) {
      console.error(`[ServerAction:${context || 'Unknown'}] Error:`, error);
      throw error; // Server Action에서는 에러를 throw해야 함
    }
  };
}

/**
 * 안전한 Server Action 실행 - 에러를 결과로 반환
 */
export async function safeServerAction<T>(
  action: () => Promise<ServerActionResult<T>>,
  context?: string,
): Promise<ServerActionResult<T>> {
  try {
    return await action();
  } catch (error) {
    console.error(`[SafeServerAction:${context || 'Unknown'}] Error:`, error);
    return handleServerActionError(error, context) as ServerActionResult<T>;
  }
}
