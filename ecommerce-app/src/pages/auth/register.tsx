import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import RegisterForm from '@/components/auth/RegisterForm';
import Divider from '@/components/auth/Divider';
import { useRegisterForm } from '@/hooks/useRegisterForm';
import styles from '@/styles/auth/AuthLayout.module.css';

export default function Register() {
    const {
        handleRegister,
        isLoading,
        isSubmitting,
        error,
        clearError,
        requestStatus
    } = useRegisterForm();

    const onSubmit = async (formData: {
        id: string;
        password: string;
        confirmPassword: string;
        name: string;
        email: string;
    }) => {
        clearError();

        try {
            await handleRegister(formData);
            return true;
        } catch (err) {
            // 에러는 useRegisterForm에서 처리됨
            return false;
        }
    };

    return (
        <AuthLayout
            title="회원가입"
            description="쇼핑몰 회원가입 페이지"
            errorMessage={error}
        >
            <RegisterForm
                onSubmit={onSubmit}
                isLoading={isLoading}
                isSubmitting={isSubmitting}
            />

            <Divider text="또는" />

            <div className={styles.linkContainer}>
                <p>이미 계정이 있으신가요?</p>
                <Link href="/auth/login" className={styles.primaryLink}>
                    로그인
                </Link>
            </div>

            {/* 개발 환경에서만 멱등성 정보 표시 */}
            {process.env.NODE_ENV === 'development' && requestStatus && (
                <div style={{
                    marginTop: '20px',
                    padding: '10px',
                    background: '#f0f0f0',
                    fontSize: '12px',
                    borderRadius: '4px'
                }}>
                    <strong>멱등성 정보 (개발용)</strong><br />
                    세션 키: {requestStatus.sessionKey}<br />
                    현재 키: {requestStatus.idempotencyKey}<br />
                    진행 중: {requestStatus.isInProgress ? 'Yes' : 'No'}
                </div>
            )}
        </AuthLayout>
    );
}