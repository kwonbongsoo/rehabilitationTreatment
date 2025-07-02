'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { Divider } from './Divider';
import { useForgotPasswordForm } from '@/hooks/useForgotPasswordForm';
import styles from '@/styles/templates/UserFormLayout.module.css';

export function ForgotPasswordPageContent() {
  const router = useRouter();

  const { handleForgotPassword, isLoading } = useForgotPasswordForm();

  const isClientSide = typeof window !== 'undefined';
  // 클라이언트에서만 토큰 체크 및 리다이렉트
  useEffect(() => {
    if (!isClientSide) return;
  }, [isClientSide, router]);

  return (
    <>
      <ForgotPasswordForm onSubmit={handleForgotPassword} isLoading={isLoading} />

      <Divider text="또는" />

      <div className={styles.linkContainer}>
        <p>비밀번호가 기억나셨나요?</p>
        <Link href="/auth/login" className={styles.primaryLink}>
          로그인
        </Link>
      </div>

      <div className={styles.linkContainer}>
        <p>계정이 없으신가요?</p>
        <Link href="/auth/register" className={styles.link}>
          회원가입
        </Link>
      </div>
    </>
  );
}
