import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useLogin, useCurrentUser } from './queries/useAuth';
import { LoginRequest } from '@/api/models/auth';
import { toast } from 'react-toastify';
import { authDomainService } from '@/services/authDomainService';

interface UseLoginFormReturn {
    handleLogin: (credentials: LoginRequest) => Promise<void>;
    isLoading: boolean;
    error: string;
    clearError: () => void;
}

/**
 * 로그인 폼 관련 비즈니스 로직을 관리하는 커스텀 훅
 * 클린 아키텍처 원칙에 따라 UI와 비즈니스 로직을 분리
 */
export function useLoginForm(): UseLoginFormReturn {
    const [error, setError] = useState('');
    const router = useRouter();
    const loginMutation = useLogin();
    const { data: user } = useCurrentUser({ enabled: false });

    const clearError = useCallback(() => {
        setError('');
    }, []);

    const handleLogin = useCallback(async (credentials: LoginRequest): Promise<void> => {
        try {
            setError('');

            // 도메인 서비스를 통한 검증
            authDomainService.validateLoginCredentials(credentials);

            const result = await loginMutation.mutateAsync(credentials);

            toast.success('로그인에 성공했습니다!');

            // 로그인 후 안내사항 표시
            const postLoginActions = authDomainService.getPostLoginActions(result.user);
            postLoginActions.forEach(action => toast.info(action));

            // 안전한 리다이렉트 처리
            const redirectTo = authDomainService.getRedirectUrl(router.query);
            await router.replace(redirectTo);

        } catch (err) {
            const errorMessage = err instanceof Error
                ? err.message
                : '로그인 중 오류가 발생했습니다.';

            setError(errorMessage);
            toast.error(errorMessage);
            throw err; // 상위 컴포넌트에서 추가 처리가 필요한 경우
        }
    }, [loginMutation, router, setError]);

    return {
        handleLogin,
        isLoading: loginMutation.isPending,
        error,
        clearError
    };
}
