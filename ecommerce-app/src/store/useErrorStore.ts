/**
 * Zustand 기반 에러 상태 관리
 *
 * 전역 에러 상태와 토스트 알림을 관리합니다.
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { BaseError } from '@ecommerce/common';

export interface ToastError {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  timestamp: number;
}

export interface ErrorState {
  // 상태
  globalError: Error | BaseError | null;
  toastErrors: ToastError[];
  isHandlingError: boolean;

  // 액션
  setGlobalError: (error: Error | BaseError | null) => void;
  clearGlobalError: () => void;
  addToastError: (message: string, type?: ToastError['type']) => string;
  removeToastError: (id: string) => void;
  clearAllToastErrors: () => void;
  setHandlingError: (isHandling: boolean) => void;

  // 유틸리티 함수
  hasErrors: () => boolean;
  getErrorCount: () => number;
}

export const useErrorStore = create<ErrorState>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      globalError: null,
      toastErrors: [],
      isHandlingError: false,

      // 액션들
      setGlobalError: (error) => set({ globalError: error }),

      clearGlobalError: () => set({ globalError: null }),

      addToastError: (message, type = 'error') => {
        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

        set((state) => ({
          toastErrors: [
            ...state.toastErrors,
            {
              id,
              message,
              type,
              timestamp: Date.now(),
            },
          ],
        }));

        return id;
      },

      removeToastError: (id) =>
        set((state) => ({
          toastErrors: state.toastErrors.filter((error) => error.id !== id),
        })),

      clearAllToastErrors: () => set({ toastErrors: [] }),

      setHandlingError: (isHandling) => set({ isHandlingError: isHandling }),

      // 유틸리티 함수들
      hasErrors: () => {
        const { globalError, toastErrors } = get();
        return Boolean(globalError) || toastErrors.length > 0;
      },

      getErrorCount: () => {
        const { globalError, toastErrors } = get();
        return (globalError ? 1 : 0) + toastErrors.length;
      },
    }),
    {
      name: 'error-store', // Redux DevTools 이름
    },
  ),
);

// 편의 함수들 (React Context 패턴과 호환)
export const useGlobalError = (): {
  globalError: Error | BaseError | null;
  setGlobalError: (error: Error | BaseError | null) => void;
  clearGlobalError: () => void;
} => {
  const { globalError, setGlobalError, clearGlobalError } = useErrorStore();
  return { globalError, setGlobalError, clearGlobalError };
};

export const useToastError = (): {
  toastErrors: ToastError[];
  addToastError: (message: string, type?: ToastError['type']) => string;
  removeToastError: (id: string) => void;
  clearAllToastErrors: () => void;
} => {
  const { toastErrors, addToastError, removeToastError, clearAllToastErrors } = useErrorStore();

  return {
    toastErrors,
    addToastError,
    removeToastError,
    clearAllToastErrors,
  };
};
