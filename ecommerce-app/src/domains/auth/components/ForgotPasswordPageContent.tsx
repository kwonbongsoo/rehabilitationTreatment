'use client';

import Link from 'next/link';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { Divider } from './Divider';
import { useForgotPasswordForm } from '@/domains/auth/hooks/useForgotPasswordForm';
// import styles from '@/styles/templates/UserFormLayout.module.css';

export default function ForgotPasswordPageContent() {

  const { handleForgotPassword, isLoading } = useForgotPasswordForm();

  return (
    <>
      <ForgotPasswordForm onSubmit={handleForgotPassword} isLoading={isLoading} />

      <Divider text="또는" />

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p style={{ fontSize: '14px', color: '#666', margin: '0 0 8px 0' }}>비밀번호가 기억나셨나요?</p>
        <Link href="/auth/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: '600' }}>
          로그인
        </Link>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p style={{ fontSize: '14px', color: '#666', margin: '0 0 8px 0' }}>계정이 없으신가요?</p>
        <Link href="/auth/register" style={{ color: '#666', textDecoration: 'none' }}>
          회원가입
        </Link>
      </div>
    </>
  );
}
