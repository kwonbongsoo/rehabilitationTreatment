'use client';

import React, { ReactElement } from 'react';
import Link from 'next/link';
import styles from '@/styles/error/NotFound.module.css';

export default function NotFound(): ReactElement {
  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.notFoundContent}>
        <div className={styles.iconContainer}>
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m-7 16h8a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className={styles.errorCode}>404</h1>

        <h2 className={styles.errorTitle}>페이지를 찾을 수 없습니다</h2>

        <p className={styles.errorMessage}>
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>

        <div className={styles.actionButtons}>
          <Link href="/" className={`${styles.actionButton} ${styles.primaryButton}`}>
            🏠 홈으로 이동
          </Link>
          <button
            onClick={() => window.history.back()}
            className={`${styles.actionButton} ${styles.secondaryButton}`}
          >
            ← 이전 페이지로
          </button>
        </div>

        <div className={styles.suggestions}>
          <h3 className={styles.suggestionsTitle}>대신 이런 페이지는 어떤가요?</h3>
          <div className={styles.suggestionsList}>
            <Link href="/categories" className={styles.suggestionLink} prefetch={false}>
              📂 전체 카테고리 보기
            </Link>
            <Link href="/products" className={styles.suggestionLink}>
              🛍️ 상품 둘러보기
            </Link>
            <Link href="/auth/login" className={styles.suggestionLink}>
              🔐 로그인하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
