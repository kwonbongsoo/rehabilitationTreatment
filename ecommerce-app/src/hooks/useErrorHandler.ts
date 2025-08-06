import { useCallback } from 'react';
import { useErrorStore } from '../store/useErrorStore';
import { BaseError, AuthenticationError, ValidationError, NotFoundError } from '@ecommerce/common';

/**
 * 에러 처리 훅
 * 전역 에러 상태 관리와 에러 처리 로직을 담당합니다
 */
export const useErrorHandler = (): {
  handleError: (error: Error | BaseError | unknown) => void;
  handleApiError: (error: unknown) => void;
  handleSuccess: (message: string) => void;
  clearErrors: () => void;
  hasErrors: () => boolean;
  getErrorCount: () => number;
} => {
  const {
    setGlobalError,
    clearGlobalError,
    addToastError,
    setHandlingError,
    hasErrors,
    getErrorCount,
  } = useErrorStore();

  const handleError = useCallback(
    (error: Error | BaseError | unknown) => {
      console.error('Error occurred:', error);

      setHandlingError(true);

      let toastType: 'error' | 'warning' | 'info' | 'success' = 'error';

      if (error instanceof AuthenticationError) {
        setGlobalError(error);
        toastType = 'error';
        addToastError(error.message, toastType);
      } else if (error instanceof ValidationError) {
        setGlobalError(error);
        toastType = 'warning';
        addToastError(error.message, toastType);
      } else if (error instanceof NotFoundError) {
        setGlobalError(error);
        toastType = 'info';
        addToastError(error.message, toastType);
      } else if (error instanceof BaseError) {
        setGlobalError(error);
        toastType = 'error';
        addToastError(error.message, toastType);
      } else if (error instanceof Error) {
        setGlobalError(error);
        toastType = 'error';
        addToastError(error.message, toastType);
      } else {
        const unknownError = new Error('알 수 없는 오류가 발생했습니다');
        setGlobalError(unknownError);
        toastType = 'error';
        addToastError(unknownError.message, toastType);
      }

      // 에러 처리 완료
      setTimeout(() => {
        setHandlingError(false);
      }, 100);
    },
    [setGlobalError, addToastError, setHandlingError],
  );

  const handleApiError = useCallback(
    (error: unknown) => {
      if (error instanceof BaseError) {
        handleError(error);
      } else if (error instanceof Error) {
        handleError(error);
      } else {
        handleError(new Error('API 요청 중 오류가 발생했습니다'));
      }
    },
    [handleError],
  );

  const handleSuccess = useCallback(
    (message: string) => {
      addToastError(message, 'success');
    },
    [addToastError],
  );

  const clearErrors = useCallback(() => {
    clearGlobalError();
  }, [clearGlobalError]);

  return {
    handleError,
    handleApiError,
    handleSuccess,
    clearErrors,
    hasErrors,
    getErrorCount,
  };
};
