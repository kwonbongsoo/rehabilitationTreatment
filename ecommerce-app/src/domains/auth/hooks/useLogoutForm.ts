'use client';

/**
 * 로그아웃 폼 훅
 *
 * 서버 액션을 사용하여 로그아웃을 수행하고, 간단한 피드백을 제공한다.
 */

import { ErrorHandler } from '@/utils/errorHandling';
import { NotificationManager } from '@/utils/notifications';
import { logout as logoutAction } from '@/domains/auth/services';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useEffect, useState } from 'react';

/**
 * 로그아웃 폼 훅 반환 타입
 */
interface UseLogoutFormReturn {
  handleLogout: () => Promise<void>;
  isLoading: boolean;
}

export function useLogoutForm(): UseLogoutFormReturn {
  const router = useRouter();
  const timeoutRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleLogout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const result = await logoutAction();

      if (!result.success) {
        const error = new Error(result.error || '로그아웃에 실패했습니다.') as Error & {
          statusCode?: number;
        };
        error.statusCode = result.statusCode ?? 500;
        throw error;
      }

      NotificationManager.showSuccess('로그아웃되었습니다.');

      // 홈으로 리다이렉트 (약간의 지연 후)
      timeoutRef.current = window.setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '로그아웃 중 오류가 발생했습니다.';
      NotificationManager.showError(errorMessage);
      ErrorHandler.handleFormError(error, '로그아웃');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return {
    handleLogout,
    isLoading,
  };
}
