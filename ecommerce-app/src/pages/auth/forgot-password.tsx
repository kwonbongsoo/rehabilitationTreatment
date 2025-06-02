import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AuthLayout from '@/components/auth/AuthLayout';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import Divider from '@/components/auth/Divider';
import { useForgotPasswordForm } from '@/hooks/useForgotPasswordForm';
import { cookieService } from '@/services/cookieService';
import styles from '@/styles/auth/AuthLayout.module.css';

export default function ForgotPassword() {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const { handleForgotPassword, isLoading, error, isSuccess } = useForgotPasswordForm();

    // 클라이언트 사이드 확인
    useEffect(() => {
        setIsClient(true);
    }, []);

    // 클라이언트에서만 토큰 체크 및 리다이렉트
    useEffect(() => {
        if (!isClient) return;
        
        const token = cookieService.getToken();
        // 이미 로그인된 유저는 메인으로 리다이렉트
        if (token) {
            router.replace('/');
        }
    }, [isClient, router]);

    return (
        <AuthLayout
            title="비밀번호 찾기"
            description="비밀번호를 재설정하여 다시 로그인하세요"
            errorMessage={error}
        >
            <ForgotPasswordForm
                onSubmit={handleForgotPassword}
                isLoading={isLoading}
                isSuccess={isSuccess}
            />

            <Divider text="또는" />

            <div className={styles.linkContainer}>
                <p>비밀번호가 기억나셨나요?</p>
                <Link href="/auth/login" className={styles.primaryLink}>
                    로그인
                </Link>
            </div>

            <div className={styles.linkContainer}>
                <p>계정이 없으신가요?</p>
                <Link href="/auth/register" className={styles.link}>
                    회원가입
                </Link>
            </div>
        </AuthLayout>
    );
}
