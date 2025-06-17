import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '@/store/authStore';
import { cookieService } from '@/services/cookieService';
import { useSessionInfo } from '@/hooks/queries/useAuth';

/**
 * 전역 인증 초기화 훅
 *
 * 책임:
 * 1. 앱 시작 시 토큰 검증
 * 2. session-info API 호출하여 사용자/게스트 정보 로드
 * 3. AuthStore 상태 업데이트
 * 4. 상태 변경 시 컴포넌트 반응
 */
export const useAuthInitializer = () => {
  const { setUser, isLoading } = useAuth();
  const sessionInfoMutation = useSessionInfo();
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * 인증 초기화 로직
   */
  const initializeAuth = useCallback(async () => {
    // 이미 초기화되었거나 로딩 중이면 실행하지 않음
    if (isInitialized || isLoading) {
      return;
    }

    try {
      // 클라이언트에서만 실행
      if (typeof window === 'undefined') {
        return;
      }

      const sessionInfo = await sessionInfoMutation.mutateAsync();

      // AuthStore 상태 업데이트 - 이제 컴포넌트가 반응함
      if (sessionInfo?.data) {
        const { exp, iat, ...userInfo } = sessionInfo.data;
        if (userInfo.role === 'user') {
          setUser(userInfo);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Auth initialization failed:', error);
      // 초기화 실패 시 상태 리셋
      setUser(null);
      setIsInitialized(false);
    }
  }, [isInitialized, isLoading, sessionInfoMutation, setUser]);

  // 컴포넌트 마운트 시 실행
  useEffect(() => {
    if (!isInitialized && !isLoading) {
      initializeAuth();
    }
  }, [initializeAuth, isInitialized, isLoading]);

  // 페이지 포커스 시 토큰 재검증 (선택적)
  useEffect(() => {
    const handleFocus = () => {
      const token = cookieService.getToken();
      if (token && isInitialized) {
        // 이미 초기화된 상태에서만 재검증
        setIsInitialized(false); // 재초기화를 위해 상태 리셋
      }
    };

    // 페이지 포커스 이벤트 리스너 등록
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [isInitialized]);

  return {
    initializeAuth,
    isInitialized,
    isLoading: sessionInfoMutation.isPending || isLoading,
  };
};
