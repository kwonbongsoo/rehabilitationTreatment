import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthRepository } from '../../context/RepositoryContext';
import { LoginRequest, UserResponse, LoginResponse } from '../../api/models/auth';

// 상수와 유틸리티 함수 분리
const TOKEN_STORAGE_KEY = 'auth-token';
const AUTH_QUERY_KEY = ['user', 'me'] as const;

// 로컬 스토리지 유틸리티 - 타입 안전하게 구현
export const tokenUtils = {
    getToken: (): string | null => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(TOKEN_STORAGE_KEY);
    },

    setToken: (token: string): void => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(TOKEN_STORAGE_KEY, token);
        }
    },

    clearToken: (): void => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
    }
};

interface CurrentUserOptions {
    enabled?: boolean;
    retry?: boolean | number;
    staleTime?: number;
    onSuccess?: (data: UserResponse) => void;
    onError?: (error: Error) => void;
}

// 명확한 타입 제한, 기본값 제공
export function useCurrentUser(options: CurrentUserOptions = {}) {
    const authRepo = useAuthRepository();
    const token = tokenUtils.getToken();

    return useQuery<UserResponse, Error>({
        queryKey: AUTH_QUERY_KEY,
        queryFn: () => authRepo.getUserInfo(),
        enabled: Boolean(token), // 명시적 boolean 변환
        retry: options.retry ?? false, // 기본값 제공
        staleTime: options.staleTime ?? 300000, // 5분 캐싱
        onError: (error: Error) => {
            tokenUtils.clearToken();
            options.onError?.(error);
        },
        ...options,
    });
}

// 명확한 반환 타입 설정
export function useLogin() {
    const queryClient = useQueryClient();
    const authRepo = useAuthRepository();

    return useMutation<LoginResponse, Error, LoginRequest>({
        mutationFn: (credentials: LoginRequest) => authRepo.login(credentials),
        onSuccess: (data) => {
            tokenUtils.setToken(data.token);
            queryClient.setQueryData(AUTH_QUERY_KEY, data.user);
        }
    });
}

interface RefreshTokenOptions {
    onSuccess?: (data: LoginResponse) => void;
    onError?: (error: Error) => void;
}

// 명확한 옵션 타입 정의
export function useRefreshToken(options: RefreshTokenOptions = {}) {
    const authRepo = useAuthRepository();

    return useMutation<LoginResponse, Error, void>({
        mutationFn: () => authRepo.getRefreshToken(),
        onSuccess: (data) => {
            tokenUtils.setToken(data.token);
            options.onSuccess?.(data);
        },
        onError: options.onError,
    });
}

export function useLogout() {
    const queryClient = useQueryClient();
    const authRepo = useAuthRepository();

    return useMutation<void, Error, void>({
        mutationFn: () => authRepo.logout(),
        onSuccess: () => {
            tokenUtils.clearToken();
            queryClient.removeQueries({ queryKey: ['user'] });
        }
    });
}