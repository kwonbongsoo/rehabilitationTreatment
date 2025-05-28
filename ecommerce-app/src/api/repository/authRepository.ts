import { apiClient } from '../client';
import { LoginRequest, LoginResponse, SignupRequest, UserResponse } from '../models/auth';

export const authRepository = {
    /**
     * 사용자 로그인
     */
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        return apiClient.post<LoginResponse>('/auth/login', credentials);
    },

    /**
     * 사용자 회원가입
     */
    signup: async (userData: SignupRequest): Promise<UserResponse> => {
        return apiClient.post<UserResponse>('/auth/signup', userData);
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
    }
};