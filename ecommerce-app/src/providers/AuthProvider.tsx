import React, { ReactElement, ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 인증 상태 Provider - Suspense 패턴
 *
 * 특징:
 * - Suspense boundary에서 인증 상태 로딩 처리
 * - 깜빡임 없는 매끄러운 UX
 * - 컴포넌트별로 필요시에만 인증 상태 로드
 */
export function AuthProvider({ children }: AuthProviderProps): ReactElement {
  // Suspense 패턴에서는 단순히 children 반환
  // 실제 인증 로딩은 각 컴포넌트에서 Suspense로 처리
  return <>{children}</>;
}
