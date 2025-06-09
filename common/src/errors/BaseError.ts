import { ErrorCode, ErrorDetails, ErrorResponse } from './types';

export class BaseError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: ErrorDetails,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toResponse(): ErrorResponse {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
