/**
 * 인증된 유저 리다이렉트 훅
 *
 * 로그인/회원가입/비밀번호 찾기 페이지에서 이미 인증된 유저를 홈으로 리다이렉트
 * 클라이언트 사이드 fallback으로만 사용 (서버 사이드 우선)
 */
import { useAuth } from '@/store/useAuthStore';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

interface UseAuthRedirectOptions {
  /** 리다이렉트할 경로 (기본값: '/') */
  redirectTo?: string;
  /** 게스트 유저도 리다이렉트할지 여부 (기본값: false) */
  includeGuest?: boolean;
  /** 리다이렉트 전 딜레이 (ms, 기본값: 0) */
  delay?: number;
}

export const useAuthRedirect = (options: UseAuthRedirectOptions = {}) => {
  const { redirectTo = '/', includeGuest = false, delay = 0 } = options;
  const router = useRouter();
  const { isAuthenticated, isGuest, user } = useAuth();

  useEffect(() => {
    // 로딩 중이거나 유저 정보가 없으면 대기
    if (!user) return;

    const shouldRedirect = includeGuest
      ? isAuthenticated // 게스트 포함하여 모든 인증된 유저
      : isAuthenticated && !isGuest; // 실제 로그인한 유저만

    if (shouldRedirect) {
      const redirect = () => {
        router.replace(redirectTo);
      };

      if (delay > 0) {
        const timeoutId = setTimeout(redirect, delay);
        return () => clearTimeout(timeoutId);
      } else {
        redirect();
      }
    }

    return () => {}; // 항상 cleanup 함수 반환
  }, [isAuthenticated, isGuest, user, router, redirectTo, includeGuest, delay]);

  return {
    isRedirecting: isAuthenticated && !isGuest,
    isAuthenticated,
    isGuest,
  };
};

/**
 * 인증 페이지용 특화 훅
 * 로그인/회원가입/비밀번호 찾기 페이지에서 사용
 */
export const useAuthPageRedirect = () => {
  return useAuthRedirect({
    redirectTo: '/',
    includeGuest: false, // 게스트는 제외, 실제 로그인한 유저만 리다이렉트
    delay: 100, // 약간의 딜레이로 깜빡임 방지
  });
};
