'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/home/MobileHeader.module.css';

interface MobileHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onSearchClick?: () => void;
  onFilterClick?: () => void;
  customActionButton?: {
    icon: React.ReactNode;
    onClick: () => void;
    label: string;
  };
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  title = 'Home',
  showBackButton = false,
  onSearchClick,
  onFilterClick,
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

  const handleFilterClick = (event: React.MouseEvent) => {
    // 이벤트 버블링 방지 - 부모의 onClick(서치바 클릭) 실행 방지
    event.stopPropagation();

    if (onFilterClick) {
      onFilterClick();
    } else {
      router.push('/filter');
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
          {customActionButton && (
            <button
              className={styles.actionButton}
              onClick={customActionButton.onClick}
              aria-label={customActionButton.label}
            >
              {customActionButton.icon}
            </button>
          )}
        </div>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.searchBar} onClick={handleSearchClick}>
          <span className={styles.searchIcon}>🔍</span>
          <span className={styles.searchPlaceholder}>Search</span>
          <button className={styles.filterButton} onClick={handleFilterClick} aria-label="필터">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className={styles.filterIcon}
            >
              <rect x="3" y="4" width="2" height="16" fill="white" rx="1" />
              <rect x="7" y="2" width="2" height="20" fill="white" rx="1" />
              <rect x="11" y="6" width="2" height="12" fill="white" rx="1" />
              <rect x="15" y="3" width="2" height="18" fill="white" rx="1" />
              <rect x="19" y="5" width="2" height="14" fill="white" rx="1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
