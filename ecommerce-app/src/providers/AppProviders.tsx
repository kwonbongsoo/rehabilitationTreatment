import { createUIConfigurationService } from '@/services/uiConfigurationService';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './AuthProvider';

interface AppProvidersProps {
  children: ReactNode;
}

// UI 설정 서비스 인스턴스 (싱글톤 패턴)
const uiConfigService = createUIConfigurationService();
const uiConfig = uiConfigService.createConfiguration();

/**
 * 애플리케이션 전역 프로바이더 컴포넌트
 *
 * 관심사 분리:
 * - 모든 Provider 초기화 로직을 한곳에 집중
 * - _app.tsx에서 렌더링 로직 분리
 * - 테스트 가능한 구조
 * - AuthProvider로 인증 상태 초기화 (렌더링 최적화)
 */
export function AppProviders({ children }: AppProvidersProps) {
  const { queryClient, toastConfig, devtoolsConfig } = uiConfig;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      <ToastContainer
        {...Object.fromEntries(
          Object.entries(toastConfig).filter(([_, value]) => value !== undefined),
        )}
      />
      {devtoolsConfig.enabled && (
        <ReactQueryDevtools initialIsOpen={devtoolsConfig.initialIsOpen} />
      )}
    </QueryClientProvider>
  );
}
