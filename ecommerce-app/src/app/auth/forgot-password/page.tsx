'use client';

import LoadingIndicator from '@/components/common/LoadingIndicator';
import dynamic from 'next/dynamic';

// 클라이언트에서만 실행되는 컴포넌트로 동적 임포트
const ForgotPasswordClient = dynamic(
  () => import('@/components/member/ForgotPasswordPageContent'),
  {
    ssr: false, // 서버 사이드 렌더링 비활성화
    loading: () => (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
        }}
      >
        <LoadingIndicator />
      </div>
    ),
  },
);

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

export default function ForgotPasswordPage() {
  return (
    <UserFormLayoutClient
      title="비밀번호 찾기"
      description="비밀번호를 재설정하여 다시 로그인하세요"
    >
      <ForgotPasswordClient />
    </UserFormLayoutClient>
  );
}
