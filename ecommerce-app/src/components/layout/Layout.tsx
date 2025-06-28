'use client';

import React, { memo } from 'react';
import Header from './Header';
import styles from '@/styles/common/Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = memo(({ children }) => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>{children}</main>
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;
