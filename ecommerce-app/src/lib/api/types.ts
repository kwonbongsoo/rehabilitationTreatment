/**
 * 공통 API 타입 정의
 * - 표준화된 응답 형태
 * - 요청 옵션 타입
 * - 페이지네이션 지원
 */

/// <reference lib="dom" />

/**
 * 표준 API 응답 형태
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

/**
 * 페이지네이션 메타데이터
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 페이지네이션이 포함된 응답
 */
export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * API 요청 옵션
 */
export interface RequestOptions {
  /** HTTP 메서드 */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** 요청 본문 */
  body?: any;
  /** 커스텀 헤더 */
  headers?: Record<string, string>;
  /** 요청 타임아웃 (ms) */
  timeout?: number;
  /** 인증 헤더 포함 여부 */
  requireAuth?: boolean;
  /** Basic Auth 사용 여부 */
  useBasicAuth?: boolean;
  /** 멱등성 키 */
  idempotencyKey?: string;
  /** AbortSignal */
  abortSignal?: AbortSignal;
  /** 기타 fetch 옵션 */
  cache?: 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache' | 'only-if-cached';
  credentials?: 'omit' | 'same-origin' | 'include';
  mode?: 'cors' | 'no-cors' | 'same-origin' | 'navigate';
  redirect?: 'follow' | 'error' | 'manual';
  referrer?: string;
  referrerPolicy?:
    | 'no-referrer'
    | 'no-referrer-when-downgrade'
    | 'origin'
    | 'origin-when-cross-origin'
    | 'same-origin'
    | 'strict-origin'
    | 'strict-origin-when-cross-origin'
    | 'unsafe-url';
}

/**
 * 정렬 옵션
 */
export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * 필터 옵션
 */
export interface FilterOption {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'like';
  value: any;
}

/**
 * 목록 조회 옵션
 */
export interface ListOptions {
  /** 페이지 번호 */
  page?: number;
  /** 페이지당 항목 수 */
  limit?: number;
  /** 정렬 옵션 */
  sort?: SortOption[];
  /** 필터 옵션 */
  filters?: FilterOption[];
  /** 검색 키워드 */
  search?: string;
  /** 검색 필드 */
  searchFields?: string[];
}

/**
 * 업로드 파일 정보
 */
export interface UploadFile {
  file: File;
  name?: string;
  type?: string;
}

/**
 * 업로드 응답
 */
export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  type: string;
  uploadedAt: string;
}

/**
 * 상태 응답 (health check 등)
 */
export interface StatusResponse {
  status: 'ok' | 'error';
  version?: string;
  timestamp: string;
  services?: Record<string, 'up' | 'down'>;
}

/**
 * 에러 응답 상세 정보
 */
export interface ErrorDetails {
  field?: string;
  code?: string;
  message: string;
  context?: Record<string, any>;
}

/**
 * 표준 에러 응답
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: ErrorDetails[];
  timestamp: string;
  path?: string;
  statusCode: number;
}

/**
 * 타입 가드: ApiResponse인지 확인
 */
export const isApiResponse = <T>(data: any): data is ApiResponse<T> => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    typeof data.success === 'boolean'
  );
};

/**
 * 타입 가드: PaginatedResponse인지 확인
 */
export const isPaginatedResponse = <T>(data: any): data is PaginatedResponse<T> => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'items' in data &&
    Array.isArray(data.items) &&
    'meta' in data &&
    typeof data.meta === 'object'
  );
};

/**
 * 타입 가드: ErrorResponse인지 확인
 */
export const isErrorResponse = (data: any): data is ErrorResponse => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    data.success === false &&
    'error' in data
  );
};
