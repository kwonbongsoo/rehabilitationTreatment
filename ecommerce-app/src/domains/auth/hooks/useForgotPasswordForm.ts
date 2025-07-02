/**
 * 비밀번호 찾기 폼 훅 (공통 모듈 활용)
 *
 * 기존의 복잡한 로직을 공통 모듈로 대체하고
 * 비밀번호 찾기 특화 로직만 유지
 */
import { validationService } from '@/services';
import { ErrorHandler } from '@/utils/errorHandling';
import { NotificationManager } from '@/utils/notifications';
import { useCallback } from 'react';
import { forgotPassword as forgotPasswordAction } from '@/app/actions/auth';

/**
 * 비밀번호 찾기 요청 데이터
 */
export interface ForgotPasswordRequest {
  email: string;
}

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
  const handleForgotPassword = useCallback(
    async (request: ForgotPasswordRequest): Promise<void> => {
      try {
        // 이메일 유효성 검증
        const emailValidation = validationService.validateForgotPasswordForm(request);
        if (!emailValidation.isValid) {
          throw new Error(emailValidation.errors[0]);
        }

        // 비밀번호 찾기 요청 실행 (아직 미구현 API)
        await forgotPasswordAction(request);

        // 성공 메시지 표시
        NotificationManager.showSuccess(
          '비밀번호 재설정 이메일이 발송되었습니다. 이메일을 확인해주세요.',
        );
      } catch (error) {
        // 에러 처리는 공통 모듈에서 담당
        ErrorHandler.handleFormError(error, '비밀번호 찾기');
        throw error;
      }
    },
    [],
  );

  return {
    handleForgotPassword,
    isLoading: false, // 실제 API 연동 시 상태 관리 필요
  };
}
