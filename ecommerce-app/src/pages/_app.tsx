import '../styles/globals.css';
import App, { AppContext, AppProps } from 'next/app';
import React from 'react';
import {
  QueryClient,
  QueryClientProvider,
  HydrationBoundary
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import ErrorBoundary from '../components/errors/ErrorBoundary';
import { GlobalErrorHandler } from '../components/errors/GlobalErrorHandler';
import { ToastNotification } from '../components/errors/ToastNotification';
import { ApiProvider } from '../context/RepositoryContext';
import { createApiClient, ApiClient } from '../api/client';

// 타입 확장으로 명확한 타입 정의
interface EcommerceAppProps extends AppProps {
  apiClient: ApiClient;
}

// QueryClient 인스턴스 생성
function EcommerceApp({ Component, pageProps, apiClient }: EcommerceAppProps) {
  // 각 요청마다 새 QueryClient 인스턴스 생성
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1분
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={pageProps.dehydratedState}>
          <ApiProvider initialApiClient={apiClient}>
            <GlobalErrorHandler />
            <Component {...pageProps} />
            <ToastNotification />
          </ApiProvider>
        </HydrationBoundary>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

// 기존 getInitialProps 코드 유지
EcommerceApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext);

  if (appContext.ctx.req) {
    const headers = appContext.ctx.req.headers;
    const apiClient = createApiClient({
      headers: {
        cookie: headers.cookie,
        'user-agent': headers['user-agent'],
        'x-forwarded-for': headers['x-forwarded-for']
      }
    });

    return { ...appProps, apiClient };
  }

  return { ...appProps, apiClient: createApiClient() };
};

export default EcommerceApp;