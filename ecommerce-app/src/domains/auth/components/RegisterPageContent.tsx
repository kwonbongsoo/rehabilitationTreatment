import React, { ReactElement } from 'react';
import Link from 'next/link';
import { RegisterForm } from './RegisterForm';
import { useRegisterForm } from '@/domains/auth/hooks/useRegisterForm';
import styles from '@/styles/auth/MobileAuth.module.css';

export default function RegisterPageContent(): ReactElement {
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
      <div className={styles.mobileAuthContainer}>
        <div className={styles.authHeader}>
          <div className={styles.brandLogo}></div>
          <h1 className={styles.authTitle}>Create your account</h1>
          <p className={styles.authSubtitle}>Welcome, let&apos;s fill in the account details</p>
        </div>

        <div className={`${styles.authForm}`}>
          <RegisterForm onSubmit={onSubmit} isLoading={isLoading} />
        </div>

        <div className={styles.authFooter}>
          <p className={styles.footerText}>Already have account ?</p>
          <Link href="/auth/login" className={styles.signupLink}>
            Login
          </Link>
        </div>
      </div>
    </>
  );
}
