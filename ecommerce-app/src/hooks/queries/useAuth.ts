import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { LoginRequest, UserResponse, LoginResponse } from '../../api/models/auth';
import { queryKeys } from './queryKeys';
import { useAuth } from '../../store/authStore';

interface CurrentUserOptions {
    enabled?: boolean;
    retry?: boolean | number;
    onError?: (error: Error) => void;
}

/**
 * 로그인 훅 - AuthProvider와 안전한 연동
 */
export function useLogin() {
    const queryClient = useQueryClient();
    const { setToken, setUser } = useAuth();

    return useMutation<LoginResponse, Error, LoginRequest>({
        mutationFn: async (credentials) => {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                credentials: 'include', // 쿠키 포함
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: Login failed`);
            }

            const data = await response.json();

            // Auth 서비스 응답 구조에 맞게 파싱
            if (data.success && data.data) {
                const tokenData = data.data;
                return {
                    token: tokenData.token,
                    expiresIn: tokenData.expiresIn,
                    user: {
                        id: tokenData.id,
                        email: tokenData.email,
                        name: tokenData.name,
                        role: 'user' as const
                    }
                } as LoginResponse;
            } else {
                throw new Error('Invalid response format from auth service');
            }
        },
        onSuccess: (response) => {
            // React Error #185 방지를 위해 다음 틱에서 상태 업데이트
            setTimeout(() => {
                // 로그인 성공 시 AuthProvider 상태 업데이트
                setToken(response.token);
                setUser(response.user);

                // React Query 캐시 업데이트
                queryClient.setQueryData(queryKeys.user.me(), response.user);
            }, 0);
        }
    });
}

/**
 * 로그아웃 훅
 */
export function useLogout() {
    const queryClient = useQueryClient();
    const { logout } = useAuth();

    return useMutation<void, Error, void>({
        mutationFn: async () => {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include', // 쿠키 포함
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: Logout failed`);
            }

            // 성공 응답 확인 (필요시)
            const data = await response.json();
            if (!data.success) {
                throw new Error('Logout failed on server');
            }
        }, onSuccess: () => {
            // React Error #185 방지를 위해 다음 틱에서 상태 업데이트
            setTimeout(() => {
                // AuthProvider 상태 초기화
                logout();

                // React Query 캐시 초기화
                queryClient.removeQueries({ queryKey: ['user'] });

                // 페이지 새로고침으로 서버에서 새 게스트 토큰 발급
                if (typeof window !== 'undefined') {
                    window.location.reload();
                }
            }, 0);
        }
    });
}