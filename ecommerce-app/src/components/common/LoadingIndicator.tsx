import React from 'react';
import styles from '@/styles/common/LoadingIndicator.module.css';

interface LoadingIndicatorProps {
    fullScreen?: boolean;
    message?: string;
    size?: 'small' | 'medium' | 'large';
}

export default function LoadingIndicator({
    fullScreen = false,
    message = '로딩 중...',
    size = 'medium'
}: LoadingIndicatorProps) {
    return (
        <div className={`${styles.container} ${fullScreen ? styles.fullScreen : ''}`}>
            <div className={`${styles.loader} ${styles[size]}`}>
                <div className={styles.circle}></div>
                <div className={styles.circle}></div>
                <div className={styles.circle}></div>
                <div className={styles.shadow}></div>
                <div className={styles.shadow}></div>
                <div className={styles.shadow}></div>
            </div>
            {message && <p className={styles.message}>{message}</p>}
        </div>
    );
}