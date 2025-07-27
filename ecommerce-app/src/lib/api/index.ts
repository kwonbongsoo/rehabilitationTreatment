/**
 * API 라이브러리 공개 인터페이스
 */

// Client
export { ApiClient, kongApiClient, authApiClient } from './client';

// Errors (Common 모듈 기반)
export {
  ApiError,
  ApiErrorCode,
  ErrorFactory,
  isApiError,
  isBaseError,
  isApiErrorType,
  getUserMessage,
  type ApiErrorType,
} from './errors';

// Common 모듈 에러들 재수출
export {
  BaseError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  DuplicateResourceError,
  ErrorCode,
} from '@ecommerce/common';

// Types
export type {
  ApiResponse,
  PaginationMeta,
  PaginatedResponse,
  RequestOptions,
  SortOption,
  FilterOption,
  ListOptions,
  UploadFile,
  UploadResponse,
  StatusResponse,
  ErrorDetails,
  ErrorResponse,
} from './types';

export { isApiResponse, isPaginatedResponse, isErrorResponse } from './types';
