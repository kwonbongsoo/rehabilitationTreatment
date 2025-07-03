import React from 'react';
import Link from 'next/link';
import { RegisterForm } from './RegisterForm';
import { Divider } from './Divider';
import { useRegisterForm } from '@/domains/auth/hooks/useRegisterForm';
import styles from '@/styles/templates/UserFormLayout.module.css';

export default function RegisterPageContent() {
  const { handleRegister, isLoading } = useRegisterForm();

  const onSubmit = React.useCallback(
    async (formData: {
      id: string;
      password: string;
      confirmPassword: string;
      name: string;
      email: string;
    }) => {
      try {
        return await handleRegister(formData);
      } catch (err) {
        // 개발 환경에서 에러 로깅 (디버깅 용이성)
        if (process.env.NODE_ENV === 'development') {
          console.error('[RegisterPageContent] Submit error:', err);
        }
        // 에러는 useRegisterForm에서 이미 처리되었으므로 false 반환
        return false;
      }
    },
    [handleRegister],
  );

  return (
    <>
      <RegisterForm onSubmit={onSubmit} isLoading={isLoading} />

      <Divider text="또는" />

      <div className={styles.linkContainer}>
        <p>이미 계정이 있으신가요?</p>
        <Link href="/auth/login" className={styles.primaryLink}>
          로그인
        </Link>
      </div>
    </>
  );
}
