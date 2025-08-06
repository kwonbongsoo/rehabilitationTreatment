import React, { ReactElement } from 'react';
import styles from '@/styles/common/LoadingIndicator.module.css';

interface LoadingIndicatorProps {
  fullScreen?: boolean;
  message?: string;
  size?: 'small' | 'medium' | 'large';
  type?: 'loading' | 'submitting';
}

export default function LoadingIndicator({
  fullScreen = false,
  message,
  size = 'medium',
  type = 'loading',
}: LoadingIndicatorProps): ReactElement {
  // 타입에 따른 기본 메시지 설정
  const defaultMessage = type === 'submitting' ? '처리 중...' : '로딩 중...';
  const displayMessage = message || defaultMessage;

  return (
    <div className={`${styles.container} ${fullScreen ? styles.fullScreen : ''}`}>
      <div className={`${styles.loader} ${styles[size]} ${styles[type]}`}>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>
        <div className={styles.shadow}></div>
        <div className={styles.shadow}></div>
        <div className={styles.shadow}></div>
      </div>
      <p className={styles.message}>{displayMessage}</p>
    </div>
  );
}
