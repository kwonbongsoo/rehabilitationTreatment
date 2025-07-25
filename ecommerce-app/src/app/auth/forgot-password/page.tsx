'use client';

import LoadingIndicator from '@/components/common/LoadingIndicator';
import dynamic from 'next/dynamic';

// 클라이언트에서만 실행되는 컴포넌트로 동적 임포트
const ForgotPasswordClient = dynamic(
  () => import('@/domains/auth/components/ForgotPasswordPageContent'),
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

export default function ForgotPasswordPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <ForgotPasswordClient />
    </div>
  );
}
