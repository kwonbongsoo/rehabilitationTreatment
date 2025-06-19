/**
 * 단순화된 로딩 상태 관리 훅
 *
 * 기존 useLoadingState의 복잡성을 제거하고 핵심 기능만 유지
 * - 로딩/제출 상태 관리
 * - 비동기 함수 실행 헬퍼
 * - 인터랙션 활성화/비활성화
 */

import { useState, useCallback } from 'react';

export interface SimpleLoadingState {
  isLoading: boolean;
  isSubmitting: boolean;
  isInteractionEnabled: boolean;
  loadingText?: string;
}

export interface SimpleLoadingActions {
  setLoading: (loading: boolean, text?: string) => void;
  setSubmitting: (submitting: boolean) => void;
  withLoading: <T>(asyncFn: () => Promise<T>, text?: string) => Promise<T>;
  withSubmitting: <T>(asyncFn: () => Promise<T>) => Promise<T>;
  reset: () => void;
}

export interface UseSimpleLoadingReturn extends SimpleLoadingState, SimpleLoadingActions {}

/**
 * 단순화된 로딩 상태 관리 훅
 */
export function useSimpleLoading(): UseSimpleLoadingReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingText, setLoadingText] = useState<string>();

  // 인터랙션 가능 여부 계산
  const isInteractionEnabled = !isLoading && !isSubmitting;

  // 로딩 상태 설정
  const setLoading = useCallback((loading: boolean, text?: string) => {
    setIsLoading(loading);
    setLoadingText(loading ? text : undefined);
  }, []);

  // 제출 상태 설정
  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  // 로딩과 함께 비동기 함수 실행
  const withLoading = useCallback(
    async <T>(asyncFn: () => Promise<T>, text?: string): Promise<T> => {
      try {
        setLoading(true, text);
        return await asyncFn();
      } finally {
        setLoading(false);
      }
    },
    [setLoading],
  );

  // 제출과 함께 비동기 함수 실행
  const withSubmitting = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T> => {
      try {
        setSubmitting(true);
        return await asyncFn();
      } finally {
        setSubmitting(false);
      }
    },
    [setSubmitting],
  );

  // 모든 상태 초기화
  const reset = useCallback(() => {
    setIsLoading(false);
    setIsSubmitting(false);
    setLoadingText(undefined);
  }, []);

  return {
    // 상태
    isLoading,
    isSubmitting,
    isInteractionEnabled,
    loadingText,

    // 액션
    setLoading,
    setSubmitting,
    withLoading,
    withSubmitting,
    reset,
  };
}

/**
 * 외부 로딩 상태와 결합하는 훅
 */
export function useCombinedSimpleLoading(externalLoading?: boolean, externalSubmitting?: boolean) {
  const internal = useSimpleLoading();

  const isLoading = internal.isLoading || Boolean(externalLoading);
  const isSubmitting = internal.isSubmitting || Boolean(externalSubmitting);
  const isInteractionEnabled = !isLoading && !isSubmitting;

  return {
    ...internal,
    isLoading,
    isSubmitting,
    isInteractionEnabled,
  };
}
