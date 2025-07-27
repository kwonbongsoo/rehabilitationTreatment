import { ApiError, ErrorFactory } from './errors';
import type { ApiResponse, RequestOptions } from './types';

/**
 * 현대적인 API 클라이언트 (클라이언트 사이드용)
 * - 간단한 헤더 관리
 * - AbortController 지원으로 요청 취소 가능
 * - 타입 안전성 보장
 * - 에러 처리 표준화
 */
export class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string, timeout = 8000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  /**
   * 공통 요청 메서드
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      body,
      headers: customHeaders = {},
      timeout = this.timeout,
      requireAuth = true,
      useBasicAuth = false,
      idempotencyKey,
      abortSignal,
      ...fetchOptions
    } = options;

    // AbortController 설정
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // 최종 signal 결정 (외부에서 제공된 signal 우선)
    const finalSignal = abortSignal || controller.signal;

    try {
      // 클라이언트용 간단한 헤더 구성
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...customHeaders,
      };

      if (idempotencyKey) {
        headers['X-Idempotency-Key'] = idempotencyKey;
      }

      // 클라이언트에서는 쿠키에 의존하지 않고 명시적 토큰 전달 방식 사용
      if (requireAuth && !useBasicAuth) {
        console.warn('Client-side API calls require explicit token passing');
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
        signal: finalSignal,
        ...fetchOptions,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;

        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }

        // Common 모듈의 ErrorResponse 형태인지 확인
        if (errorData.error && typeof errorData.error === 'object') {
          // Common 모듈 기반 에러 응답
          throw new ApiError(
            errorData.error.message || `HTTP ${response.status}`,
            response.status,
            errorData.error.details,
          );
        }

        // 일반적인 에러 응답
        throw new ApiError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData,
        );
      }

      // 응답이 비어있는 경우 처리 (204 No Content 등)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T;
      }

      const data = await response.json();

      // ApiResponse 형태인지 확인하고 data 추출
      if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
        return (data as ApiResponse<T>).data;
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw ErrorFactory.requestCancelledError();
      }

      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw ErrorFactory.networkError();
      }

      throw ErrorFactory.serverError(
        error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
      );
    }
  }

  /**
   * GET 요청
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ): Promise<T> {
    const searchParams = params ? new URLSearchParams(params).toString() : '';
    const url = searchParams ? `${endpoint}?${searchParams}` : endpoint;

    return this.request<T>(url, { ...options, method: 'GET' });
  }

  /**
   * POST 요청
   */
  async post<T>(
    endpoint: string,
    body?: any,
    options?: Omit<RequestOptions, 'method'>,
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  /**
   * PUT 요청
   */
  async put<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  /**
   * PATCH 요청
   */
  async patch<T>(
    endpoint: string,
    body?: any,
    options?: Omit<RequestOptions, 'method'>,
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  /**
   * DELETE 요청
   */
  async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

/**
 * 기본 API 클라이언트 인스턴스들
 */
export const kongApiClient = new ApiClient(
  `${process.env.KONG_GATEWAY_URL || 'http://localhost:8000'}`,
);

export const authApiClient = new ApiClient(
  `${process.env.AUTH_SERVICE_URL || 'http://localhost:5000'}`,
);
