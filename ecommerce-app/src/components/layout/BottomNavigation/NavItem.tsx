import React, { memo } from 'react';
import { NavItem as NavItemType } from './types';
import styles from '@/styles/layout/BottomNavigation.module.css';

interface NavItemProps {
  item: NavItemType & { isActive: boolean };
  onClick: (item: NavItemType) => void;
}

export const NavItem = memo<NavItemProps>(({ item, onClick }) => {
  const Icon = item.icon;

  const handleClick = () => {
    onClick(item);
  };

  return (
    <button
      className={`${styles.navItem} ${item.isActive ? styles.active : ''}`}
      onClick={handleClick}
      aria-label={item.label}
      type="button"
    >
      <span className={styles.navIcon}>
        <Icon size={20} />
      </span>
      <span className={styles.navLabel}>{item.label}</span>
    </button>
  );
});

NavItem.displayName = 'NavItem';
