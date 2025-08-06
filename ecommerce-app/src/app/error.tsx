'use client';

import React, { ReactElement } from 'react';
import { normalizeError, getErrorActions, getUserFriendlyMessage } from '@/utils/errorHandler';
import { useRouter } from 'next/navigation';
import styles from '@/styles/error/ErrorPage.module.css';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps): ReactElement {
  const router = useRouter();
  const normalizedError = normalizeError(error);
  const userMessage = getUserFriendlyMessage(normalizedError);
  const actions = getErrorActions(normalizedError);

  React.useEffect(() => {
    // 에러 로깅 (프로덕션에서는 외부 서비스로 전송)
    console.error('Client error:', {
      error: normalizedError,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error, normalizedError]);

  const handleAction = (action: (typeof actions)[0]): void => {
    switch (action.action) {
      case 'retry':
        reset();
        break;
      case 'reload':
        window.location.reload();
        break;
      case 'navigate':
        if (action.href) router.push(action.href);
        break;
      case 'login':
        if (action.href) router.push(action.href);
        break;
    }
  };

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <div className={styles.iconContainer}>
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h2 className={styles.errorTitle}>오류가 발생했습니다</h2>

        <p className={styles.errorMessage}>{userMessage}</p>

        {process.env.NODE_ENV === 'development' && (
          <div className={styles.developerInfo}>
            <details>
              <summary className={styles.developerSummary}>개발자 정보</summary>
              <div className={styles.developerDetails}>
                {JSON.stringify(
                  {
                    code: normalizedError.code,
                    statusCode: normalizedError.statusCode,
                    message: error.message,
                    digest: error.digest,
                  },
                  null,
                  2,
                )}
              </div>
            </details>
          </div>
        )}

        <div className={styles.actionButtons}>
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleAction(action)}
              className={`${styles.actionButton} ${
                action.action === 'retry' || action.action === 'reload'
                  ? styles.primaryButton
                  : styles.secondaryButton
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
