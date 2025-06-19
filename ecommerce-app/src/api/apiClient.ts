/**
 * 통합 API 클라이언트
 *
 * - 인증, 에러 처리 등 공통 기능 통합
 * - 타입 안전성 보장
 * - 간단한 API 호출 패턴 제공
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ProxyError } from '../utils/proxyErrors';
import { cookieService } from '@/services';
import { LoginRequest, LoginResponse, SessionInfoResponse, RegisterRequest } from './models/auth';
import { User } from './models/user';

/**
 * API 응답 타입
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

/**
 * 요청 옵션
 */
export interface RequestOptions extends AxiosRequestConfig {
  requireAuth?: boolean;
  skipErrorHandling?: boolean;
}

/**
 * 통합 API 클라이언트 클래스
 */
export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL = '/api') {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * 인터셉터 설정
   */
  private setupInterceptors(): void {
    // 요청 인터셉터
    this.client.interceptors.request.use(
      (config) => {
        // 토큰 자동 추가
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // 응답 인터셉터
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (!error.config?.skipErrorHandling) {
          this.handleApiError(error);
        }
        return Promise.reject(error);
      },
    );
  }

  /**
   * 인증 토큰 조회
   */
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return cookieService.getToken();
    }
    return null;
  }

  /**
   * API 에러 처리
   */
  private handleApiError(error: any): void {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      const statusCode = error.response?.status || 500;

      throw new ProxyError(message, statusCode, undefined, {
        reason: 'api_error',
        context: {
          url: error.config?.url,
          method: error.config?.method,
          response: error.response?.data,
        },
      });
    }

    throw new ProxyError('알 수 없는 오류가 발생했습니다', 500);
  }

  /**
   * GET 요청
   */
  async get<T = any>(
    url: string,
    params?: Record<string, any>,
    options?: RequestOptions,
  ): Promise<T> {
    const response = await this.client.get<T>(url, {
      params,
      ...options,
    });
    return response.data;
  }

  /**
   * POST 요청
   */
  async post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    const response = await this.client.post<T>(url, data, options);
    return response.data;
  }

  /**
   * PUT 요청
   */
  async put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    const response = await this.client.put<T>(url, data, options);
    return response.data;
  }

  /**
   * DELETE 요청
   */
  async delete<T = any>(url: string, options?: RequestOptions): Promise<T> {
    const response = await this.client.delete<T>(url, options);
    return response.data;
  }

  /**
   * PATCH 요청
   */
  async patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    const response = await this.client.patch<T>(url, data, options);
    return response.data;
  }
}

/**
 * 통합 API 서비스
 * 단일 인터페이스로 모든 API 호출 관리
 */
export class ApiService {
  constructor(private apiClient: ApiClient) {}

  // ============ 인증 관련 API ============

  /**
   * 로그인
   */
  async login(credentials: LoginRequest, idempotencyKey?: string): Promise<LoginResponse> {
    return this.apiClient.post<LoginResponse>(
      '/auth/login',
      credentials,
      idempotencyKey ? { headers: { 'X-Idempotency-Key': idempotencyKey } } : undefined,
    );
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    return this.apiClient.post<void>('/auth/logout');
  }

  /**
   * 세션 정보 조회
   */
  async getSessionInfo(): Promise<SessionInfoResponse> {
    return this.apiClient.get<SessionInfoResponse>('/auth/session-info');
  }

  // ============ 회원 관련 API ============

  /**
   * 회원가입
   */
  async register(userData: RegisterRequest, idempotencyKey?: string): Promise<User> {
    const requestConfig = {
      headers: idempotencyKey ? { 'X-Idempotency-Key': idempotencyKey } : undefined,
    };

    const response = await this.apiClient.post<{ success: boolean; data: User; message?: string }>(
      '/members',
      {
        id: userData.id,
        password: userData.password,
        name: userData.name,
        email: userData.email,
      },
      requestConfig,
    );
    return response.data;
  }

  /**
   * 회원 정보 조회
   */
  async getMember(id: string): Promise<User> {
    return this.apiClient.get<User>(`/members/${id}`);
  }

  /**
   * 회원 정보 수정
   */
  async updateMember(id: string, data: Partial<User>): Promise<User> {
    return this.apiClient.put<User>(`/members/${id}`, data);
  }

  /**
   * 회원 탈퇴
   */
  async deleteMember(id: string): Promise<void> {
    return this.apiClient.delete<void>(`/members/${id}`);
  }

  // ============ 편의 메서드들 ============

  /**
   * 현재 사용자 정보 조회 (세션 기반)
   */
  async getCurrentUser(): Promise<SessionInfoResponse> {
    return this.getSessionInfo();
  }

  /**
   * 인증 상태 확인
   */
  async checkAuth(): Promise<boolean> {
    try {
      await this.getSessionInfo();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const apiClient = new ApiClient();
export const apiService = new ApiService(apiClient);
