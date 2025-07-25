'use client';

import { useLoginForm } from '@/domains/auth/hooks/useLoginForm';
import { useAuth } from '@/domains/auth/stores';
import styles from '@/styles/auth/MobileAuth.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoginForm } from './LoginForm';

export default function LoginPageContent() {
  const router = useRouter();
  const { isGuest } = useAuth();
  const { handleLogin, isLoading } = useLoginForm();
  const isClientSide = typeof window !== 'undefined';

  // 클라이언트에서만 토큰 체크 및 리다이렉트
  useEffect(() => {
    if (!isClientSide) return;
    if (!isGuest) {
      router.replace('/');
    }
  }, [isClientSide, router, isGuest]);

  const handleBackClick = () => {
    router.push('/');
  };

  return (
    <>
      <header className={styles.pageHeader}>
        <button className={styles.backButton} onClick={handleBackClick}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
        <h1 className={styles.headerTitle}>로그인</h1>
        <div></div>
      </header>

      <div className={styles.mobileAuthContainer}>
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>Hi Welcome</h1>
          <p className={styles.authSubtitle}>Hello again, you&apos;ve been missed!</p>
        </div>

        <div className={`${styles.authForm}`}>
          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

          <div className={styles.forgotPassword}>
            <Link href="/auth/forgot-password" className={styles.forgotLink}>
              Forgot your password?
            </Link>
          </div>
        </div>

        <div className={styles.authFooter}>
          <p className={styles.footerText}>Don&apos;t have an account?</p>
          <Link href="/auth/register" className={styles.signupLink}>
            Sign up for free
          </Link>
        </div>
      </div>
    </>
  );
}
