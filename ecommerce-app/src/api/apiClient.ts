/**
 * 통합 API 클라이언트
 *
 * - 인증, 에러 처리 등 공통 기능 통합
 * - 타입 안전성 보장
 * - 간단한 API 호출 패턴 제공
 */

import { cookieService } from '@/services';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ProxyError } from '../utils/proxyErrors';
import {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  RegisterRequest,
  SessionInfoResponse,
  UserResponse,
} from './models/auth';
import { KONG_GATEWAY_URL, AUTH_SERVICE_URL } from './config';

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

// ===== 공통 헤더 빌더 =====

/**
 * buildRequestHeaders 옵션
 */
export interface BuildRequestHeadersOptions {
  /** HTTP Method */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** 인증 헤더 포함 여부 (기본값: true) */
  includeAuth?: boolean;
  /** Basic 인증 사용 여부 (주로 로그인/게스트 토큰 발급용) */
  useBasicAuth?: boolean;
  /** 멱등성 키 포함 여부 */
  includeIdempotency?: boolean;
  /** 멱등성 키 값 */
  idempotencyKey?: string;
  /** 이미 존재하는 헤더(병합 목적) */
  baseHeaders?: Record<string, string>;
  /** Bearer 토큰을 직접 지정하고 싶을 때 */
  authToken?: string;
}

/**
 * 문자열을 Base64로 인코딩 (Node/Browser 환경 모두 지원)
 */
function encodeBase64(value: string): string {
  if (typeof window !== 'undefined' && typeof btoa === 'function') {
    return btoa(value);
  }
  // Node.js 환경
  return Buffer.from(value).toString('base64');
}

/**
 * 요청 헤더 구성 함수
 *   - Content-Type, Authorization, X-Idempotency-Key 등 공통 헤더를 편리하게 구성
 *   - app-router-proxy 의 buildRequestHeaders 를 클라이언트/브라우저에서 사용 가능하도록 변환한 버전
 */
function buildRequestHeaders(options: BuildRequestHeadersOptions = {}): Record<string, string> {
  const {
    method = 'GET',
    includeAuth = true,
    useBasicAuth = false,
    includeIdempotency = false,
    idempotencyKey,
    baseHeaders = {},
    authToken,
  } = options;

  // 기존 헤더 복사 (불변성 유지)
  const headers: Record<string, string> = { ...baseHeaders };

  // Content-Type 설정 (존재하지 않을 때만)
  if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // 인증 헤더 처리
  if (includeAuth) {
    let tokenToSet: string | null = null;

    if (useBasicAuth) {
      const authBasicKey = process.env.AUTH_BASIC_KEY;
      if (!authBasicKey) {
        throw new Error('AUTH_BASIC_KEY 환경 변수가 설정되어 있지 않습니다.');
      }
      tokenToSet = `Basic ${encodeBase64(authBasicKey)}`;

      // 기존 게스트 토큰은 별도 헤더로 전달 (로그인 시 게스트 토큰 만료용)
      const existingToken = cookieService.getToken();
      if (existingToken) {
        headers['X-Previous-Token'] = existingToken;
      }
    } else {
      // 1순위: 호출 측에서 직접 전달한 토큰
      if (authToken) {
        tokenToSet = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
      } else {
        // 2순위: 쿠키에 저장된 토큰 (클라이언트/서버 환경 모두 고려)
        let cookieToken: string | null = null;

        if (typeof window !== 'undefined') {
          cookieToken = cookieService.getToken();
        } else {
          // 서버 환경: next/headers.cookies() 이용
          // eslint-disable-next-line
          try {
            const { cookies: serverCookies } = require('next/headers');
            cookieToken = serverCookies().get('access_token')?.value || null;
          } catch {
            // next/headers 를 사용할 수 없는 경우 무시
          }
        }

        if (cookieToken) {
          tokenToSet = `Bearer ${cookieToken}`;
        }
      }
    }

    if (tokenToSet) {
      headers['Authorization'] = tokenToSet;
    }
  }

  // 멱등성 키 처리
  if (includeIdempotency && idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }

  return headers;
}

/**
 * 통합 API 클라이언트 클래스
 */
export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL = `/api`) {
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
  private readonly kongClient: ApiClient;
  private readonly authClient: ApiClient;

  constructor(kongClient: ApiClient, authClient: ApiClient) {
    this.kongClient = kongClient;
    this.authClient = authClient;
  }

  // ============ 인증 관련 API ============

  /**
   * 로그인
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const headers = buildRequestHeaders({
      method: 'POST',
      includeAuth: true,
      useBasicAuth: true, // 로그인은 Basic Auth 이용
    });

    return this.authClient.post<LoginResponse>('/auth/login', credentials, {
      headers,
    } as RequestOptions);
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<LogoutResponse> {
    const headers = buildRequestHeaders({
      method: 'POST',
      includeAuth: true,
    });
    return this.authClient.post<LogoutResponse>('/auth/logout', undefined, {
      headers,
    } as RequestOptions);
  }

  /**
   * 세션 정보 조회
   */
  async getSessionInfo(): Promise<SessionInfoResponse> {
    const headers = buildRequestHeaders({
      method: 'GET',
      includeAuth: true,
    });
    return this.authClient.get<SessionInfoResponse>('/auth/session-info', undefined, {
      headers,
    } as RequestOptions);
  }

  // ============ 회원 관련 API ============

  /**
   * 회원가입
   */
  async register(userData: RegisterRequest, idempotencyKey?: string): Promise<UserResponse> {
    const headers = buildRequestHeaders({
      method: 'POST',
      includeAuth: true,
      includeIdempotency: !!idempotencyKey,
      ...(idempotencyKey && { idempotencyKey }),
    });

    const requestConfig: RequestOptions = { headers };

    const response = await this.kongClient.post<{
      success: boolean;
      data: UserResponse;
      message?: string;
    }>(
      '/members',
      {
        id: userData.id,
        password: userData.password,
        name: userData.name,
        email: userData.email,
      },
      requestConfig as RequestOptions,
    );

    return response.data;
  }

  /**
   * 회원 정보 조회
   */
  async getMember(id: string): Promise<UserResponse> {
    const headers = buildRequestHeaders({
      method: 'GET',
      includeAuth: true,
    });
    return this.kongClient.get<UserResponse>(`/members/${id}`, undefined, {
      headers,
    } as RequestOptions);
  }

  /**
   * 회원 정보 수정
   */
  async updateMember(id: string, data: Partial<UserResponse>): Promise<UserResponse> {
    const headers = buildRequestHeaders({
      method: 'PUT',
      includeAuth: true,
    });
    return this.kongClient.put<UserResponse>(`/members/${id}`, data, {
      headers,
    } as RequestOptions);
  }

  /**
   * 회원 탈퇴
   */
  async deleteMember(id: string): Promise<void> {
    const headers = buildRequestHeaders({
      method: 'DELETE',
      includeAuth: true,
    });
    return this.kongClient.delete<void>(`/members/${id}`, { headers } as RequestOptions);
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
export const kongApiClient = new ApiClient(`${KONG_GATEWAY_URL}/api`);
export const authApiClient = new ApiClient(`${AUTH_SERVICE_URL}/api`);
export const testApiClient = new ApiClient(`${KONG_GATEWAY_URL}/api`);
export const apiService = new ApiService(kongApiClient, authApiClient);
