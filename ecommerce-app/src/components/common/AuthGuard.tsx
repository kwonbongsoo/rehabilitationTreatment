'use client';

import { useAuth } from '@/domains/auth/stores';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

// 인증이 필요한 경로들
const PROTECTED_ROUTES = [
  '/account',
  '/account/add-product',
  '/account/profile',
  '/account/settings',
  '/orders',
  '/wishlist',
];

// 인증된 유저가 접근하면 안 되는 페이지들 (로그인/회원가입/비밀번호 찾기)
const AUTH_RESTRICTED_ROUTES = ['/auth/login', '/auth/register', '/auth/forgot-password'];

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isGuest, isSessionInitialized } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 현재 경로가 보호된 경로인지 확인
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/'),
  );

  // 현재 경로가 인증 제한 경로인지 확인
  const isAuthRestrictedRoute = AUTH_RESTRICTED_ROUTES.includes(pathname);

  useEffect(() => {
    if (!isClient || !isSessionInitialized) return;

    // 인증된 유저가 auth 페이지에 접근하려는 경우 홈으로 리다이렉트
    if (isAuthRestrictedRoute && !isGuest) {
      router.replace('/');
      return;
    }

    // 보호된 페이지에서 게스트 유저인 경우
    if (isProtectedRoute && isGuest) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
  }, [isClient, isSessionInitialized, isProtectedRoute, isAuthRestrictedRoute, isGuest, router, pathname]);

  // 서버사이드에서는 항상 렌더링
  if (!isClient) {
    return <>{children}</>;
  }

  // 세션이 초기화되지 않은 경우 로딩 표시
  if (!isSessionInitialized) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: '#f8f9fa',
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  // 클라이언트에서 인증 체크 (세션 초기화 완료 후)
  if (isProtectedRoute && isGuest) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: '#f8f9fa',
        }}
      >
        <div>Redirecting to login...</div>
      </div>
    );
  }

  return <>{children}</>;
}
