'use client';
/**
 * 로그인 폼 훅 (멱등성 키 적용)
 *
 * useIdempotentMutation을 활용하여 로그인 요청에 멱등성 보장
 */
import { LoginRequest } from '../types/auth';
import { authValidationService } from '@/domains/auth/services';
import { ErrorHandler } from '@/utils/errorHandling';
import { NotificationManager } from '@/utils/notifications';
import { useCallback, useMemo } from 'react';
import { login as loginAction } from '@/app/actions/auth';
import { useIdempotentMutation } from '@/hooks/useIdempotentMutation';

/**
 * 로그인 폼 훅 반환 타입
 */
interface UseLoginFormReturn {
  handleLogin: (credentials: LoginRequest) => Promise<void>;
  isLoading: boolean;
}

/**
 * 로그인 폼 관련 비즈니스 로직을 관리하는 커스텀 훅
 * 멱등성 키를 활용하여 중복 로그인 요청 방지
 */
export function useLoginForm(): UseLoginFormReturn {
  const { executeMutation, getRequestStatus } = useIdempotentMutation<void, LoginRequest>();

  // 안전한 리다이렉트 URL 생성 함수
  const getRedirectUrl = useCallback(
    (query: Record<string, string | string[] | undefined>): string => {
      const redirectTo = query.redirect as string;

      // 안전한 리다이렉트 URL 확인 (오픈 리다이렉트 방지)
      if (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')) {
        return redirectTo;
      }

      return '/'; // 기본 경로
    },
    [],
  );

  // 성공/에러 콜백을 useMemo로 메모이제이션
  const callbacks = useMemo(
    () => ({
      onSuccess: () => {
        // 성공 메시지 표시
        NotificationManager.showSuccess('로그인에 성공했습니다!');
        // 리다이렉트 처리
        const query = Object.fromEntries(new URLSearchParams(window.location.search));
        const redirectTo = getRedirectUrl(query);
        window.location.replace(redirectTo);
      },
      onError: (error: Error & { statusCode?: number }) => {
        // 401 에러인 경우 새로고침 로직 실행
        if (error.statusCode === 401 || error.statusCode === 403) {
          NotificationManager.showError('로그인이 필요합니다. 페이지를 새로고침합니다.');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
          return;
        }

        // 에러 메시지를 토스트로 표시
        const errorMessage = error.message || '로그인 중 오류가 발생했습니다.';
        NotificationManager.showError(errorMessage);

        // 에러 로깅
        ErrorHandler.handleFormError(error, '로그인');
      },
    }),
    [getRedirectUrl], // getRedirectUrl 의존성 추가
  );

  const handleLogin = useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      // 검증 서비스를 통한 입력 검증
      authValidationService.validateLoginCredentials(credentials);

      // 로그인 요청 실행
      await executeMutation(
        async (loginCredentials) => {
          const result = await loginAction(loginCredentials);

          if (!result.success) {
            const error = new Error(result.error || '로그인에 실패했습니다.') as Error & {
              statusCode?: number;
            };
            error.statusCode = result.statusCode || 500; // 상태 코드 전달
            throw error;
          }
        },
        credentials,
        {
          useSessionKey: true, // 세션별 고정 키 사용
          ...callbacks,
        },
      );
    },
    [executeMutation, callbacks], // 최소한의 의존성만
  );

  const requestStatus = getRequestStatus();

  return {
    handleLogin,
    isLoading: requestStatus.isInProgress,
  };
}
