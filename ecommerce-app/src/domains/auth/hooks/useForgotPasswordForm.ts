/**
 * 비밀번호 찾기 폼 훅 (공통 모듈 활용)
 *
 * 기존의 복잡한 로직을 공통 모듈로 대체하고
 * 비밀번호 찾기 특화 로직만 유지
 */
import { useState } from 'react';
import { authValidationService } from '@/domains/auth/services';
import { ErrorHandler } from '@/utils/errorHandling';
import { useCallback } from 'react';
import { forgotPassword as forgotPasswordAction } from '@/app/actions/auth';
import { ForgotPasswordRequest } from '@/domains/auth/types/auth';

/**
 * 비밀번호 찾기 폼 훅 반환 타입
 */
interface UseForgotPasswordFormReturn {
  handleForgotPassword: (request: ForgotPasswordRequest) => Promise<void>;
  isLoading: boolean;
}

/**
 * 비밀번호 찾기 폼 관련 비즈니스 로직을 관리하는 커스텀 훅
 * 공통 모듈을 활용하여 간소화됨
 */
export function useForgotPasswordForm(): UseForgotPasswordFormReturn {
  const [, setIsLoading] = useState(false);
  const handleForgotPassword = useCallback(
    async (request: ForgotPasswordRequest): Promise<void> => {
      try {
        setIsLoading(true);
        // 이메일 유효성 검증
        const emailValidation = authValidationService.validateForgotPasswordForm(request);
        if (!emailValidation.isValid) {
          throw new Error(emailValidation.errors[0]);
        }

        // 비밀번호 찾기 요청 실행 (아직 미구현 API)
        await forgotPasswordAction(request);
      } catch (error) {
        // 에러 처리는 공통 모듈에서 담당
        ErrorHandler.handleFormError(error, '비밀번호 찾기');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    handleForgotPassword,
    isLoading: false, // 실제 API 연동 시 상태 관리 필요
  };
}
