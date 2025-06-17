import type { AppProps } from 'next/app';
import Layout from '@/components/layout/Layout';
import { AppProviders } from '@/providers/AppProviders';
import { registerGlobalTestFunctions } from '@/utils/proxyTester';
import '@/styles/globals.css';

// 개발 환경에서 테스트 함수 등록
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  registerGlobalTestFunctions();
}

/**
 * Next.js App 컴포넌트
 *
 * 클린 아키텍처 원칙 적용:
 * - 단일 책임 원칙: UI 렌더링만 담당
 * - 관심사 분리: Provider 초기화 로직 분리
 * - 테스트 용이성: 각 부분을 독립적으로 테스트 가능
 */
function MyApp({ Component, pageProps }: AppProps) {
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
