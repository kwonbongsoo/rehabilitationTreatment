import React from 'react';
import { useGlobalError } from '../../store/useErrorStore';
import { ErrorMessage } from './ErrorMessage';

export const GlobalErrorHandler: React.FC = () => {
  const { globalError, clearGlobalError } = useGlobalError();

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
