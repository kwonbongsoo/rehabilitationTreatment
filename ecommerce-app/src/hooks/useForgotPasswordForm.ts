/**
 * 비밀번호 찾기 폼 훅
 *
 * 클린 아키텍처 원칙을 적용한 비밀번호 찾기 폼 상태 관리
 * - 단일 책임 원칙: 비밀번호 찾기 폼 상태와 비즈니스 로직만 담당
 * - 의존성 역전: 도메인 서비스에 의존하여 비즈니스 규칙 처리
 * - 에러 처리 표준화: 일관된 에러 처리 및 사용자 피드백
 *
 * @example
 * ```typescript
 * const { handleForgotPassword, isLoading, error, clearError, isSuccess } = useForgotPasswordForm();
 *
 * const onSubmit = async (data: ForgotPasswordRequest) => {
 *   await handleForgotPassword(data);
 * };
 * ```
 */
import { useState, useCallback } from 'react';
import { ForgotPasswordRequest, ForgotPasswordResponse } from '@/api/models/auth';
import { toast } from 'react-toastify';

/**
 * 비밀번호 찾기 폼 훅 반환 타입
 */
interface UseForgotPasswordFormReturn {
    handleForgotPassword: (request: ForgotPasswordRequest) => Promise<void>;
    isLoading: boolean;
    error: string;
    clearError: () => void;
    hasError: boolean;
    isSuccess: boolean;
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
    FORGOT_PASSWORD_FAILED: '비밀번호 찾기 요청 중 오류가 발생했습니다.',
    SUCCESS: '비밀번호 재설정 링크가 이메일로 전송되었습니다.',
    INVALID_EMAIL: '올바른 이메일 주소를 입력해주세요.',
    NETWORK_ERROR: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
} as const;

/**
 * 에러 처리 유틸리티
 */
class ForgotPasswordErrorHandler {
    static extractErrorMessage(error: unknown): string {
        if (error instanceof Error) {
            // 네트워크 에러 체크
            if (error.message.includes('fetch')) {
                return ERROR_MESSAGES.NETWORK_ERROR;
            }
            // HTTP 에러 체크
            if (error.message.includes('HTTP 5')) {
                return ERROR_MESSAGES.SERVER_ERROR;
            }
            return error.message;
        }
        return ERROR_MESSAGES.FORGOT_PASSWORD_FAILED;
    }

    static showErrorToast(message: string): void {
        toast.error(message);
    }

    static showSuccessToast(): void {
        toast.success(ERROR_MESSAGES.SUCCESS);
    }
}

/**
 * 이메일 유효성 검증 유틸리티
 */
class EmailValidator {
    private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    static isValidEmail(email: string): boolean {
        return this.EMAIL_REGEX.test(email.trim());
    }

    static validateEmail(email: string): void {
        if (!email.trim()) {
            throw new Error('이메일 주소를 입력해주세요.');
        }

        if (!this.isValidEmail(email)) {
            throw new Error(ERROR_MESSAGES.INVALID_EMAIL);
        }
    }
}

/**
 * 비밀번호 찾기 상태 관리
 */
class ForgotPasswordStateManager {
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
 * 비밀번호 찾기 API 호출 서비스
 */
class ForgotPasswordService {
    static async sendForgotPasswordRequest(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
        const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}: Forgot password request failed`);
        }

        const data = await response.json();

        if (data.success) {
            return {
                message: data.message || ERROR_MESSAGES.SUCCESS,
                success: true
            };
        } else {
            throw new Error(data.message || ERROR_MESSAGES.FORGOT_PASSWORD_FAILED);
        }
    }
}

/**
 * 비밀번호 찾기 폼 관련 비즈니스 로직을 관리하는 커스텀 훅
 */
export function useForgotPasswordForm(): UseForgotPasswordFormReturn {
    const [errorState, setErrorState] = useState<ErrorState>(INITIAL_ERROR_STATE);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // 의존성 주입을 통한 협력 객체 생성
    const stateManager = new ForgotPasswordStateManager(setErrorState);

    const clearError = useCallback(() => {
        stateManager.clearError();
        setIsSuccess(false);
    }, [stateManager]);

    const handleForgotPassword = useCallback(async (request: ForgotPasswordRequest): Promise<void> => {
        try {
            setIsLoading(true);
            stateManager.clearError();
            setIsSuccess(false);

            // 이메일 유효성 검증
            EmailValidator.validateEmail(request.email);

            // API 요청 실행
            const response = await ForgotPasswordService.sendForgotPasswordRequest(request);

            // React Error #185 방지를 위해 성공 처리를 다음 틱에서 실행
            setTimeout(() => {
                setIsSuccess(true);
                ForgotPasswordErrorHandler.showSuccessToast();
            }, 0);

        } catch (error) {
            // React Error #185 방지를 위해 에러 처리를 다음 틱에서 실행
            setTimeout(() => {
                const errorMessage = ForgotPasswordErrorHandler.extractErrorMessage(error);
                stateManager.setError(errorMessage);
                ForgotPasswordErrorHandler.showErrorToast(errorMessage);
            }, 0);

            // 상위 컴포넌트에서 추가 처리가 필요한 경우를 위해 재던짐
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [stateManager]);

    return {
        handleForgotPassword,
        isLoading,
        error: errorState.message,
        clearError,
        hasError: errorState.hasError,
        isSuccess
    };
}
