'use client';

import React, { memo } from 'react';
import { usePathname } from 'next/navigation';
import BottomNavigation from './BottomNavigation';
import HomeLayout from './HomeLayout';
import CommonLayout from './CommonLayout';
import styles from '@/styles/common/Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = memo(({ children }) => {
  const pathname = usePathname();

  // 바텀 네비게이션을 숨겨야 하는 페이지들
  const hideBottomNavPages = ['/filter', '/auth/login', '/auth/register', '/auth/forgot-password', '/product'];

  // 홈 페이지인지 확인
  const isHomePage = pathname === '/';

  // 헤더가 필요없는 페이지들 (인증 페이지 등)
  const noHeaderPages = ['/auth/login', '/auth/register', '/auth/forgot-password'];

  const shouldHideBottomNav = hideBottomNavPages.some((page) => pathname.startsWith(page));
  const shouldShowNoHeader = noHeaderPages.some((page) => pathname.startsWith(page));

  const renderContent = () => {
    if (shouldShowNoHeader) {
      // 인증 페이지 등은 헤더 없이 렌더링
      return children;
    } else if (isHomePage) {
      // 홈 페이지는 HomeLayout 사용
      return <HomeLayout>{children}</HomeLayout>;
    } else {
      // 나머지 페이지들은 CommonLayout 사용
      return <CommonLayout>{children}</CommonLayout>;
    }
  };

  return (
    <div className={styles.layout}>
      <main className={`${styles.main} ${shouldHideBottomNav ? styles.noBottomNav : ''}`}>
        {renderContent()}
      </main>
      {!shouldHideBottomNav && <BottomNavigation />}
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;
