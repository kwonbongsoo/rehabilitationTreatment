'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { useForgotPasswordForm } from '@/domains/auth/hooks/useForgotPasswordForm';
import styles from '@/styles/auth/MobileAuth.module.css';

export default function ForgotPasswordPageContent() {
  const router = useRouter();
  const { handleForgotPassword, isLoading } = useForgotPasswordForm();

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
        <h1 className={styles.headerTitle}>비밀번호 찾기</h1>
        <div></div>
      </header>

      <div className={styles.mobileAuthContainer}>
        <div className={styles.authHeader}>
          <div className={styles.brandLogo}></div>
          <h1 className={styles.authTitle}>Reset your password !</h1>
          <p className={styles.authSubtitle}>
            we have phone a copy of your registered phone number
          </p>
        </div>

        <div className={`${styles.authForm}`}>
          <ForgotPasswordForm onSubmit={handleForgotPassword} isLoading={isLoading} />
        </div>

        <div className={styles.authFooter}>
          <p className={styles.footerText}>Haven&apos;t received the code ?</p>
          <Link href="/auth/login" className={styles.signupLink}>
            Resend
          </Link>
        </div>
      </div>
    </>
  );
}
