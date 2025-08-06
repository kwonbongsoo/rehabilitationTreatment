'use client';

import { createUIConfigurationService } from '@/services/uiConfigurationService';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode } from 'react';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './AuthProvider';

interface AppProvidersProps {
  children: ReactNode;
}

// UI 설정 서비스 인스턴스 (싱글톤 패턴)
const uiConfigService = createUIConfigurationService();
const uiConfig = uiConfigService.createConfiguration();

/**
 * 애플리케이션 전역 프로바이더 컴포넌트 - 정적 버전
 *
 * 실무 베스트 프랙티스:
 * - Layout은 완전 정적으로 유지
 * - 서버에서 인증 상태 초기화하지 않음
 * - 클라이언트에서 필요시에만 인증 상태 로드
 */
export function AppProviders({ children }: AppProvidersProps) {
  const { queryClient, toastConfig, devtoolsConfig } = uiConfig;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      <ToastContainer
        {...Object.fromEntries(
          Object.entries(toastConfig).filter(([, value]) => value !== undefined),
        )}
      />
      {devtoolsConfig.enabled && (
        <ReactQueryDevtools initialIsOpen={devtoolsConfig.initialIsOpen} />
      )}
    </QueryClientProvider>
  );
}
