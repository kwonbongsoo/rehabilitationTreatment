'use client';

import { useRouter, usePathname } from 'next/navigation';
import React from 'react';
import styles from './CommonHeader.module.css';

interface CommonHeaderProps {
  title: string;
  showDeleteButton?: boolean;
  onDeleteClick?: () => void;
  isWishlisted?: boolean;
  onWishlistToggle?: () => void;
}

const CommonHeader: React.FC<CommonHeaderProps> = ({
  title,
  showDeleteButton = false,
  onDeleteClick,
  isWishlisted = false,
  onWishlistToggle,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleBackClick = () => {
    router.back();
  };

  const isCartPage = pathname === '/cart';
  const isProductDetailPage = /^\/products\/[^/]+$/.test(pathname);

  return (
    <div className={styles.header}>
      <button className={styles.backButton} onClick={handleBackClick} aria-label="뒤로가기">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <h1 className={styles.title}>{title}</h1>

      {isCartPage && showDeleteButton && (
        <button className={styles.deleteAllButton} onClick={onDeleteClick} aria-label="전체 삭제">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2" />
            <path
              d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" />
            <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      )}

      {isProductDetailPage && (
        <button
          className={`${styles.wishlistButton} ${isWishlisted ? styles.wishlisted : ''}`}
          onClick={() => onWishlistToggle?.()}
          aria-label={isWishlisted ? '위시리스트에서 제거' : '위시리스트에 추가'}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onWishlistToggle?.();
            }
          }}
          disabled={!onWishlistToggle}
        >
          {isWishlisted ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF4757">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          )}
        </button>
      )}

      {!isCartPage && !isProductDetailPage && <div className={styles.placeholder} />}
    </div>
  );
};

export default CommonHeader;
