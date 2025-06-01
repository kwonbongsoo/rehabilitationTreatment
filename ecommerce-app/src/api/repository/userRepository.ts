import { ApiClient } from '../client';
import { User, UserUpdateRequest, Address } from '../models/user';
import { RegisterRequest } from '../models/auth';

export const createUserRepository = (apiClient: ApiClient) => ({
    /**
     * 회원가입 (member 서버 사용) - 멱등성 키 지원
     */
    register: async (userData: RegisterRequest, idempotencyKey?: string): Promise<User> => {
        const requestData = {
            id: userData.id,
            password: userData.password,
            name: userData.name,
            email: userData.email,
            // 멱등성 키를 임시로 요청 데이터에 포함 (인터셉터에서 헤더로 이동)
            ...(idempotencyKey && { _idempotencyKey: idempotencyKey })
        };

        const response = await apiClient.post<{ success: boolean; member: User; message?: string }>('/api/members', requestData);
        return response.member;
    },
    /**
     * 현재 사용자 정보 조회
     */
    // getCurrentUser: async (): Promise<User> => {
    //     return apiClient.get<User>('/users/me');
    // }
})