import { BaseError } from './BaseError';
import { ErrorCode, ErrorDetails } from './types';

export class ValidationError extends BaseError {
  constructor(message: string, details?: { field: string; reason: string }) {
    super(ErrorCode.VALIDATION_ERROR, message, details, 400);
  }
}

export class AuthenticationError extends BaseError {
  constructor(message: string = 'Authentication failed') {
    super(ErrorCode.INVALID_CREDENTIALS, message, undefined, 401);
  }
}

export class ForbiddenError extends BaseError {
  constructor(message: string = 'Access forbidden') {
    super(ErrorCode.FORBIDDEN, message, undefined, 403);
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string = 'Resource not found') {
    super(ErrorCode.RESOURCE_NOT_FOUND, message, undefined, 404);
  }
}

export class DuplicateResourceError extends BaseError {
  constructor(message: string, details?: ErrorDetails) {
    super(ErrorCode.DUPLICATE_RESOURCE, message, details, 409);
  }
}
