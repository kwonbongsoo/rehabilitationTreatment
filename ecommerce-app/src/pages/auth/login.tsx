import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import Divider from '@/components/auth/Divider';
import { useLoginForm } from '@/hooks/useLoginForm';
import { useCurrentUser } from '@/hooks/queries/useAuth';
import styles from '@/styles/auth/AuthLayout.module.css';

export default function Login() {
    const router = useRouter();
    const { data: user } = useCurrentUser({ enabled: false });
    const { handleLogin, isLoading, error } = useLoginForm();

    // 이미 로그인된 사용자는 홈으로 리다이렉트
    useEffect(() => {
        if (user && user.role !== 'guest') {
            router.replace('/');
        }
    }, [user, router]); return (
        <AuthLayout
            title="로그인"
            description="쇼핑몰 로그인 페이지"
            errorMessage={error}
        >
            <LoginForm
                onSubmit={handleLogin}
                isLoading={isLoading}
                error={error}
            />

            <div className={styles.linkContainer}>
                <Link href="/auth/forgot-password" className={styles.link}>
                    비밀번호를 잊으셨나요?
                </Link>
            </div>

            <Divider text="또는" />

            <div className={styles.linkContainer}>
                <p>계정이 없으신가요?</p>
                <Link href="/auth/register" className={styles.primaryLink}>
                    회원가입
                </Link>
            </div>
        </AuthLayout>
    );
}