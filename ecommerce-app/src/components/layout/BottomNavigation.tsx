'use client';

import React, { memo } from 'react';
import { useBottomNavVisibility } from './BottomNavigation/useBottomNavVisibility';
import { useBottomNavigation } from './BottomNavigation/useBottomNavigation';
import { NavItem } from './BottomNavigation/NavItem';
import { BottomNavigationProps } from './BottomNavigation/types';
import styles from '@/styles/layout/BottomNavigation.module.css';

/**
 * 바텀 네비게이션 컴포넌트
 *
 * 특징:
 * - Intersection Observer를 활용한 스마트 가시성 제어
 * - 인증 상태에 따른 자동 리다이렉트
 * - 깔끔한 모듈화된 구조
 * - 최적화된 성능 (memo, useCallback 등)
 */
const BottomNavigation: React.FC<BottomNavigationProps> = memo(() => {
  const { isVisible } = useBottomNavVisibility({
    hideThreshold: 200,
    showThreshold: 100,
    autoShowDelay: 2000,
  });

  const { navItems, handleNavClick } = useBottomNavigation();

  return (
    <nav
      className={`${styles.bottomNav} ${isVisible ? styles.visible : styles.hidden}`}
      role="navigation"
      aria-label="메인 네비게이션"
    >
      <div className={styles.navContent}>
        {navItems.map((item) => (
          <NavItem key={item.id} item={item} onClick={handleNavClick} />
        ))}
      </div>
    </nav>
  );
});

BottomNavigation.displayName = 'BottomNavigation';

export default BottomNavigation;
