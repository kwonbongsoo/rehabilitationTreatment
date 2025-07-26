import { BaseError, ValidationError, ErrorCode, ErrorDetails } from '@ecommerce/common';

/**
 * 프록시 에러 베이스 클래스 - 모든 프록시 에러의 공통 부모
 */
export class ProxyError extends BaseError {
  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: ErrorCode = ErrorCode.INTERNAL_ERROR,
    details?: ErrorDetails,
  ) {
    super(errorCode, message, details, statusCode);
  }
}

/**
 * 백엔드 연결 관련 에러 (네트워크, 타임아웃 등)
 */
export class BackendConnectionError extends ProxyError {
  constructor(message: string, targetPath: string, originalError?: string) {
    super(message, 502, ErrorCode.SERVICE_UNAVAILABLE, {
      reason: 'backend_connection_failed',
      context: { targetPath, originalError },
    });
  }
}

/**
 * 요청 검증 실패 에러 - 기존 ValidationError 활용
 */
export class ProxyValidationError extends ValidationError {
  constructor(message: string, field?: string, reason?: string) {
    const details = field && reason ? { field, reason } : undefined;
    super(message, details);
  }
}

/**
 * 프록시 메서드 허용되지 않음 에러
 */
export class ProxyMethodNotAllowedError extends BaseError {
  constructor(allowedMethods: string[], requestedMethod: string) {
    const message = `Method ${requestedMethod} not allowed. Allowed methods: ${allowedMethods.join(', ')}`;
    const details: ErrorDetails = {
      reason: 'method_not_allowed',
      context: {
        allowedMethods,
        requestedMethod,
      },
    };
    super(ErrorCode.VALIDATION_ERROR, message, details, 405);
  }
}

/**
 * 프록시 타임아웃 에러
 */
export class ProxyTimeoutError extends BaseError {
  constructor(timeoutMs: number, targetPath: string) {
    const message = `Request timeout after ${timeoutMs}ms`;
    const details: ErrorDetails = {
      reason: 'request_timeout',
      context: {
        timeoutMs,
        targetPath,
      },
    };
    super(ErrorCode.SERVICE_UNAVAILABLE, message, details, 504);
  }
}

/**
 * 프록시 내부 서버 에러
 */
export class ProxyInternalError extends BaseError {
  constructor(message: string = 'Proxy server internal error', details?: ErrorDetails) {
    super(ErrorCode.INTERNAL_ERROR, message, details, 500);
  }
}

/**
 * Kong Gateway에서 반환된 에러를 래핑
 */
export class GatewayError extends ProxyError {
  constructor(
    public readonly gatewayStatus: number,
    public readonly gatewayData: any,
    message: string = 'Gateway returned an error',
  ) {
    // 상태 코드에 따른 에러 코드 매핑
    const errorCodeMap: Record<number, ErrorCode> = {
      401: ErrorCode.INVALID_CREDENTIALS,
      404: ErrorCode.RESOURCE_NOT_FOUND,
      409: ErrorCode.DUPLICATE_RESOURCE,
    };

    const errorCode =
      errorCodeMap[gatewayStatus] ||
      (gatewayStatus >= 400 && gatewayStatus < 500
        ? ErrorCode.VALIDATION_ERROR
        : ErrorCode.SERVICE_UNAVAILABLE);

    super(message, gatewayStatus, errorCode, {
      reason: 'gateway_error',
      context: { gatewayStatus, gatewayResponse: gatewayData },
    });
  }
}

/**
 * 에러 타입 체커 - 프록시 관련 에러인지 확인
 */
export function isProxyError(error: any): error is ProxyError {
  return error instanceof ProxyError;
}
