import {
  BaseError,
  ErrorCode,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  DuplicateResourceError,
} from '@ecommerce/common';

export {
  BaseError,
  ErrorCode,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  DuplicateResourceError,
};

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(400, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}
