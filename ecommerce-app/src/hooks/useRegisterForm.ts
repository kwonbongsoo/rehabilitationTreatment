/**
 * 회원가입 폼 훅
 *
 * 클린 아키텍처 원칙을 적용한 회원가입 상태 관리
 * - 단일 책임 원칙: 회원가입 폼 상태와 비즈니스 로직만 담당
 * - 의존성 역전: 도메인 서비스에 의존하여 비즈니스 규칙 처리
 * - 멱등성 보장: 중복 요청 방지 및 안전한 재시도 메커니즘
 *
 * @example
 * ```typescript
 * const { handleRegister, isLoading, error, clearError } = useRegisterForm();
 *
 * const onSubmit = async (data: RegisterFormData) => {
 *   await handleRegister(data);
 * };
 * ```
 */
import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useRegister } from './queries/useUser';
import { RegisterRequest } from '@/api/models/auth';
import { toast } from 'react-toastify';
import { registerDomainService } from '@/services/registerDomainService';
import { useIdempotentMutation } from './useIdempotentMutation';

/**
 * 회원가입 폼 데이터 타입
 */
interface RegisterFormData {
  id: string;
  password: string;
  confirmPassword: string;
  name: string;
  email: string;
}

/**
 * 요청 상태 정보 타입
 */
interface RequestStatus {
  idempotencyKey: string;
  sessionKey: string;
  isInProgress: boolean;
}

/**
 * 회원가입 폼 훅 반환 타입
 */
interface UseRegisterFormReturn {
  handleRegister: (formData: RegisterFormData) => Promise<void>;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string;
  clearError: () => void;
  hasError: boolean;
  // 개발 환경 전용 디버깅 정보
  requestStatus?: RequestStatus;
  cancelRequest?: () => void;
}

/**
 * 에러 상태 관리
 */
interface ErrorState {
  message: string;
  hasError: boolean;
}

/**
 * 초기 상태 및 상수
 */
const INITIAL_ERROR_STATE: ErrorState = {
  message: '',
  hasError: false,
};

const ERROR_MESSAGES = {
  REGISTER_FAILED: '회원가입 중 오류가 발생했습니다.',
  SUCCESS_REDIRECT: '/auth/login?message=registration_success',
} as const;

/**
 * 회원가입 데이터 변환기
 */
class RegisterDataTransformer {
  static transformFormDataToRequest(formData: RegisterFormData): RegisterRequest {
    return {
      id: formData.id.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      name: formData.name.trim(),
      email: formData.email.trim(),
    };
  }
}

/**
 * 회원가입 에러 처리기
 */
class RegisterErrorHandler {
  static extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return ERROR_MESSAGES.REGISTER_FAILED;
  }

  static showErrorToast(message: string): void {
    toast.error(message);
  }
}

/**
 * 회원가입 성공 처리기
 */
class RegisterSuccessHandler {
  constructor(private readonly router: ReturnType<typeof useRouter>) {}

  handlePostRegistrationActions(): void {
    const actions = registerDomainService.getPostRegisterActions();
    actions.forEach((action) => toast.success(action));
  }

  async redirectToLogin(): Promise<void> {
    await this.router.replace(ERROR_MESSAGES.SUCCESS_REDIRECT);
  }
}

/**
 * 회원가입 상태 관리기
 */
class RegisterStateManager {
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
      hasError: true,
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
 * 회원가입 폼 관련 비즈니스 로직을 관리하는 커스텀 훅
 */
export function useRegisterForm(): UseRegisterFormReturn {
  const [errorState, setErrorState] = useState<ErrorState>(INITIAL_ERROR_STATE);
  const router = useRouter();
  const registerMutation = useRegister();
  const idempotentMutation = useIdempotentMutation<any, RegisterRequest>();

  // 의존성 주입을 통한 협력 객체 생성
  const stateManager = new RegisterStateManager(setErrorState);
  const successHandler = new RegisterSuccessHandler(router);

  const clearError = useCallback(() => {
    stateManager.clearError();
  }, [stateManager]);

  const executeRegistration = useCallback(
    async (registerRequest: RegisterRequest): Promise<any> => {
      return await idempotentMutation.executeMutation(
        async (data: RegisterRequest, idempotencyKey: string) => {
          // 멱등성 키는 헤더로만 전송 - 요청 본문에서 제거
          return await registerMutation.mutateAsync({
            userData: data,
            idempotencyKey,
          });
        },
        registerRequest,
        {
          onSuccess: () => {
            successHandler.handlePostRegistrationActions();
          },
          onError: (error) => {
            const errorMessage = RegisterErrorHandler.extractErrorMessage(error);
            stateManager.setError(errorMessage);
            RegisterErrorHandler.showErrorToast(errorMessage);
          },
        },
      );
    },
    [idempotentMutation, registerMutation, stateManager, successHandler],
  );

  const handleRegister = useCallback(
    async (formData: RegisterFormData): Promise<void> => {
      try {
        stateManager.clearError();

        // 도메인 서비스를 통한 입력 검증
        registerDomainService.validateRegisterForm(formData);

        // 폼 데이터를 요청 데이터로 변환
        const registerRequest = RegisterDataTransformer.transformFormDataToRequest(formData);

        // 멱등성이 보장되는 회원가입 실행
        await executeRegistration(registerRequest);

        // 성공 시 로그인 페이지로 리다이렉트
        await successHandler.redirectToLogin();
      } catch (error) {
        // 에러는 이미 idempotentMutation에서 처리되었으므로 재던짐
        throw error;
      }
    },
    [stateManager, executeRegistration, successHandler],
  );

  // 요청 상태 정보
  const requestStatus = idempotentMutation.getRequestStatus();

  // 개발 환경에서만 디버깅 정보 제공
  const developmentProps =
    process.env.NODE_ENV === 'development'
      ? {
          requestStatus,
          cancelRequest: idempotentMutation.cancelCurrentRequest,
        }
      : {};

  return {
    handleRegister,
    isLoading: registerMutation.isPending,
    isSubmitting: requestStatus.isInProgress,
    error: errorState.message,
    clearError,
    hasError: errorState.hasError,
    ...developmentProps,
  };
}
