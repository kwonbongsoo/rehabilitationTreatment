import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import LoginForm from './LoginForm';
import Divider from './Divider';
import { useLoginForm } from '@/hooks/useLoginForm';
import styles from '@/styles/templates/UserFormLayout.module.css';

export default function LoginPageContent() {
  const router = useRouter();
  const { handleLogin, isLoading } = useLoginForm();
  const isClientSide = typeof window !== 'undefined';

  // 클라이언트에서만 토큰 체크 및 리다이렉트
  useEffect(() => {
    if (!isClientSide) return;

    // 로그인 유저면 리다이렉트
    if (false) {
      // 실제 운용에서는 API로 토큰 검증이 필요하지만 현재는 토큰 존재만 확인
      // TODO: 추후 토큰 디코딩으로 role 확인 구현
      // router.replace('/');
    }
  }, [isClientSide, router]);

  return (
    <>
      <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

      <div className={styles.linkContainer}>
        <Link href="/member/forgot-password" className={styles.link}>
          비밀번호를 잊으셨나요?
        </Link>
      </div>

      <Divider text="또는" />

      <div className={styles.linkContainer}>
        <p>계정이 없으신가요?</p>
        <Link href="/member/register" className={styles.primaryLink}>
          회원가입
        </Link>
      </div>
    </>
  );
}
