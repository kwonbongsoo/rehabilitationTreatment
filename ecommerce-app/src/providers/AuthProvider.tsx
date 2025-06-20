import React, { ReactNode } from 'react';
import { useSessionInfo } from '@/hooks/queries/useAuth';

interface AuthProviderProps {
  children: ReactNode;
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
export function AuthProvider({ children }: AuthProviderProps) {
  // 🎯 인증 상태 초기화 (UI와 분리)
  useSessionInfo({
    enabled: typeof window !== 'undefined', // 클라이언트에서만 실행
    retry: false, // 초기화 시에는 재시도하지 않음
    staleTime: 1 * 60 * 1000, // 1분 캐싱
    gcTime: 2 * 60 * 1000, // 2분 보관 (React Query v5에서 cacheTime → gcTime)
    refetchOnWindowFocus: false, // 윈도우 포커스 시 재요청 방지
    refetchOnMount: false, // 마운트 시 재요청 방지 (캐시 활용)
    onError: (error) => {
      console.warn('⚠️ 인증 상태 초기화 실패:', error);
      // 에러 발생 시 setUser(null)은 useSessionInfo hook 내부에서 처리됨
    },
  });

  // 🎯 children을 그대로 반환 (재렌더링 방지)
  return <>{children}</>;
}
