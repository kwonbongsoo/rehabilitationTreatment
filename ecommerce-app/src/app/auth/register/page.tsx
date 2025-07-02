'use client';

import LoadingIndicator from '@/components/common/LoadingIndicator';
import dynamic from 'next/dynamic';

// 클라이언트에서만 실행되는 컴포넌트로 동적 임포트
const RegisterPageClient = dynamic(() => import('@/domains/auth/components/RegisterPageContent'), {
  ssr: true, // 서버 사이드 렌더링 비활성화
  loading: () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <LoadingIndicator />
    </div>
  ),
});

const UserFormLayoutClient = dynamic(() => import('@/components/templates/UserFormLayout'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <LoadingIndicator />
    </div>
  ),
});

export default function RegisterPage() {
  return (
    <UserFormLayoutClient title="회원가입" description="쇼핑몰 회원가입 페이지">
      <RegisterPageClient />
    </UserFormLayoutClient>
  );
}
