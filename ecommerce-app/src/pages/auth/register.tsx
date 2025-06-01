import { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import RegisterForm from '@/components/auth/RegisterForm';
import Divider from '@/components/auth/Divider';
import { useRegisterForm } from '@/hooks/useRegisterForm';
import styles from '@/styles/auth/AuthLayout.module.css';

export default function Register() {
    const { handleRegister, isLoading, error, clearError } = useRegisterForm();

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
            <RegisterForm onSubmit={onSubmit} />

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