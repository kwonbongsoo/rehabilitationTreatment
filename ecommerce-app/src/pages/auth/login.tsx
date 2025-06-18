import UserFormLayout from '@/components/shared/UserFormLayout';
import LoginPageContent from '@/components/auth/LoginPageContent';
import { useAuthPageRedirect } from '@/hooks/useAuthRedirect';
import LoadingIndicator from '@/components/common/LoadingIndicator';

export default function Login() {
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
    <UserFormLayout title="로그인" description="쇼핑몰 로그인 페이지">
      <LoginPageContent />
    </UserFormLayout>
  );
}
