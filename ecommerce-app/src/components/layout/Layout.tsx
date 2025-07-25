'use client';

import React, { memo } from 'react';
import { usePathname } from 'next/navigation';
import BottomNavigation from './BottomNavigation';
import styles from '@/styles/common/Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = memo(({ children }) => {
  const pathname = usePathname();

  // 바텀 네비게이션을 숨겨야 하는 페이지들
  const hideBottomNavPages = ['/filter', '/auth/login', '/auth/register', '/auth/forgot-password'];

  const shouldHideBottomNav = hideBottomNavPages.some((page) => pathname.startsWith(page));

  return (
    <div className={styles.layout}>
      <main className={`${styles.main} ${shouldHideBottomNav ? styles.noBottomNav : ''}`}>
        {children}
      </main>
      {!shouldHideBottomNav && <BottomNavigation />}
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;
