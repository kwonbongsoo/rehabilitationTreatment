import { ApiClient } from '../client';
import { User, UserUpdateRequest, Address } from '../models/user';
import { RegisterRequest } from '../models/auth';

export const createUserRepository = (apiClient: ApiClient) => ({
  /**
   * 회원가입 (member 서버 사용) - 멱등성 키 지원
   */
  register: async (userData: RegisterRequest, idempotencyKey?: string): Promise<User> => {
    const requestConfig = {
      headers: idempotencyKey ? { 'X-Idempotency-Key': idempotencyKey } : undefined,
    };

    const response = await apiClient.post<{ success: boolean; data: User; message?: string }>(
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
  },
  /**
   * 현재 사용자 정보 조회
   */
  // getCurrentUser: async (): Promise<User> => {
  //     return apiClient.get<User>('/users/me');
  // }
});
