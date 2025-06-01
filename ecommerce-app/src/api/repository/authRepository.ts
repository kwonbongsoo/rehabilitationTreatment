import { ApiClient } from '../client';
import { LoginRequest, LoginResponse, SignupRequest, UserResponse } from '../models/auth';

// 팩토리 함수로 변경하여 매번 새 인스턴스 생성
export const createAuthRepository = (apiClient: ApiClient) => ({
    /**
     * 사용자 로그인
     */
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        return apiClient.post<LoginResponse>('/auth/login', credentials);
    },

    /**
     * 게스트 토큰 발급
     */
    guestLogin: async (): Promise<LoginResponse> => {
        return apiClient.post<LoginResponse>('/auth/guest');
    },

    /**
     * 로그아웃
     */
    logout: async (): Promise<void> => {
        return apiClient.post<void>('/auth/logout');
    },

    /**
     * 토큰으로 사용자 정보 조회
     */
    getUserInfo: async (): Promise<UserResponse> => {
        return apiClient.get<UserResponse>('/auth/me');
    },


    /**
     * 토큰 갱신
     */
    getRefreshToken: async (): Promise<LoginResponse> => {
        return apiClient.post<LoginResponse>('/auth/refresh-token');
    }
});