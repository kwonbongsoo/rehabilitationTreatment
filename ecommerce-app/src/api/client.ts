import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from './config';
import {
  ApiError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  DuplicateResourceError,
  BaseError,
} from './types';

// API 응답 타입 정의
interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// HTTP 메서드 상수화
enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

export class ApiClient {
  private client: AxiosInstance;

  constructor(config?: AxiosRequestConfig & { setupInterceptors?: boolean }) {
    // 기본값과 병합
    const finalConfig = {
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        ...(config?.headers || {}),
      },
      // 재시도 없음 - axios 기본 동작 사용 (재시도 하지 않음)
      ...config,
    };

    this.client = axios.create(finalConfig);

    // 선택적 인터셉터 설정
    const setupIntercept = config?.setupInterceptors !== false;
    if (setupIntercept) {
      // 동적 임포트로 순환 참조 방지
      import('./interceptors').then(({ setupInterceptors }) => {
        setupInterceptors(this.client);
      });
    }
  }

  // 공통 요청 메서드 - 코드 중복 감소
  private async request<T>(
    method: HttpMethod,
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      let response;

      switch (method) {
        case HttpMethod.GET:
          response = await this.client.get<T>(url, config);
          break;
        case HttpMethod.POST:
          response = await this.client.post<T>(url, data, config);
          break;
        case HttpMethod.PUT:
          response = await this.client.put<T>(url, data, config);
          break;
        case HttpMethod.DELETE:
          response = await this.client.delete<T>(url, config);
          break;
        case HttpMethod.PATCH:
          response = await this.client.patch<T>(url, data, config);
          break;
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // 메서드 구현 - 공통 request 메서드 활용
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>(HttpMethod.GET, url, undefined, config);
  }

  public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>(HttpMethod.POST, url, data, config);
  }

  public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>(HttpMethod.PUT, url, data, config);
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>(HttpMethod.DELETE, url, undefined, config);
  }

  public async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>(HttpMethod.PATCH, url, data, config);
  } // 에러 처리 개선 - 표준화된 에러 타입 사용
  private handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        const status = axiosError.response.status;
        const data = axiosError.response.data as any;
        const message = data?.message || '서버에서 오류가 발생했습니다';

        // HTTP 상태 코드에 따른 표준화된 에러 생성
        switch (status) {
          case 400:
            throw new ValidationError(message, data?.errors || {});
          case 401:
            throw new AuthenticationError(message);
          case 404:
            throw new NotFoundError(message);
          case 409:
            throw new DuplicateResourceError(message);
          default:
            throw new ApiError(message, status, data);
        }
      }

      if (axiosError.request) {
        throw new ApiError('서버에 연결할 수 없습니다', 0);
      }
    }

    throw new ApiError('알 수 없는 오류가 발생했습니다', 0);
  }

  public getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

// 팩토리 함수들
export const createApiClient = (config?: AxiosRequestConfig & { setupInterceptors?: boolean }) =>
  new ApiClient(config);

export const createBasicApiClient = () => new ApiClient({ setupInterceptors: false });
