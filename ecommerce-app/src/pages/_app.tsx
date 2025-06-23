import Layout from '@/components/layout/Layout';
import { AppProviders } from '@/providers/AppProviders';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';

/**
 * Next.js App 컴포넌트
 *
 * 클린 아키텍처 원칙 적용:
 * - 단일 책임 원칙: UI 렌더링만 담당
 * - 관심사 분리: Provider 초기화 로직 분리
 * - 인증 초기화: AppProviders > AuthProvider에서 처리
 * - 페이지 전환은 정상적인 동작이므로 렌더링 로거 제거
 */
function MyApp({ Component, pageProps }: AppProps) {
  // 🎯 MyApp 렌더링 로거 제거: 페이지 전환 시 재렌더링은 정상적인 동작
  // 하위 컴포넌트들의 불필요한 재렌더링만 방지하면 됨

  return (
    <AppProviders>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AppProviders>
  );
}

// 게스트 토큰 발급은 미들웨어에서 처리하므로 getInitialProps 제거
// 이를 통해 SSG 최적화와 성능 향상을 달성

export default MyApp;
