'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { Divider } from './Divider';
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
          <h1 className={styles.authTitle}>Reset Password</h1>
          <p className={styles.authSubtitle}>비밀번호를 재설정하여 다시 로그인하세요</p>
        </div>

        <div className={`${styles.authForm}`}>
          <ForgotPasswordForm onSubmit={handleForgotPassword} isLoading={isLoading} />

          <Divider text="또는" />

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ fontSize: '14px', color: '#666', margin: '0 0 8px 0' }}>
              비밀번호가 기억나셨나요?
            </p>
            <Link
              href="/auth/login"
              style={{ color: '#007bff', textDecoration: 'none', fontWeight: '600' }}
            >
              로그인
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ fontSize: '14px', color: '#666', margin: '0 0 8px 0' }}>
              계정이 없으신가요?
            </p>
            <Link href="/auth/register" style={{ color: '#666', textDecoration: 'none' }}>
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
