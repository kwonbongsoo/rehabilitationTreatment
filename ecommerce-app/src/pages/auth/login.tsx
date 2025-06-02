import UserFormLayout from '@/components/shared/UserFormLayout';
import LoginPageContent from '@/components/auth/LoginPageContent';

export default function Login() {
    return (
        <UserFormLayout
            title="로그인"
            description="쇼핑몰 로그인 페이지"
        >
            <LoginPageContent />
        </UserFormLayout>
    );
}

