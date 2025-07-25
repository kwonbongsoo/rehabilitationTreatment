'use client';

import { Suspense } from 'react';
import { AuthenticatedUserActions } from './AuthenticatedUserActions';
import AuthSkeleton from '@/components/skeleton/AuthSkeleton';
import { ClientOnly } from '@/components/common/ClientOnly';

/**
 * 사용자 액션 영역 - 클라이언트 전용 Suspense 패턴
 * 
 * 특징:
 * - SSR 중에는 스켈레톤 표시 (정적 렌더링)
 * - 클라이언트에서만 Suspense + 인증 상태 로딩
 * - 깜빡임 없는 매끄러운 UX
 */
export default function UserActions() {
  return (
    <ClientOnly fallback={<AuthSkeleton />}>
      <Suspense fallback={<AuthSkeleton />}>
        <AuthenticatedUserActions />
      </Suspense>
    </ClientOnly>
  );
}
