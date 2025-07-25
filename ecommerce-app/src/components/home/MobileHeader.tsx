'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/home/MobileHeader.module.css';

interface MobileHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
  customActionButton?: {
    icon: React.ReactNode;
    onClick: () => void;
    label: string;
  };
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  title = 'Home Screen',
  showBackButton = false,
  onSearchClick,
  onNotificationClick,
  customActionButton,
}) => {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  const handleSearchClick = () => {
    if (onSearchClick) {
      onSearchClick();
    } else {
      router.push('/search');
    }
  };

  const handleNotificationClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
    } else {
      // 알림 페이지로 이동하거나 알림 모달 열기
      console.log('Notification clicked');
    }
  };

  return (
    <header className={styles.mobileHeader}>
      <div className={styles.headerTop}>
        {showBackButton ? (
          <button className={styles.backButton} onClick={handleBackClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        ) : (
          <div />
        )}
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.headerActions}>
          {customActionButton ? (
            <button
              className={styles.actionButton}
              onClick={customActionButton.onClick}
              aria-label={customActionButton.label}
            >
              {customActionButton.icon}
            </button>
          ) : (
            <button
              className={styles.actionButton}
              onClick={handleNotificationClick}
              aria-label="알림"
            >
              <span className={styles.notificationIcon}>🔔</span>
              <span className={styles.notificationBadge}>3</span>
            </button>
          )}
        </div>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.searchBar} onClick={handleSearchClick}>
          <span className={styles.searchIcon}>🔍</span>
          <span className={styles.searchPlaceholder}>검색해보세요</span>
          <button className={styles.filterButton} aria-label="필터">
            <span className={styles.filterIcon}>⚙️</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
