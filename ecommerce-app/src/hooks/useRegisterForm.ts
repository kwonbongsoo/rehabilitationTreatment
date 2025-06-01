import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useRegister } from './queries/useUser';
import { RegisterRequest } from '@/api/models/auth';
import { toast } from 'react-toastify';
import { registerDomainService } from '@/services/registerDomainService';

interface UseRegisterFormReturn {
    handleRegister: (formData: RegisterFormData) => Promise<void>;
    isLoading: boolean;
    error: string;
    clearError: () => void;
}

interface RegisterFormData {
    id: string;
    password: string;
    confirmPassword: string;
    name: string;
    email: string;
}

/**
 * 회원가입 폼 관련 비즈니스 로직을 관리하는 커스텀 훅
 * 클린 아키텍처 원칙에 따라 UI와 비즈니스 로직을 분리
 */
export function useRegisterForm(): UseRegisterFormReturn {
    const [error, setError] = useState('');
    const router = useRouter();
    const registerMutation = useRegister();

    const clearError = useCallback(() => {
        setError('');
    }, []);

    const handleRegister = useCallback(async (formData: RegisterFormData): Promise<void> => {
        try {
            setError('');

            // 도메인 서비스를 통한 검증
            registerDomainService.validateRegisterForm(formData);

            // 회원가입 요청 데이터 구성
            const registerRequest: RegisterRequest = {
                id: formData.id.trim(),
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                name: formData.name.trim(),
                email: formData.email.trim()
            };

            const user = await registerMutation.mutateAsync(registerRequest);

            // 회원가입 성공 후 안내사항 표시
            const postRegisterActions = registerDomainService.getPostRegisterActions();
            postRegisterActions.forEach(action => toast.success(action));

            // 로그인 페이지로 리다이렉트
            await router.replace('/auth/login?message=registration_success');

        } catch (err) {
            const errorMessage = err instanceof Error
                ? err.message
                : '회원가입 중 오류가 발생했습니다.';

            setError(errorMessage);
            toast.error(errorMessage);
            throw err; // 상위 컴포넌트에서 추가 처리가 필요한 경우
        }
    }, [registerMutation, router, setError]);

    return {
        handleRegister,
        isLoading: registerMutation.isPending,
        error,
        clearError
    };
}