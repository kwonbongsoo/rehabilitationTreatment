/**
 * 로그인 폼 훅
 *
 * 클린 아키텍처 원칙을 적용한 로그인 폼 상태 관리
 * - 단일 책임 원칙: 로그인 폼 상태와 비즈니스 로직만 담당
 * - 의존성 역전: 도메인 서비스에 의존하여 비즈니스 규칙 처리
 * - 에러 처리 표준화: 일관된 에러 처리 및 사용자 피드백
 *
 * @example
 * ```typescript
 * const { handleLogin, isLoading, error, clearError } = useLoginForm();
 *
 * const onSubmit = async (data: LoginRequest) => {
 *   await handleLogin(data);
 * };
 * ```
 */
import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useLogin } from './queries/useAuth';
import { LoginRequest } from '@/api/models/auth';
import { toast } from 'react-toastify';
import { authDomainService } from '@/services/authDomainService';

/**
 * 로그인 폼 훅 반환 타입
 */
interface UseLoginFormReturn {
    handleLogin: (credentials: LoginRequest) => Promise<void>;
    isLoading: boolean;
    error: string;
    clearError: () => void;
    hasError: boolean;
}

/**
 * 에러 상태 관리
 */
interface ErrorState {
    message: string;
    hasError: boolean;
}

/**
 * 초기 에러 상태
 */
const INITIAL_ERROR_STATE: ErrorState = {
    message: '',
    hasError: false
};

/**
 * 에러 메시지 상수
 */
const ERROR_MESSAGES = {
    LOGIN_FAILED: '로그인 중 오류가 발생했습니다.',
    SUCCESS: '로그인에 성공했습니다!'
} as const;

/**
 * 에러 처리 유틸리티
 */
class LoginErrorHandler {
    static extractErrorMessage(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }
        return ERROR_MESSAGES.LOGIN_FAILED;
    }

    static showErrorToast(message: string): void {
        toast.error(message);
    }

    static showSuccessToast(): void {
        toast.success(ERROR_MESSAGES.SUCCESS);
    }
}

/**
 * 리다이렉트 처리 유틸리티
 */
class RedirectHandler {
    constructor(private readonly router: ReturnType<typeof useRouter>) { }

    async redirectAfterLogin(): Promise<void> {
        const redirectTo = authDomainService.getRedirectUrl(this.router.query);
        await this.router.replace(redirectTo);
    }
}

/**
 * 로그인 상태 관리
 */
class LoginStateManager {
    private errorState: ErrorState = INITIAL_ERROR_STATE;
    private setErrorState: (state: ErrorState) => void;

    constructor(setErrorState: (state: ErrorState) => void) {
        this.setErrorState = setErrorState;
    }

    clearError(): void {
        this.errorState = INITIAL_ERROR_STATE;
        this.setErrorState(this.errorState);
    }

    setError(message: string): void {
        this.errorState = {
            message,
            hasError: true
        };
        this.setErrorState(this.errorState);
    }

    getError(): string {
        return this.errorState.message;
    }

    hasError(): boolean {
        return this.errorState.hasError;
    }
}

/**
 * 로그인 폼 관련 비즈니스 로직을 관리하는 커스텀 훅
 */
export function useLoginForm(): UseLoginFormReturn {
    const [errorState, setErrorState] = useState<ErrorState>(INITIAL_ERROR_STATE);
    const router = useRouter();
    const loginMutation = useLogin();

    // 의존성 주입을 통한 협력 객체 생성
    const stateManager = new LoginStateManager(setErrorState);
    const redirectHandler = new RedirectHandler(router);

    const clearError = useCallback(() => {
        stateManager.clearError();
    }, [stateManager]); const handleLogin = useCallback(async (credentials: LoginRequest): Promise<void> => {
        try {
            stateManager.clearError();

            // 도메인 서비스를 통한 입력 검증
            authDomainService.validateLoginCredentials(credentials);

            // 로그인 요청 실행
            await loginMutation.mutateAsync(credentials);

            // React Error #185 방지를 위해 성공 처리를 다음 틱에서 실행
            setTimeout(() => {
                LoginErrorHandler.showSuccessToast();
            }, 0);

            // 리다이렉트는 바로 실행 (사용자 경험을 위해)
            await redirectHandler.redirectAfterLogin();

        } catch (error) {
            // React Error #185 방지를 위해 에러 처리를 다음 틱에서 실행
            setTimeout(() => {
                const errorMessage = LoginErrorHandler.extractErrorMessage(error);
                stateManager.setError(errorMessage);
                LoginErrorHandler.showErrorToast(errorMessage);
            }, 0);

            // 상위 컴포넌트에서 추가 처리가 필요한 경우를 위해 재던짐
            throw error;
        }
    }, [loginMutation, stateManager, redirectHandler]);

    return {
        handleLogin,
        isLoading: loginMutation.isPending,
        error: errorState.message,
        clearError,
        hasError: errorState.hasError
    };
}
