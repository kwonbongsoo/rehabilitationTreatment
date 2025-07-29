import React from 'react';
import { useGlobalError } from '../../store/useErrorStore';
import { ErrorMessage } from './ErrorMessage';
import { normalizeError } from '../../utils/errorHandler';

export const GlobalErrorHandler: React.FC = () => {
  const { globalError, clearGlobalError } = useGlobalError();

  React.useEffect(() => {
    if (globalError) {
      const normalizedError = normalizeError(globalError);
      
      // 401 에러 감지 시 새로고침
      if (normalizedError.statusCode === 401) {
        window.location.reload();
      }
    }
  }, [globalError]);

  if (!globalError) return null;

  return (
    <div className="global-error-overlay">
      <div className="global-error-container">
        <ErrorMessage
          error={globalError}
          variant="banner"
          showRetry={true}
          onRetry={clearGlobalError}
        />
      </div>
    </div>
  );
};
