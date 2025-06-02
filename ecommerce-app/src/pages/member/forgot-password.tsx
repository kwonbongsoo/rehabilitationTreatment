import UserFormLayout from '@/components/shared/UserFormLayout';
import ForgotPasswordPageContent from '@/components/member/ForgotPasswordPageContent';

export default function ForgotPassword() {
    return (
        <UserFormLayout
            title="비밀번호 찾기"
            description="비밀번호를 재설정하여 다시 로그인하세요"
        >
            <ForgotPasswordPageContent />
        </UserFormLayout>
    );
}
