// Re-export standardized error classes from @ecommerce/common
export {
  BaseError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  DuplicateResourceError,
} from '@ecommerce/common';

export type { ErrorCode, ErrorResponse } from '@ecommerce/common';

// Legacy ApiError class for backward compatibility
export class ApiError extends Error {
  public status: number;
  public data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiFilter {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}
