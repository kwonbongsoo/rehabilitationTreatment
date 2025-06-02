import type { AppProps, AppContext } from 'next/app';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from 'react-toastify';
import Layout from '@/components/layout/Layout';
import { ApiProvider } from '@/context/RepositoryContext';
import { AuthProvider } from '@/store/authStore';
import { createUIConfigurationService } from '@/services/uiConfigurationService';
import '@/styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';

// UI 설정 서비스 인스턴스 (싱글톤 패턴)
const uiConfigService = createUIConfigurationService();
const uiConfig = uiConfigService.createConfiguration();

/**
 * Next.js App 컴포넌트
 * 
 * 클린 아키텍처 원칙 적용:
 * - 단일 책임 원칙: UI 렌더링만 담당
 * - 의존성 역전 원칙: 서비스 인터페이스 의존
 * - 관심사 분리: 초기화 로직과 UI 로직 분리
 */
function MyApp({ Component, pageProps }: AppProps) {
  const { queryClient, toastConfig, devtoolsConfig } = uiConfig;
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ApiProvider>
          <Layout>
            <Component {...pageProps} />
            <ToastContainer {...toastConfig} />
          </Layout>
        </ApiProvider>
      </AuthProvider>
      {devtoolsConfig.enabled && (
        <ReactQueryDevtools initialIsOpen={devtoolsConfig.initialIsOpen} />
      )}
    </QueryClientProvider>
  );
}

// 게스트 토큰 발급은 미들웨어에서 처리하므로 getInitialProps 제거
// 이를 통해 SSG 최적화와 성능 향상을 달성

export default MyApp;

