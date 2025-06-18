/**
 * 폼 상태 관리 공통 훅
 *
 * 모든 폼에서 공통으로 사용되는 상태 관리 로직을 추상화
 * - 제네릭 타입으로 다양한 폼 데이터 타입 지원
 * - 로딩, 에러, 성공 상태 통합 관리
 * - 폼 초기화, 필드 업데이트, 제출 처리 등 공통 기능 제공
 */

import { useState, useCallback } from 'react';

/**
 * 폼 상태 인터페이스
 */
export interface FormState<T> {
  data: T;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string;
  hasError: boolean;
  isSuccess: boolean;
  isDirty: boolean;
}

/**
 * 폼 액션 인터페이스
 */
export interface FormActions<T> {
  updateField: (field: keyof T, value: any) => void;
  updateData: (data: Partial<T>) => void;
  resetForm: () => void;
  setLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  setError: (error: string) => void;
  clearError: () => void;
  setSuccess: (success: boolean) => void;
  markDirty: () => void;
}

/**
 * 폼 훅 반환 타입
 */
export interface UseFormStateReturn<T> extends FormState<T>, FormActions<T> {
  handleSubmit: (submitFn: (data: T) => Promise<void>) => (e: React.FormEvent) => Promise<void>;
  isValid: boolean;
  canSubmit: boolean;
}

/**
 * 폼 설정 옵션
 */
export interface FormOptions<T> {
  initialData: T;
  validate?: (data: T) => string[];
  resetOnSuccess?: boolean;
  preventDuplicateSubmit?: boolean;
}

/**
 * 폼 상태 관리 훅
 */
export function useFormState<T extends Record<string, any>>(
  options: FormOptions<T>,
): UseFormStateReturn<T> {
  const { initialData, validate, resetOnSuccess = false, preventDuplicateSubmit = true } = options;

  // 기본 상태
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // 계산된 값들
  const hasError = Boolean(error);
  const validationErrors = validate ? validate(data) : [];
  const isValid = validationErrors.length === 0;
  const canSubmit = isValid && !isLoading && !isSubmitting && isDirty;

  // 필드 업데이트
  const updateField = useCallback(
    (field: keyof T, value: any) => {
      setData((prev) => ({ ...prev, [field]: value }));
      setIsDirty(true);
      if (error) setError(''); // 에러 클리어
      if (isSuccess) setIsSuccess(false); // 성공 상태 클리어
    },
    [error, isSuccess],
  );

  // 데이터 업데이트
  const updateData = useCallback(
    (newData: Partial<T>) => {
      setData((prev) => ({ ...prev, ...newData }));
      setIsDirty(true);
      if (error) setError('');
      if (isSuccess) setIsSuccess(false);
    },
    [error, isSuccess],
  );

  // 폼 초기화
  const resetForm = useCallback(() => {
    setData(initialData);
    setIsLoading(false);
    setIsSubmitting(false);
    setError('');
    setIsSuccess(false);
    setIsDirty(false);
  }, [initialData]);

  // 로딩 상태 설정
  const setLoadingState = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  // 제출 상태 설정
  const setSubmittingState = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  // 에러 설정
  const setErrorState = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setIsSuccess(false);
  }, []);

  // 에러 클리어
  const clearError = useCallback(() => {
    setError('');
  }, []);

  // 성공 상태 설정
  const setSuccessState = useCallback(
    (success: boolean) => {
      setIsSuccess(success);
      if (success) {
        setError('');
        if (resetOnSuccess) {
          resetForm();
        }
      }
    },
    [resetOnSuccess, resetForm],
  );

  // 더티 상태 설정
  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  // 폼 제출 핸들러
  const handleSubmit = useCallback(
    (submitFn: (data: T) => Promise<void>) => async (e: React.FormEvent) => {
      e.preventDefault();

      // 중복 제출 방지
      if (preventDuplicateSubmit && (isLoading || isSubmitting)) {
        return;
      }

      // 유효성 검사
      if (!isValid) {
        setError(validationErrors.join(' '));
        return;
      }

      setIsSubmitting(true);
      setError('');

      try {
        await submitFn(data);
        setIsSuccess(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '처리 중 오류가 발생했습니다.';
        setError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [data, isLoading, isSubmitting, isValid, validationErrors, preventDuplicateSubmit],
  );

  return {
    // 상태
    data,
    isLoading,
    isSubmitting,
    error,
    hasError,
    isSuccess,
    isDirty,
    isValid,
    canSubmit,

    // 액션
    updateField,
    updateData,
    resetForm,
    setLoading: setLoadingState,
    setSubmitting: setSubmittingState,
    setError: setErrorState,
    clearError,
    setSuccess: setSuccessState,
    markDirty,
    handleSubmit,
  };
}
