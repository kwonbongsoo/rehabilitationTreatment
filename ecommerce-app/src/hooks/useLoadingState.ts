/**
 * 로딩 상태 관리 공통 훅
 *
 * 다양한 로딩 상태를 통합 관리하는 훅
 * - 내부/외부 로딩 상태 조합
 * - 글로벌 로딩 상태 관리
 * - 버튼 비활성화 로직
 * - 로딩 타임아웃 처리
 */

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * 로딩 상태 인터페이스
 */
export interface LoadingState {
  isLoading: boolean;
  isSubmitting: boolean;
  isProcessing: boolean;
  canInteract: boolean;
  loadingMessage?: string;
}

/**
 * 로딩 액션 인터페이스
 */
export interface LoadingActions {
  setLoading: (loading: boolean, message?: string) => void;
  setSubmitting: (submitting: boolean) => void;
  setProcessing: (processing: boolean) => void;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  startSubmitting: () => void;
  stopSubmitting: () => void;
  resetAll: () => void;
}

/**
 * 로딩 훅 반환 타입
 */
export interface UseLoadingStateReturn extends LoadingState, LoadingActions {
  withLoading: <T>(asyncFn: () => Promise<T>, message?: string) => Promise<T>;
  withSubmitting: <T>(asyncFn: () => Promise<T>) => Promise<T>;
}

/**
 * 로딩 옵션
 */
export interface LoadingOptions {
  timeout?: number; // 로딩 타임아웃 (ms)
  onTimeout?: () => void; // 타임아웃 콜백
  preventInteraction?: boolean; // 상호작용 차단 여부
}

/**
 * 로딩 상태 관리 훅
 */
export function useLoadingState(options?: LoadingOptions): UseLoadingStateReturn {
  const { timeout, onTimeout, preventInteraction = true } = options || {};

  // 기본 상태
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>();

  // 타임아웃 관리
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // 모든 상태 리셋
  const resetAll = useCallback(() => {
    setIsLoading(false);
    setIsSubmitting(false);
    setIsProcessing(false);
    setLoadingMessage(undefined);
  }, []);

  // 계산된 값
  const canInteract = preventInteraction ? !(isLoading || isSubmitting || isProcessing) : true;

  // 타임아웃 처리
  useEffect(() => {
    if ((isLoading || isSubmitting || isProcessing) && timeout) {
      timeoutRef.current = setTimeout(() => {
        onTimeout?.();
        resetAll();
      }, timeout);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, isSubmitting, isProcessing, timeout, onTimeout, resetAll]);

  // 로딩 상태 설정
  const setLoadingState = useCallback((loading: boolean, message?: string) => {
    setIsLoading(loading);
    setLoadingMessage(loading ? message : undefined);
  }, []);

  // 제출 상태 설정
  const setSubmittingState = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  // 처리 상태 설정
  const setProcessingState = useCallback((processing: boolean) => {
    setIsProcessing(processing);
  }, []);

  // 로딩 시작
  const startLoading = useCallback(
    (message?: string) => {
      setLoadingState(true, message);
    },
    [setLoadingState],
  );

  // 로딩 중지
  const stopLoading = useCallback(() => {
    setLoadingState(false);
  }, [setLoadingState]);

  // 제출 시작
  const startSubmitting = useCallback(() => {
    setSubmittingState(true);
  }, [setSubmittingState]);

  // 제출 중지
  const stopSubmitting = useCallback(() => {
    setSubmittingState(false);
  }, [setSubmittingState]);

  // 로딩과 함께 비동기 함수 실행
  const withLoading = useCallback(
    async <T>(asyncFn: () => Promise<T>, message?: string): Promise<T> => {
      try {
        startLoading(message);
        return await asyncFn();
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading],
  );

  // 제출과 함께 비동기 함수 실행
  const withSubmitting = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T> => {
      try {
        startSubmitting();
        return await asyncFn();
      } finally {
        stopSubmitting();
      }
    },
    [startSubmitting, stopSubmitting],
  );

  return {
    // 상태
    isLoading,
    isSubmitting,
    isProcessing,
    canInteract,
    loadingMessage,

    // 액션
    setLoading: setLoadingState,
    setSubmitting: setSubmittingState,
    setProcessing: setProcessingState,
    startLoading,
    stopLoading,
    startSubmitting,
    stopSubmitting,
    resetAll,

    // 헬퍼
    withLoading,
    withSubmitting,
  };
}

/**
 * 복합 로딩 상태 훅 (내부 + 외부 로딩 상태 조합)
 */
export function useCombinedLoadingState(
  externalLoading?: boolean,
  externalSubmitting?: boolean,
  options?: LoadingOptions,
) {
  const internal = useLoadingState(options);

  // 최종 로딩 상태 계산
  const isLoading = internal.isLoading || Boolean(externalLoading);
  const isSubmitting = internal.isSubmitting || Boolean(externalSubmitting);
  const canInteract = !isLoading && !isSubmitting && !internal.isProcessing;

  return {
    ...internal,
    isLoading,
    isSubmitting,
    canInteract,
  };
}

/**
 * 글로벌 로딩 상태 관리 (여러 컴포넌트에서 공유)
 */
class GlobalLoadingManager {
  private static loadingCount = 0;
  private static callbacks = new Set<() => void>();

  static addLoading(): void {
    this.loadingCount++;
    this.notifyCallbacks();
  }

  static removeLoading(): void {
    this.loadingCount = Math.max(0, this.loadingCount - 1);
    this.notifyCallbacks();
  }

  static isLoading(): boolean {
    return this.loadingCount > 0;
  }

  static subscribe(callback: () => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  private static notifyCallbacks(): void {
    this.callbacks.forEach((callback) => callback());
  }
}

/**
 * 글로벌 로딩 상태 훅
 */
export function useGlobalLoading() {
  const [isGlobalLoading, setIsGlobalLoading] = useState(GlobalLoadingManager.isLoading());

  useEffect(() => {
    const unsubscribe = GlobalLoadingManager.subscribe(() => {
      setIsGlobalLoading(GlobalLoadingManager.isLoading());
    });

    return unsubscribe;
  }, []);

  const addGlobalLoading = useCallback(() => {
    GlobalLoadingManager.addLoading();
  }, []);

  const removeGlobalLoading = useCallback(() => {
    GlobalLoadingManager.removeLoading();
  }, []);

  const withGlobalLoading = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T> => {
      try {
        addGlobalLoading();
        return await asyncFn();
      } finally {
        removeGlobalLoading();
      }
    },
    [addGlobalLoading, removeGlobalLoading],
  );

  return {
    isGlobalLoading,
    addGlobalLoading,
    removeGlobalLoading,
    withGlobalLoading,
  };
}

/**
 * 버튼 상태 훅 (로딩 상태에 따른 버튼 비활성화)
 */
export function useButtonState(
  loading?: boolean,
  submitting?: boolean,
  disabled?: boolean,
  additionalConditions?: boolean[],
) {
  const isDisabled = Boolean(
    loading || submitting || disabled || additionalConditions?.some((condition) => condition),
  );

  const getButtonText = useCallback(
    (defaultText: string, loadingText?: string, submittingText?: string) => {
      if (submitting && submittingText) return submittingText;
      if (loading && loadingText) return loadingText;
      return defaultText;
    },
    [loading, submitting],
  );

  return {
    isDisabled,
    getButtonText,
    isLoading: Boolean(loading),
    isSubmitting: Boolean(submitting),
  };
}
