import { BaseError, ErrorCode } from '@ecommerce/common';

export interface ErrorContext {
  url: string;
  method: string;
  userAgent?: string;
  ip?: string;
  timestamp: string;
}

export class ProxyError extends BaseError {
  constructor(
    code: ErrorCode,
    message: string,
    public readonly context?: ErrorContext,
    statusCode: number = 500
  ) {
    super(code, message, { context }, statusCode);
  }
}

export class CacheError extends ProxyError {
  constructor(message: string, context?: ErrorContext) {
    super(ErrorCode.INTERNAL_ERROR, `Cache operation failed: ${message}`, context, 500);
  }
}

export class ProxyRequestError extends ProxyError {
  constructor(message: string, context?: ErrorContext, statusCode: number = 502) {
    super(ErrorCode.SERVICE_UNAVAILABLE, `Proxy request failed: ${message}`, context, statusCode);
  }
}

export class RateLimitError extends ProxyError {
  constructor(message: string = 'Rate limit exceeded', context?: ErrorContext) {
    super(ErrorCode.RATE_LIMIT_EXCEEDED, message, context, 429);
  }
}

export function createErrorContext(request: Request): ErrorContext {
  return {
    url: request.url,
    method: request.method,
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.headers.get('x-forwarded-for') || 
        request.headers.get('x-real-ip') || 
        'unknown',
    timestamp: new Date().toISOString(),
  };
}

export function handleError(error: unknown, request: Request): Response {
  const context = createErrorContext(request);
  
  let proxyError: BaseError;
  
  if (error instanceof BaseError) {
    // 이미 구조화된 에러인 경우
    proxyError = error;
  } else if (error instanceof Error) {
    // 일반 JavaScript 에러인 경우
    console.error('Unhandled error in proxy server:', {
      message: error.message,
      stack: error.stack,
      context,
    });
    
    proxyError = new ProxyError(
      ErrorCode.INTERNAL_ERROR,
      'Internal server error',
      context,
      500
    );
  } else {
    // 알 수 없는 에러인 경우
    console.error('Unknown error in proxy server:', {
      error,
      context,
    });
    
    proxyError = new ProxyError(
      ErrorCode.INTERNAL_ERROR,
      'Unknown error occurred',
      context,
      500
    );
  }
  
  // 에러 로깅
  console.error('Proxy Error:', {
    code: proxyError.code,
    message: proxyError.message,
    statusCode: proxyError.statusCode,
    context,
    stack: proxyError.stack,
  });
  
  // 에러 응답 생성
  const errorResponse = proxyError.toResponse();
  
  return new Response(JSON.stringify(errorResponse), {
    status: proxyError.statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Error-Code': proxyError.code,
      'X-Error-Timestamp': context.timestamp,
    },
  });
}

export function withErrorHandling(
  handler: (request: Request) => Promise<Response>
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    try {
      return await handler(request);
    } catch (error) {
      return handleError(error, request);
    }
  };
}