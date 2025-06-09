import { useCallback } from 'react';
import { useErrorStore } from '../store/errorStore';
import { BaseError, AuthenticationError, ValidationError, NotFoundError } from '../api/types';

/**
 * 에러 처리 훅
 * 전역 에러 상태 관리와 에러 처리 로직을 담당합니다
 */
export const useErrorHandler = () => {
    const { setGlobalError, clearGlobalError, addToastError } = useErrorStore();

    const handleError = useCallback((error: Error | BaseError | unknown) => {
        console.error('Error occurred:', error);

        if (error instanceof AuthenticationError) {
            setGlobalError(error);
            addToastError(error.message, 'error');
        } else if (error instanceof ValidationError) {
            setGlobalError(error);
            addToastError(error.message, 'warning');
        } else if (error instanceof NotFoundError) {
            setGlobalError(error);
            addToastError(error.message, 'info');
        } else if (error instanceof BaseError) {
            setGlobalError(error);
            addToastError(error.message, 'error');
        } else if (error instanceof Error) {
            setGlobalError(error);
            addToastError(error.message, 'error');
        } else {
            const unknownError = new Error('알 수 없는 오류가 발생했습니다');
            setGlobalError(unknownError);
            addToastError(unknownError.message, 'error');
        }
    }, [setGlobalError, addToastError]);

    const handleApiError = useCallback((error: unknown) => {
        if (error instanceof BaseError) {
            handleError(error);
        } else if (error instanceof Error) {
            handleError(error);
        } else {
            handleError(new Error('API 요청 중 오류가 발생했습니다'));
        }
    }, [handleError]);

    const clearErrors = useCallback(() => {
        clearGlobalError();
    }, [clearGlobalError]);

    return {
        handleError,
        handleApiError,
        clearErrors
    };
};
