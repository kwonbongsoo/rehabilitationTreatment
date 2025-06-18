import UserFormLayout from '@/components/shared/UserFormLayout';
import ForgotPasswordPageContent from '@/components/member/ForgotPasswordPageContent';
import { useAuthPageRedirect } from '@/hooks/useAuthRedirect';
import LoadingIndicator from '@/components/common/LoadingIndicator';

export default function ForgotPassword() {
  const { isRedirecting } = useAuthPageRedirect();

  // 리다이렉트 중이면 로딩 표시
  if (isRedirecting) {
    return (
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
    );
  }

  return (
    <UserFormLayout title="비밀번호 찾기" description="비밀번호를 재설정하여 다시 로그인하세요">
      <ForgotPasswordPageContent />
    </UserFormLayout>
  );
}
