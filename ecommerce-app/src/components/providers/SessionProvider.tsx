'use client';
import React, { ReactElement } from 'react';
import { useAuth } from '@/domains/auth/stores';
import HomeSkeleton from '@/components/skeleton/HomeSkeleton';

interface SessionProviderProps {
  children: React.ReactNode;
}

/**
 * 세션 상태 기반 스켈레톤 UI 프로바이더
 *
 * 특징:
 * - 세션 초기화 완료 전까지 스켈레톤 UI 표시
 * - 실제 세션 초기화는 SessionInitializer에서 담당
 * - 모든 페이지에서 일관된 로딩 상태 제공
 */
export default function SessionProvider({ children }: SessionProviderProps): ReactElement {
  const { isSessionInitialized } = useAuth();

  // 세션이 초기화되지 않았으면 스켈레톤 UI 표시
  if (!isSessionInitialized) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'var(--color-background-secondary)',
        }}
      >
        <div
          style={{
            maxWidth: '500px',
            width: '100%',
            background: 'var(--color-background)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 0 30px rgba(11, 143, 172, 0.15)',
          }}
        >
          <HomeSkeleton />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
