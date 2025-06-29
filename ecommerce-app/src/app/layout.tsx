import Layout from '@/components/layout/Layout';
import { AppProviders } from '@/providers/AppProviders';
import '@/styles/globals.css';
import { Metadata } from 'next';
import React from 'react';
import { getSessionInfo } from '@/app/actions/auth';
import { UserResponse } from '@/api/models/auth';

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
 * App Router 루트 레이아웃
 *
 * 클린 아키텍처 원칙 적용:
 * - 단일 책임 원칙: 전역 레이아웃 구성만 담당
 * - 관심사 분리: Provider 초기화 로직 분리
 * - 인증 초기화: AppProviders > AuthProvider에서 처리
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let initialUser: UserResponse | null = null;

  try {
    const session = await getSessionInfo();
    const { exp, iat, ...user } = session.data;
    initialUser = user;
  } catch {
    // 게스트 또는 비인증 상태
  }

  return (
    <html lang="ko">
      <body>
        <AppProviders initialUser={initialUser}>
          <Layout>{children}</Layout>
        </AppProviders>
      </body>
    </html>
  );
}
