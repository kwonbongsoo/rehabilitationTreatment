'use client';

import Link from 'next/link';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { useForgotPasswordForm } from '@/domains/auth/hooks/useForgotPasswordForm';
import styles from '@/styles/auth/MobileAuth.module.css';
import { ReactElement } from 'react';

export default function ForgotPasswordPageContent(): ReactElement {
  const { handleForgotPassword, isLoading } = useForgotPasswordForm();

  return (
    <>
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
