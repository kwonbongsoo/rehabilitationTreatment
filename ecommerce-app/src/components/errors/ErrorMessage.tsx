import React from 'react';
import { ApiError, getUserMessage } from '@/lib/api';

interface ErrorMessageProps {
  error: Error | ApiError | string;
  variant?: 'inline' | 'alert' | 'banner' | 'toast';
  showRetry?: boolean;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  variant = 'inline',
  showRetry = false,
  onRetry,
}) => {
  // 에러 메시지 추출 (Common 모듈 기반)
  const getMessage = () => {
    if (typeof error === 'string') return error;
    
    // getUserMessage 유틸리티 함수 사용
    return getUserMessage(error);
  };

  const renderContent = () => (
    <>
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <p className="error-message">{getMessage()}</p>
        {showRetry && (
          <button className="retry-button" onClick={onRetry}>
            다시 시도
          </button>
        )}
      </div>
    </>
  );

  switch (variant) {
    case 'alert':
      return (
        <div className="error-alert" role="alert">
          {renderContent()}
        </div>
      );
    case 'banner':
      return (
        <div className="error-banner" role="alert">
          {renderContent()}
        </div>
      );
    case 'toast':
      return (
        <div className="error-toast" role="alert">
          {renderContent()}
        </div>
      );
    case 'inline':
    default:
      return (
        <div className="error-inline" role="alert">
          {renderContent()}
        </div>
      );
  }
};
