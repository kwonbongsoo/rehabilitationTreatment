import { ApiClient } from '../client';
import { LoginRequest, LoginResponse, SessionInfoResponse } from '../models/auth';

// 팩토리 함수로 변경하여 매번 새 인스턴스 생성
export const createAuthRepository = (apiClient: ApiClient) => ({
  /**
   * 사용자 로그인
   */
  login: async (credentials: LoginRequest, idempotencyKey?: string): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', credentials, {
      headers: idempotencyKey ? { 'X-Idempotency-Key': idempotencyKey } : undefined,
    });
  },

  /**
   * 로그아웃
   */
  logout: async (): Promise<void> => {
    return apiClient.post<void>('/auth/logout');
  },

  /**
   * 세션 정보 조회회
   */
  sessionInfo: async (): Promise<SessionInfoResponse> => {
    return apiClient.get<SessionInfoResponse>('/auth/session-info');
  },
});
