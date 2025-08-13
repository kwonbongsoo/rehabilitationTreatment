'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { ReactElement, ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './AuthProvider';
import { UIConfigProvider, useUIConfig } from './UIConfigProvider';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * 내부 프로바이더 컴포넌트 - UIConfig Context 사용
 */
function InnerProviders({ children }: AppProvidersProps): ReactElement {
  const { queryClient, toastConfig, devtoolsConfig } = useUIConfig();

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

/**
 * 애플리케이션 전역 프로바이더 컴포넌트 - Context 패턴
 *
 * 메모리 릭 방지 개선사항:
 * - 전역변수 대신 React Context 사용
 * - React 생명주기에 따른 안전한 메모리 관리
 * - UIConfigProvider가 cleanup 담당
 *
 * 실무 베스트 프랙티스:
 * - Layout은 완전 정적으로 유지
 * - 서버에서 인증 상태 초기화하지 않음
 * - 클라이언트에서 필요시에만 인증 상태 로드
 */
export function AppProviders({ children }: AppProvidersProps): ReactElement {
  return (
    <UIConfigProvider>
      <InnerProviders>{children}</InnerProviders>
    </UIConfigProvider>
  );
}
