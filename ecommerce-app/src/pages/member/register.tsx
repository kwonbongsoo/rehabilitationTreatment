import UserFormLayout from '@/components/shared/UserFormLayout';
import RegisterPageContent from '@/components/member/RegisterPageContent';
import { useAuthPageRedirect } from '@/hooks/useAuthRedirect';
import LoadingIndicator from '@/components/common/LoadingIndicator';

export default function Register() {
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
    <UserFormLayout title="회원가입" description="쇼핑몰 회원가입 페이지">
      <RegisterPageContent />
    </UserFormLayout>
  );
}
