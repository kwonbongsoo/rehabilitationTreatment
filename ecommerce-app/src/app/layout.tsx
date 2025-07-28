import Layout from '@/components/layout/Layout';
import SessionProvider from '@/components/providers/SessionProvider';
import SessionInitializer from '@/components/providers/SessionInitializer';
import { AppProviders } from '@/providers/AppProviders';
import '@/styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: {
    template: 'SHOP | %s',
    default: 'SHOP | 당신의 스타일을 완성하는 쇼핑몰',
  },
  description: '최신 트렌드의 의류, 신발, 액세서리를 만나보세요',
  keywords: ['쇼핑몰', '패션', '의류', '신발', '액세서리', '트렌드'],
  authors: [{ name: 'SHOP Team' }],
  creator: 'SHOP',
  publisher: 'SHOP',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://shop.example.com',
    siteName: 'SHOP',
    title: 'SHOP | 당신의 스타일을 완성하는 쇼핑몰',
    description: '최신 트렌드의 의류, 신발, 액세서리를 만나보세요',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SHOP | 당신의 스타일을 완성하는 쇼핑몰',
    description: '최신 트렌드의 의류, 신발, 액세서리를 만나보세요',
  },
};

/**
 * App Router 루트 레이아웃 - 클라이언트 전용 인증 패턴
 *
 * 실무 베스트 프랙티스:
 * - SSR 중에는 정적 렌더링 유지
 * - 클라이언트에서 인증 상태 로드
 * - React Query 클라이언트 전용 실행으로 안전성 보장
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AppProviders>
          <SessionInitializer />
          <SessionProvider>
            <Layout>{children}</Layout>
          </SessionProvider>
        </AppProviders>
      </body>
    </html>
  );
}
