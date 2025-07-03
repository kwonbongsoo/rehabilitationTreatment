'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { Divider } from './Divider';
import { useForgotPasswordForm } from '@/domains/auth/hooks/useForgotPasswordForm';
import styles from '@/styles/templates/UserFormLayout.module.css';

export default function ForgotPasswordPageContent() {
  const router = useRouter();

  const { handleForgotPassword, isLoading } = useForgotPasswordForm();

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
