/**
 * 회원가입 폼 훅 (공통 모듈 활용)
 *
 * 기존의 복잡한 로직을 공통 모듈로 대체하고
 * 회원가입 특화 로직만 유지
 */
'use client';

import { RegisterRequest } from '@/api/models/auth';
import { ErrorHandler } from '@/utils/errorHandling';
import { NotificationManager, SUCCESS_MESSAGES } from '@/utils/notifications';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { register as registerAction } from '@/app/actions/auth';
import { useIdempotentMutation } from '@/hooks/useIdempotentMutation';

/**
 * 회원가입 폼 데이터
 */
export interface RegisterFormData {
  id: string;
  password: string;
  confirmPassword: string;
  name: string;
  email: string;
}

/**
 * 회원가입 폼 훅 반환 타입
 */
interface UseRegisterFormReturn {
  handleRegister: (formData: RegisterFormData) => Promise<boolean>;
  isLoading: boolean;
}

/**
 * 회원가입 폼 관련 비즈니스 로직을 관리하는 커스텀 훅
 * 공통 모듈을 활용하여 간소화됨
 */
export function useRegisterForm(): UseRegisterFormReturn {
  const router = useRouter();
  const { executeMutation, getRequestStatus } = useIdempotentMutation<void, RegisterRequest>();

  // 성공/에러 처리 로직을 useMemo로 메모이제이션
  const handlers = useMemo(
    () => ({
      showSuccessAndRedirect: () => {
        // 성공 메시지 표시
        NotificationManager.showSuccess(
          `${SUCCESS_MESSAGES.REGISTRATION_SUCCESS} 로그인 페이지로 이동합니다.`,
        );

        // 로그인 페이지로 리다이렉트
        setTimeout(() => {
          router.push('/auth/login?message=registration_success');
        }, 1500);
      },
      handleError: (error: unknown) => {
        // 에러 메시지를 토스트로 표시
        const errorMessage =
          error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다.';
        NotificationManager.showError(errorMessage);

        // 에러 로깅
        ErrorHandler.handleFormError(error, '회원가입');
      },
    }),
    [router], // router 전체 객체 의존성
  );

  const handleRegister = useCallback(
    async (formData: RegisterFormData): Promise<boolean> => {
      try {
        // 데이터 변환
        const registerRequest: RegisterRequest = {
          id: formData.id.trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          name: formData.name.trim(),
          email: formData.email.trim(),
        };

        // 회원가입 요청 실행 (멱등성 키: 세션 고정)
        await executeMutation(
          async (req, key) => {
            await registerAction(req, key);
          },
          registerRequest,
          { useSessionKey: true },
        );

        handlers.showSuccessAndRedirect();
        return true;
      } catch (error) {
        handlers.handleError(error);
        return false;
      }
    },
    [executeMutation, handlers], // executeMutation 의존성
  );

  return {
    handleRegister,
    isLoading: getRequestStatus().isInProgress,
  };
}
