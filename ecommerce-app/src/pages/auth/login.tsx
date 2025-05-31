import { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import Divider from '@/components/auth/Divider';
import styles from '@/styles/auth/AuthLayout.module.css';

export default function Login() {
    const [error, setError] = useState('');

    const handleLogin = async (id: string, password: string) => {
        // 실제 로그인 로직은 여기에 구현하지 않음
        console.log('로그인 시도:', id, password);
        // 예시 에러 처리
        if (!id || !password) {
            setError('아이디와 비밀번호를 모두 입력해주세요.');
        }
    };

    return (
        <AuthLayout
            title="로그인"
            description="쇼핑몰 로그인 페이지"
            errorMessage={error}
        >
            <LoginForm onSubmit={handleLogin} />

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