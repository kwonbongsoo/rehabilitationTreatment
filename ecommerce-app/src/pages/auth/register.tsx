import { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import RegisterForm from '@/components/auth/RegisterForm';
import Divider from '@/components/auth/Divider';
import styles from '@/styles/auth/AuthLayout.module.css';

export default function Register() {
    const [error, setError] = useState('');

    const handleRegister = async (formData: {
        id: string;
        password: string;
        confirmPassword: string;
        name: string;
        email: string;
    }) => {
        // 실제 회원가입 로직은 여기에 구현하지 않음
        console.log('회원가입 시도:', formData);

        // 비밀번호 확인 검증
        if (formData.password !== formData.confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return false;
        }

        // 아이디 길이 검증
        if (formData.id.length < 4) {
            setError('아이디는 4자 이상이어야 합니다.');
            return false;
        }

        // 비밀번호 길이 검증
        if (formData.password.length < 8) {
            setError('비밀번호는 8자 이상이어야 합니다.');
            return false;
        }

        return true;
    };

    return (
        <AuthLayout
            title="회원가입"
            description="쇼핑몰 회원가입 페이지"
            errorMessage={error}
        >
            <RegisterForm onSubmit={handleRegister} />

            <Divider text="또는" />

            <div className={styles.linkContainer}>
                <p>이미 계정이 있으신가요?</p>
                <Link href="/auth/login" className={styles.primaryLink}>
                    로그인
                </Link>
            </div>
        </AuthLayout>
    );
}