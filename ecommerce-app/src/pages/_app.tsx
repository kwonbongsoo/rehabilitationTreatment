import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { AppProviders } from '@/providers/AppProviders';
import { registerGlobalTestFunctions } from '@/utils/proxyTester';
import { useAuth } from '@/store/useAuthStore';
import '@/styles/globals.css';

// 개발 환경에서 테스트 함수 등록
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  registerGlobalTestFunctions();
}

/**
 * 인증 초기화 컴포넌트
 * 앱 전체에서 한 번만 실행되는 인증 상태 초기화
 */
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { setUser } = useAuth();

  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window === 'undefined') return; // SSR 환경에서는 실행하지 않음

      try {
        const response = await fetch('/api/auth/session-info', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const { success, data } = await response.json();
          setUser(success ? data : null);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.warn('⚠️ 인증 상태 초기화 실패:', error);
      }
    };

    initializeAuth();
  }, [setUser]);

  return <>{children}</>;
}

/**
 * Next.js App 컴포넌트
 *
 * 클린 아키텍처 원칙 적용:
 * - 단일 책임 원칙: UI 렌더링만 담당
 * - 관심사 분리: Provider 초기화 로직 분리
 * - 인증 초기화: 앱 레벨에서 한 번만 실행
 */
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppProviders>
      <AuthInitializer>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthInitializer>
    </AppProviders>
  );
}

// 게스트 토큰 발급은 미들웨어에서 처리하므로 getInitialProps 제거
// 이를 통해 SSG 최적화와 성능 향상을 달성

export default MyApp;
