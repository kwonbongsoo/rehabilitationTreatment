import React, { ReactNode, useEffect } from 'react';
import { useSessionInfo } from '@/hooks/queries/useAuth';
import { UserResponse } from '@/api/models/auth';
import { useAuth } from '@/store/useAuthStore';

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: UserResponse | null;
}

/**
 * 인증 상태 초기화 Provider
 *
 * 특징:
 * - UI 렌더링 없음 (children을 그대로 반환)
 * - 인증 상태 초기화만 담당
 * - 하위 컴포넌트 재렌더링 방지
 * - React Query 기반 인증 상태 관리
 */
export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const { setUser } = useAuth();

  // 1️⃣ 서버에서 전달된 초기 유저가 있으면 바로 상태 주입
  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser, setUser]);

  // 2️⃣ 클라이언트에서만(그리고 초기User가 없을 때) 세션 조회
  useSessionInfo({
    enabled: typeof window !== 'undefined' && !initialUser,
    retry: false,
    staleTime: 60_000,
    gcTime: 120_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    onError: (error) => {
      console.warn('⚠️ 인증 상태 초기화 실패:', error);
    },
  });

  // 🎯 children을 그대로 반환 (재렌더링 방지)
  return <>{children}</>;
}
