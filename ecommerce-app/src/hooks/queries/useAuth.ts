import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { LoginRequest, UserResponse, LoginResponse } from '../../api/models/auth';
import { queryKeys } from './queryKeys';
import { useAuthStore } from '../../store/useAuthStore';
import { useAuth } from '../../store/authStore';

interface CurrentUserOptions {
    enabled?: boolean;
    retry?: boolean | number;
    onError?: (error: Error) => void;
}

/**
 * 현재 사용자 정보 조회 - zustand와 연동
 */
export function useCurrentUser(options: CurrentUserOptions = {}) {
    const { setUser, setLoading } = useAuthStore();

    // onError 콜백을 안정화
    const handleError = useCallback((error: Error) => {
        options.onError?.(error);
    }, [options.onError]);

    const query = useQuery<UserResponse, Error>({
        queryKey: queryKeys.user.me(),
        queryFn: async () => {
            // 임시로 빈 사용자 정보 반환 (추후 API 구현 시 교체)
            throw new Error('User info API not implemented');
        },
        enabled: false, // 일단 비활성화
        retry: options.retry ?? false,
        staleTime: 1000 * 60 * 5, // 5분 캐싱
    });

    // 별도 useEffect로 상태 관리 (react-query v5에서 onSuccess 제거됨)
    useEffect(() => {
        if (query.data) {
            setUser(query.data);
        } else if (query.error) {
            setUser(null);
            handleError(query.error);
        }
        setLoading(query.isLoading);
    }, [query.data, query.error, query.isLoading, setUser, setLoading, handleError]);

    return query;
}

/**
 * 로그인 훅
 */
export function useLogin() {
    const queryClient = useQueryClient();
    const { setUser } = useAuthStore();
    const { setToken } = useAuth();

    return useMutation<LoginResponse, Error, LoginRequest>({
        mutationFn: async (credentials) => {
            // TODO: API 호출 구현 필요
            throw new Error('Login API not implemented');
        },
        onSuccess: (response) => {
            // 로그인 성공 시 사용자 정보 저장 (토큰은 서버에서 쿠키로 설정됨)
            setToken(response.token);
            setUser(response.user);
            queryClient.setQueryData(queryKeys.user.me(), response.user);
        }
    });
}

/**
 * 로그아웃 훅
 */
export function useLogout() {
    const queryClient = useQueryClient();
    const { logout: zustandLogout } = useAuthStore();
    const { logout } = useAuth();

    return useMutation<void, Error, void>({
        mutationFn: async () => {
            // TODO: API 호출 구현 필요
            throw new Error('Logout API not implemented');
        },
        onSuccess: () => {
            // 로그아웃 처리 (zustand store에서 쿠키 삭제 처리)
            logout();
            zustandLogout();
            queryClient.removeQueries({ queryKey: ['user'] });

            // 페이지 새로고침으로 서버에서 새 게스트 토큰 발급
            if (typeof window !== 'undefined') {
                window.location.reload();
            }
        }
    });
}