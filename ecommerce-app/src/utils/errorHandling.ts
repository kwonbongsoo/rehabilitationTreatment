/**
 * 에러 처리 공통 유틸리티
 *
 * 프로젝트 전반에서 사용되는 에러 처리 로직을 중앙화
 * - 표준화된 에러 메시지 처리
 * - 에러 분류 및 정규화
 * - 에러 로깅 및 모니터링
 *
 * 주의: 알림은 NotificationManager를 별도로 사용하세요
 */

/**
 * 에러 타입 열거형
 */
export enum ErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NETWORK = 'network',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

/**
 * 표준화된 에러 인터페이스
 */
export interface StandardError {
  type: ErrorType;
  message: string;
  originalError?: unknown;
  context?: string;
  timestamp: number;
}

/**
 * 에러 메시지 상수
 */
export const ERROR_MESSAGES = {
  // 네트워크 관련
  NETWORK_ERROR: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  TIMEOUT_ERROR: '요청 시간이 초과되었습니다. 다시 시도해주세요.',

  // 인증 관련
  AUTHENTICATION_FAILED: '로그인이 필요합니다.',
  AUTHORIZATION_FAILED: '접근 권한이 없습니다.',
  TOKEN_EXPIRED: '로그인이 만료되었습니다. 다시 로그인해주세요.',

  // 검증 관련
  VALIDATION_FAILED: '입력 정보를 확인해주세요.',
  REQUIRED_FIELD: '필수 입력 항목입니다.',

  // 일반 오류
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
  OPERATION_FAILED: '작업 처리 중 오류가 발생했습니다.',
} as const;

/**
 * 에러 분류기 클래스
 */
export class ErrorClassifier {
  static classify(error: unknown): ErrorType {
    if (!error) return ErrorType.UNKNOWN;

    if (error instanceof Error) {
      const errorName = error.name.toLowerCase();
      const errorMessage = error.message.toLowerCase();

      if (errorName.includes('validation') || errorMessage.includes('validation')) {
        return ErrorType.VALIDATION;
      }
      if (errorName.includes('auth') || errorMessage.includes('auth')) {
        return ErrorType.AUTHENTICATION;
      }
      if (errorName.includes('network') || errorMessage.includes('network')) {
        return ErrorType.NETWORK;
      }
      if (errorName.includes('timeout') || errorMessage.includes('timeout')) {
        return ErrorType.NETWORK;
      }
    }

    return ErrorType.UNKNOWN;
  }

  static getDefaultMessage(type: ErrorType): string {
    switch (type) {
      case ErrorType.VALIDATION:
        return ERROR_MESSAGES.VALIDATION_FAILED;
      case ErrorType.AUTHENTICATION:
        return ERROR_MESSAGES.AUTHENTICATION_FAILED;
      case ErrorType.AUTHORIZATION:
        return ERROR_MESSAGES.AUTHORIZATION_FAILED;
      case ErrorType.NETWORK:
        return ERROR_MESSAGES.NETWORK_ERROR;
      case ErrorType.SERVER:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }
}

/**
 * 에러 메시지 추출기 클래스
 */
export class ErrorMessageExtractor {
  static extract(error: unknown, context?: string): string {
    let message = '';

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error && typeof error === 'object') {
      const errorObj = error as any;
      message = errorObj.message || errorObj.error || JSON.stringify(error);
    } else {
      message = String(error);
    }

    if (!message || message === 'undefined' || message === 'null') {
      const type = ErrorClassifier.classify(error);
      message = ErrorClassifier.getDefaultMessage(type);
    }

    // 컨텍스트 정보 추가
    if (context) {
      message = `${context}: ${message}`;
    }

    return message;
  }
}

/**
 * 에러 로거 클래스
 */
export class ErrorLogger {
  static log(error: StandardError): void {
    console.error(`[${error.type.toUpperCase()}] ${error.message}`, {
      context: error.context,
      timestamp: new Date(error.timestamp).toISOString(),
      originalError: error.originalError,
    });

    // 프로덕션 환경에서는 외부 로깅 서비스로 전송
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalLogger(error);
    }
  }

  private static sendToExternalLogger(error: StandardError): void {
    // TODO: 외부 로깅 서비스 (Sentry, LogRocket 등) 연동
    // 현재는 콘솔 로그만 출력
  }
}

/**
 * 통합 에러 핸들러 클래스 (에러 처리 전담)
 */
export class ErrorHandler {
  /**
   * 에러를 표준 형식으로 정규화
   */
  static normalize(error: unknown, context?: string): StandardError {
    const type = ErrorClassifier.classify(error);
    const message = ErrorMessageExtractor.extract(error, context);

    return {
      type,
      message,
      originalError: error,
      context,
      timestamp: Date.now(),
    };
  }

  /**
   * 기본 에러 처리 (로깅만, 알림 없음)
   */
  static handle(
    error: unknown,
    options?: {
      context?: string;
      logError?: boolean;
    },
  ): StandardError {
    const { context, logError = true } = options || {};

    const standardError = this.normalize(error, context);

    // 로깅만 수행
    if (logError) {
      ErrorLogger.log(standardError);
    }

    return standardError;
  }

  /**
   * 폼 에러 처리 (로깅 없음)
   */
  static handleFormError(error: unknown, context?: string): StandardError {
    return this.handle(error, {
      context,
      logError: false, // 폼 검증 에러는 로그하지 않음
    });
  }

  /**
   * API 에러 처리 (로깅 포함)
   */
  static handleApiError(error: unknown, context?: string): StandardError {
    return this.handle(error, {
      context,
      logError: true,
    });
  }

  /**
   * 네트워크 에러 처리 (로깅 포함)
   */
  static handleNetworkError(error: unknown): StandardError {
    return this.handle(error, {
      context: '네트워크 요청',
      logError: true,
    });
  }

  /**
   * React Error #185 방지를 위한 안전한 에러 처리
   */
  static handleSafely(error: unknown, options?: Parameters<typeof ErrorHandler.handle>[1]): void {
    setTimeout(() => {
      this.handle(error, options);
    }, 0);
  }
}

/**
 * 에러 처리 데코레이터 (함수 래핑용)
 */
export function withErrorHandling<T extends (...args: any[]) => any>(fn: T, context?: string): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);

      // Promise인 경우 catch 추가
      if (result instanceof Promise) {
        return result.catch((error) => {
          ErrorHandler.handle(error, { context });
          throw error;
        });
      }

      return result;
    } catch (error) {
      ErrorHandler.handle(error, { context });
      throw error;
    }
  }) as T;
}

/**
 * 비동기 함수용 에러 처리 래퍼
 */
export async function safeAsync<T>(asyncFn: () => Promise<T>, context?: string): Promise<T | null> {
  try {
    return await asyncFn();
  } catch (error) {
    ErrorHandler.handle(error, { context });
    return null;
  }
}
