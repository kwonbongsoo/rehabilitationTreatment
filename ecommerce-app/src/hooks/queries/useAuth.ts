import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthRepository } from '../../context/RepositoryContext';
import { LoginRequest, LoginResponse, SessionInfoResponse } from '../../api/models/auth';
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
    const authRepo = useAuthRepository();
    const { setUser } = useAuth();

    return useMutation<LoginResponse, Error, LoginRequest>({
        mutationFn: async (credentials) => {
            return authRepo.login(credentials);
        }, onSuccess: (response) => {
            // React Error #185 방지를 위해 다음 틱에서 상태 업데이트
            setTimeout(() => {
                const { token, exp, iat, ...filteredUserResponse } = response.data;

                // 로그인 성공 시 AuthProvider 상태 업데이트
                setUser(filteredUserResponse);

                // React Query 캐시 업데이트
                queryClient.setQueryData(queryKeys.user.id(), filteredUserResponse);
            }, 0);
        }
    });
}

/**
 * 로그아웃 훅
 */
export function useLogout() {
    const authRepo = useAuthRepository();
    const { logout } = useAuth();

    return useMutation<void, Error, void>({
        mutationFn: async () => {
            return authRepo.logout();
        }, onSuccess: () => {
            // 쿠키지우는 코드 작성
            setTimeout(() => {
                // AuthProvider 상태 초기화
                logout();
                // 페이지 새로고침으로 서버에서 새 게스트 토큰 발급
                if (typeof window !== 'undefined') {
                    window.location.reload();
                }
            }, 0);
        }
    });
}


export function useSessionInfo() {
    const queryClient = useQueryClient();
    const authRepo = useAuthRepository();
    const { setUser } = useAuth();

    return useMutation<SessionInfoResponse, Error, void>({
        mutationFn: async () => {
            return authRepo.sessionInfo();
        }, onSuccess: (response) => {
            // 쿠키지우는 코드 작성
            setTimeout(() => {
                console.log(response.data);
                const { token, exp, iat, ...filteredUserResponse } = response.data;
                if (filteredUserResponse.role === 'user') {
                    setUser(filteredUserResponse);
                    queryClient.setQueryData(queryKeys.user.id(), filteredUserResponse);
                }
            }, 0);
        }
    });
}