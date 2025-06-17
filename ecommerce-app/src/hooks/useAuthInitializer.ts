import { useEffect, useCallback, useRef } from 'react';
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
 * 4. 중복 실행 방지
 */
export const useAuthInitializer = () => {
  const { setUser } = useAuth();
  const sessionInfoMutation = useSessionInfo();
  const isInitialized = useRef(false);

  /**
   * 인증 초기화 로직
   */
  const initializeAuth = useCallback(async () => {
    // 이미 초기화되었으면 실행하지 않음
    if (isInitialized.current) {
      return;
    }

    isInitialized.current = true;

    try {
      // 클라이언트에서만 실행
      if (typeof window === 'undefined') {
        return;
      }

      await sessionInfoMutation.mutateAsync();
    } catch (error) {
      console.error('Auth initialization failed:', error);
      // 초기화 실패 시 상태 리셋
      setUser(null);
      // 초기화 실패 시 재시도 가능하도록 플래그 리셋
      isInitialized.current = false;
    }
  }, [sessionInfoMutation, setUser]);

  // 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // 페이지 포커스 시 토큰 재검증 제거 (무한 호출 방지)
  // 필요시 별도 훅으로 분리하여 선택적으로 사용

  return {
    initializeAuth,
    isInitialized: isInitialized.current,
    isLoading: sessionInfoMutation.isPending,
  };
};
