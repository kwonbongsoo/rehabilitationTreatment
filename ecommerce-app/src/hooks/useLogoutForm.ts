/**
 * 로그아웃 폼 훅 (멱등성 키 적용)
 *
 * useIdempotentMutation을 활용하여 로그아웃 요청에 멱등성 보장
 */
import { ErrorHandler } from '@/utils/errorHandling';
import { NotificationManager } from '@/utils/notifications';
import { useCallback, useMemo } from 'react';
import { useLogout } from './queries/useAuth';
import { useIdempotentMutation } from './useIdempotentMutation';

/**
 * 로그아웃 폼 훅 반환 타입
 */
interface UseLogoutFormReturn {
  handleLogout: () => Promise<void>;
  isLoading: boolean;
}

/**
 * 로그아웃 폼 관련 비즈니스 로직을 관리하는 커스텀 훅
 * 멱등성 키를 활용하여 중복 로그아웃 요청 방지
 */
export function useLogoutForm(): UseLogoutFormReturn {
  const logoutMutation = useLogout();
  const { executeMutation, getRequestStatus } = useIdempotentMutation<void, void>();

  // 성공/에러 콜백을 useMemo로 메모이제이션
  const callbacks = useMemo(
    () => ({
      onSuccess: () => {
        // 성공 메시지 표시
        NotificationManager.showSuccess('로그아웃되었습니다.');
        setTimeout(() => {
          window.location.replace('/');
        }, 3000);
      },
      onError: (error: Error) => {
        // 에러 메시지를 토스트로 표시
        const errorMessage = error.message || '로그아웃 중 오류가 발생했습니다.';
        NotificationManager.showError(errorMessage);

        // 에러 로깅
        ErrorHandler.handleFormError(error, '로그아웃');
      },
    }),
    [],
  );

  const handleLogout = useCallback(async (): Promise<void> => {
    await executeMutation(
      async (_, idempotencyKey) => {
        await logoutMutation.mutateAsync();
      },
      undefined, // 로그아웃은 파라미터가 없음
      {
        useSessionKey: true, // 세션별 고정 키 사용
        ...callbacks,
      },
    );
  }, [logoutMutation, executeMutation, callbacks]);

  const requestStatus = getRequestStatus();

  return {
    handleLogout,
    isLoading: logoutMutation.isPending || requestStatus.isInProgress,
  };
}
