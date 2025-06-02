import UserFormLayout from '@/components/shared/UserFormLayout';
import RegisterPageContent from '@/components/member/RegisterPageContent';

export default function Register() {
    return (
        <UserFormLayout
            title="회원가입"
            description="쇼핑몰 회원가입 페이지"
        >
            <RegisterPageContent />
        </UserFormLayout>
    );
}
