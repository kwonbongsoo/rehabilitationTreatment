import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useRegister } from './queries/useUser';
import { RegisterRequest } from '@/api/models/auth';
import { toast } from 'react-toastify';
import { registerDomainService } from '@/services/registerDomainService';
import { useIdempotentMutation } from './useIdempotentMutation';

interface UseRegisterFormReturn {
    handleRegister: (formData: RegisterFormData) => Promise<void>;
    isLoading: boolean;
    isSubmitting: boolean; // 멱등성 관련 제출 상태
    error: string;
    clearError: () => void;
    // 디버깅용 정보
    requestStatus?: {
        idempotencyKey: string;
        sessionKey: string;
        isInProgress: boolean;
    };
    cancelRequest?: () => void;
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
 * 멱등성 보장 및 중복 요청 방지 기능 포함
 */
export function useRegisterForm(): UseRegisterFormReturn {
    const [error, setError] = useState('');
    const router = useRouter();
    const registerMutation = useRegister();
    const idempotentMutation = useIdempotentMutation<any, RegisterRequest>();

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
            };            // 멱등성이 보장되는 회원가입 실행
            const user = await idempotentMutation.executeMutation(
                async (data: RegisterRequest, idempotencyKey: string) => {
                    // 멱등성 키를 포함한 요청 데이터 생성
                    const requestWithIdempotency = {
                        ...data,
                        _idempotencyKey: idempotencyKey
                    };

                    return await registerMutation.mutateAsync(requestWithIdempotency);
                },
                registerRequest,
                {
                    onSuccess: (result) => {
                        // 회원가입 성공 후 안내사항 표시
                        const postRegisterActions = registerDomainService.getPostRegisterActions();
                        postRegisterActions.forEach(action => toast.success(action));
                    },
                    onError: (err) => {
                        const errorMessage = err instanceof Error
                            ? err.message
                            : '회원가입 중 오류가 발생했습니다.';

                        setError(errorMessage);
                        toast.error(errorMessage);
                    }
                }
            );

            // 로그인 페이지로 리다이렉트
            await router.replace('/auth/login?message=registration_success');

        } catch (err) {
            // 이미 idempotentMutation에서 처리된 에러는 그대로 전파
            throw err;
        }
    }, [registerMutation, router, setError, idempotentMutation]);    // 요청 상태 정보 제공
    const requestStatus = idempotentMutation.getRequestStatus();

    return {
        handleRegister,
        isLoading: registerMutation.isPending,
        isSubmitting: requestStatus.isInProgress,
        error,
        clearError,
        // 디버깅용 (개발 환경에서만)
        ...(process.env.NODE_ENV === 'development' && {
            requestStatus,
            cancelRequest: idempotentMutation.cancelCurrentRequest
        })
    };
}