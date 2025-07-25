'use client';

import React, { memo } from 'react';
import BottomNavigation from './BottomNavigation';
import styles from '@/styles/common/Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = memo(({ children }) => {
  return (
    <div className={styles.layout}>
      <main className={styles.main}>{children}</main>
      <BottomNavigation />
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;
