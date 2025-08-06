import Head from 'next/head';
import { ReactNode } from 'react';

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

      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#007bff', margin: '0 0 8px 0' }}>SHOP</h1>
            <p style={{ fontSize: '14px', color: '#666', margin: '0' }}>당신의 쇼핑을 더 스마트하게</p>
          </div>

          {errorMessage && <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{errorMessage}</div>}

          {children}
        </div>
      </div>
    </>
  );
}
