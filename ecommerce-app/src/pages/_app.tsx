import type { AppProps, AppContext } from 'next/app';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from 'react-toastify';
import Layout from '@/components/layout/Layout';
import { ApiProvider } from '@/context/RepositoryContext';
import { createAppInitializationService } from '@/services/appInitializationService';
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
      <ApiProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <ToastContainer {...toastConfig} />
      </ApiProvider>
      {devtoolsConfig.enabled && (
        <ReactQueryDevtools initialIsOpen={devtoolsConfig.initialIsOpen} />
      )}
    </QueryClientProvider>
  );
}

/**
 * 앱 초기화 처리
 * 
 * 클린 아키텍처 원칙 적용:
 * - 단일 책임 원칙: 앱 초기화만 담당
 * - 의존성 역전 원칙: 초기화 서비스 인터페이스 의존
 * - 에러 처리: 실패해도 앱 실행 지속
 */
MyApp.getInitialProps = async (appContext: AppContext) => {
  const initializationService = createAppInitializationService();

  try {
    const result = await initializationService.initialize(appContext);

    if (!result.success) {
      // 초기화 실패는 로그만 남기고 앱 실행 계속
      console.warn(`⚠️ App initialization completed with warnings. Request ID: ${result.requestId}`);
    }
  } catch (error) {
    // 예상치 못한 에러도 앱 실행을 중단하지 않음
    console.error('🚨 Unexpected error during app initialization:', error);
  }

  return { pageProps: {} };
};

export default MyApp;