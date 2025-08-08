'use client';

import { useLoginForm } from '@/domains/auth/hooks/useLoginForm';
import styles from '@/styles/auth/MobileAuth.module.css';
import Link from 'next/link';
import { LoginForm } from './LoginForm';
import { ReactElement } from 'react';

export default function LoginPageContent(): ReactElement {
  const { handleLogin, isLoading } = useLoginForm();

  return (
    <>
      <div className={styles.mobileAuthContainer}>
        <div className={styles.authHeader}>
          <div className={styles.brandLogo}></div>
          <h1 className={styles.authTitle}>Login to your account</h1>
          <p className={styles.authSubtitle}>Welcome back we have missed you !</p>
        </div>

        <div className={`${styles.authForm}`}>
          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

          <div className={styles.forgotPassword}>
            <Link href="/auth/forgot-password" className={styles.forgotLink}>
              forgot password ?
            </Link>
          </div>
        </div>

        <div className={styles.authFooter}>
          <p className={styles.footerText}>Don&apos;t have an account ?</p>
          <Link href="/auth/register" className={styles.signupLink}>
            Sign up
          </Link>
        </div>
      </div>
    </>
  );
}
