import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserResponse } from '../api/models/auth';
import { apiClient } from '../api/client';

interface AuthState {
    token: string | null;
    user: UserResponse | null;
    isAuthenticated: boolean;
    isGuest: boolean;
    setToken: (token: string) => void;
    setUser: (user: UserResponse | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            isGuest: false,
            setToken: (token) => set({ token, isAuthenticated: true }),
            setUser: (user) => set({
                user,
                isGuest: user?.role === 'guest' || false
            }),
            logout: () => set({ token: null, user: null, isAuthenticated: false, isGuest: false })
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ token: state.token }),
        }
    )
);

// 토큰 관련 유틸리티 함수들
export const getLocalToken = (): string | null => {
    return useAuthStore.getState().token;
};

export const clearToken = (): void => {
    useAuthStore.getState().logout();
};

export const refreshToken = async (): Promise<string | null> => {
    try {
        // 토큰 갱신 API 호출
        const response = await apiClient.post<{ token: string }>('/auth/refresh-token');

        // 새 토큰 저장
        const newToken = response.token;
        useAuthStore.getState().setToken(newToken);

        return newToken;
    } catch (error) {
        clearToken();
        return null;
    }
};