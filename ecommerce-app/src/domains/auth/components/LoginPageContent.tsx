'use client';

import { useLoginForm } from '@/domains/auth/hooks/useLoginForm';
import { useAuth } from '@/domains/auth/stores';
import styles from '@/styles/templates/UserFormLayout.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Divider } from './Divider';
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

  return (
    <>
      <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

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
    </>
  );
}
