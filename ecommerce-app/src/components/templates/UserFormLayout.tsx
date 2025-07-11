import Head from 'next/head';
import { ReactNode } from 'react';
import styles from '@/styles/templates/UserFormLayout.module.css';

interface UserFormLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  errorMessage?: string;
}

export default function UserFormLayout({
  children,
  title,
  description = '쇼핑몰 인증',
  errorMessage,
}: UserFormLayoutProps) {
  return (
    <>
      <Head>
        <title>{`${title} | 쇼핑몰`}</title>
        <meta name="description" content={description} />
      </Head>

      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.logoContainer}>
            <h1 className={styles.logo}>SHOP</h1>
            <p className={styles.tagline}>당신의 쇼핑을 더 스마트하게</p>
          </div>

          {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}

          {children}
        </div>
      </div>
    </>
  );
}
