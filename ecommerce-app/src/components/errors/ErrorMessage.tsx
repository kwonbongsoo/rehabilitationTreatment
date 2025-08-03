import React from 'react';
import { BaseError } from '@ecommerce/common';

interface ErrorMessageProps {
  error: Error | BaseError | string;
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
    
    // BaseError와 일반 Error 처리
    if (error instanceof BaseError || error instanceof Error) {
      return error.message;
    }
    
    return '알 수 없는 오류가 발생했습니다.';
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
