import { useCallback } from 'react';
import { useErrorStore } from '../store/errorStore';
import { ApiError } from '../api/types';

export function useErrorHandler() {
    const { setGlobalError, clearGlobalError, addToastError } = useErrorStore();

    const handleError = useCallback((
        error: Error | ApiError,
        type: 'global' | 'toast' = 'toast'
    ) => {
        if (type === 'global') {
            setGlobalError(error);
        } else {
            const message = 'status' in error
                ? `Error ${error.status}: ${error.message}`
                : error.message;

            addToastError(message);
        }

        // 개발 환경에서 콘솔에 에러 로깅
        if (process.env.NODE_ENV !== 'production') {
            console.error('[Error Handler]', error);
        }
    }, [setGlobalError, addToastError]);

    return {
        handleError,
        clearError: clearGlobalError
    };
}