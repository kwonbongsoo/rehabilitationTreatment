import React from 'react';
import { ApiError } from '../../api/types';

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
    onRetry
}) => {
    // 에러 메시지 추출
    const getMessage = () => {
        if (typeof error === 'string') return error;

        if ('status' in error && error.status) {
            // API 에러 처리
            switch (error.status) {
                case 401:
                    return '로그인이 필요합니다';
                case 403:
                    return '접근 권한이 없습니다';
                case 404:
                    return '요청하신 정보를 찾을 수 없습니다';
                case 500:
                    return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요';
                default:
                    return error.message || '오류가 발생했습니다';
            }
        }

        return error.message || '알 수 없는 오류가 발생했습니다';
    };

    const renderContent = () => (
        <>
            <div className="error-icon">⚠️</div>
            <div className="error-content">
                <p className="error-message">{getMessage()}</p>
                {showRetry && (
                    <button
                        className="retry-button"
                        onClick={onRetry}
                    >
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