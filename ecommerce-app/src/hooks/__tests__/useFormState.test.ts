/**
 * useFormState 훅 테스트
 *
 * 폼 상태 관리 로직을 테스트합니다.
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useFormState, FormOptions } from '../useFormState';

interface TestFormData {
  name: string;
  email: string;
  age: number;
}

describe('useFormState', () => {
  const defaultInitialData: TestFormData = {
    name: '',
    email: '',
    age: 0,
  };

  const createDefaultOptions = (
    overrides?: Partial<FormOptions<TestFormData>>,
  ): FormOptions<TestFormData> => ({
    initialData: defaultInitialData,
    ...overrides,
  });

  describe('초기화', () => {
    it('초기 데이터로 올바르게 초기화되어야 한다', () => {
      const initialData = { name: 'John', email: 'john@example.com', age: 25 };
      const { result } = renderHook(() => useFormState(createDefaultOptions({ initialData })));

      expect(result.current.data).toEqual(initialData);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.error).toBe('');
      expect(result.current.hasError).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isDirty).toBe(false);
      expect(result.current.isValid).toBe(true);
      expect(result.current.canSubmit).toBe(false); // isDirty가 false이므로
    });

    it('모든 핸들러 함수들이 제공되어야 한다', () => {
      const { result } = renderHook(() => useFormState(createDefaultOptions()));

      expect(typeof result.current.updateField).toBe('function');
      expect(typeof result.current.updateData).toBe('function');
      expect(typeof result.current.resetForm).toBe('function');
      expect(typeof result.current.setLoading).toBe('function');
      expect(typeof result.current.setSubmitting).toBe('function');
      expect(typeof result.current.setError).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
      expect(typeof result.current.setSuccess).toBe('function');
      expect(typeof result.current.markDirty).toBe('function');
      expect(typeof result.current.handleSubmit).toBe('function');
    });
  });

  describe('필드 업데이트', () => {
    it('updateField로 개별 필드를 업데이트할 수 있어야 한다', () => {
      const { result } = renderHook(() => useFormState(createDefaultOptions()));

      act(() => {
        result.current.updateField('name', 'John');
      });

      expect(result.current.data.name).toBe('John');
      expect(result.current.isDirty).toBe(true);
    });

    it('updateField 시 에러가 클리어되어야 한다', () => {
      const { result } = renderHook(() => useFormState(createDefaultOptions()));

      // 에러 설정
      act(() => {
        result.current.setError('테스트 에러');
      });

      expect(result.current.error).toBe('테스트 에러');

      // 필드 업데이트
      act(() => {
        result.current.updateField('name', 'John');
      });

      expect(result.current.error).toBe('');
    });

    it('updateField 시 성공 상태가 클리어되어야 한다', () => {
      const { result } = renderHook(() => useFormState(createDefaultOptions()));

      // 성공 상태 설정
      act(() => {
        result.current.setSuccess(true);
      });

      expect(result.current.isSuccess).toBe(true);

      // 필드 업데이트
      act(() => {
        result.current.updateField('name', 'John');
      });

      expect(result.current.isSuccess).toBe(false);
    });

    it('updateData로 여러 필드를 한번에 업데이트할 수 있어야 한다', () => {
      const { result } = renderHook(() => useFormState(createDefaultOptions()));

      act(() => {
        result.current.updateData({ name: 'John', email: 'john@example.com' });
      });

      expect(result.current.data.name).toBe('John');
      expect(result.current.data.email).toBe('john@example.com');
      expect(result.current.isDirty).toBe(true);
    });
  });

  describe('상태 관리', () => {
    it('로딩 상태를 설정할 수 있어야 한다', () => {
      const { result } = renderHook(() => useFormState(createDefaultOptions()));

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('제출 상태를 설정할 수 있어야 한다', () => {
      const { result } = renderHook(() => useFormState(createDefaultOptions()));

      act(() => {
        result.current.setSubmitting(true);
      });

      expect(result.current.isSubmitting).toBe(true);

      act(() => {
        result.current.setSubmitting(false);
      });

      expect(result.current.isSubmitting).toBe(false);
    });

    it('에러 상태를 설정하고 클리어할 수 있어야 한다', () => {
      const { result } = renderHook(() => useFormState(createDefaultOptions()));

      act(() => {
        result.current.setError('테스트 에러');
      });

      expect(result.current.error).toBe('테스트 에러');
      expect(result.current.hasError).toBe(true);

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe('');
      expect(result.current.hasError).toBe(false);
    });

    it('성공 상태를 설정할 수 있어야 한다', () => {
      const { result } = renderHook(() => useFormState(createDefaultOptions()));

      act(() => {
        result.current.setSuccess(true);
      });

      expect(result.current.isSuccess).toBe(true);
      expect(result.current.error).toBe(''); // 성공 시 에러 클리어
    });

    it('더티 상태를 설정할 수 있어야 한다', () => {
      const { result } = renderHook(() => useFormState(createDefaultOptions()));

      expect(result.current.isDirty).toBe(false);

      act(() => {
        result.current.markDirty();
      });

      expect(result.current.isDirty).toBe(true);
    });
  });

  describe('폼 초기화', () => {
    it('resetForm으로 모든 상태가 초기화되어야 한다', () => {
      const initialData = { name: 'Initial', email: 'initial@example.com', age: 20 };
      const { result } = renderHook(() => useFormState(createDefaultOptions({ initialData })));

      // 상태 변경
      act(() => {
        result.current.updateField('name', 'Changed');
        result.current.setLoading(true);
        result.current.setSubmitting(true);
        result.current.setError('에러 메시지');
        result.current.setSuccess(true);
        result.current.markDirty();
      });

      // 초기화
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.data).toEqual(initialData);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.error).toBe('');
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isDirty).toBe(false);
    });
  });

  describe('유효성 검사', () => {
    const validateFunction = (data: TestFormData): string[] => {
      const errors: string[] = [];
      if (!data.name) errors.push('이름은 필수입니다');
      if (!data.email.includes('@')) errors.push('올바른 이메일 형식이 아닙니다');
      if (data.age < 18) errors.push('나이는 18세 이상이어야 합니다');
      return errors;
    };

    it('유효성 검사 함수가 없을 때 항상 유효해야 한다', () => {
      const { result } = renderHook(() => useFormState(createDefaultOptions()));

      expect(result.current.isValid).toBe(true);
    });

    it('유효성 검사를 통과하면 isValid가 true여야 한다', () => {
      const initialData = { name: 'John', email: 'john@example.com', age: 25 };
      const { result } = renderHook(() =>
        useFormState(createDefaultOptions({ initialData, validate: validateFunction })),
      );

      expect(result.current.isValid).toBe(true);
    });

    it('유효성 검사를 실패하면 isValid가 false여야 한다', () => {
      const initialData = { name: '', email: 'invalid-email', age: 16 };
      const { result } = renderHook(() =>
        useFormState(createDefaultOptions({ initialData, validate: validateFunction })),
      );

      expect(result.current.isValid).toBe(false);
    });

    it('필드 업데이트 시 유효성 검사가 재실행되어야 한다', () => {
      const { result } = renderHook(() =>
        useFormState(createDefaultOptions({ validate: validateFunction })),
      );

      expect(result.current.isValid).toBe(false); // 초기에는 유효하지 않음

      act(() => {
        result.current.updateField('name', 'John');
        result.current.updateField('email', 'john@example.com');
        result.current.updateField('age', 25);
      });

      expect(result.current.isValid).toBe(true);
    });
  });

  describe('제출 가능 여부', () => {
    it('모든 조건을 만족해야 제출 가능해야 한다', () => {
      const { result } = renderHook(() => useFormState(createDefaultOptions()));

      // 초기에는 제출 불가 (isDirty가 false)
      expect(result.current.canSubmit).toBe(false);

      // 필드 업데이트로 dirty 상태 만들기
      act(() => {
        result.current.updateField('name', 'John');
      });

      expect(result.current.canSubmit).toBe(true);

      // 로딩 중일 때 제출 불가
      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.canSubmit).toBe(false);

      act(() => {
        result.current.setLoading(false);
      });

      // 제출 중일 때 제출 불가
      act(() => {
        result.current.setSubmitting(true);
      });

      expect(result.current.canSubmit).toBe(false);
    });

    it('유효하지 않을 때 제출 불가해야 한다', () => {
      const validate = (): string[] => ['에러'];
      const { result } = renderHook(() => useFormState(createDefaultOptions({ validate })));

      act(() => {
        result.current.markDirty();
      });

      expect(result.current.isValid).toBe(false);
      expect(result.current.canSubmit).toBe(false);
    });
  });

  describe('handleSubmit', () => {
    it('성공적인 제출을 처리해야 한다', async () => {
      const mockSubmitFn = jest.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useFormState(createDefaultOptions()));

      // 더티 상태로 만들기
      act(() => {
        result.current.updateField('name', 'John');
      });

      const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent;

      await act(async () => {
        const submitHandler = result.current.handleSubmit(mockSubmitFn);
        await submitHandler(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockSubmitFn).toHaveBeenCalledWith(result.current.data);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isSubmitting).toBe(false);
    });

    it('제출 실패를 처리해야 한다', async () => {
      const errorMessage = '제출 실패';
      const mockSubmitFn = jest.fn().mockRejectedValue(new Error(errorMessage));
      const { result } = renderHook(() => useFormState(createDefaultOptions()));

      // 더티 상태로 만들기
      act(() => {
        result.current.updateField('name', 'John');
      });

      const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent;

      await act(async () => {
        const submitHandler = result.current.handleSubmit(mockSubmitFn);
        await submitHandler(mockEvent);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isSubmitting).toBe(false);
    });

    it('유효하지 않은 데이터로 제출 시 에러를 설정해야 한다', async () => {
      const validate = (data: TestFormData): string[] => (data.name ? [] : ['이름은 필수입니다']);
      const mockSubmitFn = jest.fn();
      const { result } = renderHook(() => useFormState(createDefaultOptions({ validate })));

      // 더티 상태로 만들기 (하지만 유효하지 않은 데이터)
      act(() => {
        result.current.markDirty();
      });

      const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent;

      await act(async () => {
        const submitHandler = result.current.handleSubmit(mockSubmitFn);
        await submitHandler(mockEvent);
      });

      expect(mockSubmitFn).not.toHaveBeenCalled();
      expect(result.current.error).toBe('이름은 필수입니다');
    });

    it('중복 제출을 방지해야 한다', async () => {
      const mockSubmitFn = jest
        .fn()
        .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      const { result } = renderHook(() =>
        useFormState(createDefaultOptions({ preventDuplicateSubmit: true })),
      );

      // 더티 상태로 만들기
      act(() => {
        result.current.updateField('name', 'John');
      });

      const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent;

      // 첫 번째 제출 시작 (완료되지 않음)
      act(() => {
        const submitHandler = result.current.handleSubmit(mockSubmitFn);
        submitHandler(mockEvent);
      });

      expect(result.current.isSubmitting).toBe(true);

      // 두 번째 제출 시도 (차단되어야 함)
      await act(async () => {
        const submitHandler = result.current.handleSubmit(mockSubmitFn);
        await submitHandler(mockEvent);
      });

      expect(mockSubmitFn).toHaveBeenCalledTimes(1); // 한 번만 호출
    });

    it('preventDuplicateSubmit이 false일 때 중복 제출을 허용해야 한다', async () => {
      const mockSubmitFn = jest.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useFormState(createDefaultOptions({ preventDuplicateSubmit: false })),
      );

      // 더티 상태로 만들기
      act(() => {
        result.current.updateField('name', 'John');
      });

      const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent;

      // 제출 중 상태로 설정
      act(() => {
        result.current.setSubmitting(true);
      });

      // 제출 시도 (허용되어야 함)
      await act(async () => {
        const submitHandler = result.current.handleSubmit(mockSubmitFn);
        await submitHandler(mockEvent);
      });

      expect(mockSubmitFn).toHaveBeenCalled();
    });
  });

  describe('resetOnSuccess 옵션', () => {
    it('resetOnSuccess가 true일 때 성공 시 폼이 초기화되어야 한다', () => {
      const initialData = { name: 'Initial', email: 'initial@example.com', age: 20 };
      const { result } = renderHook(() =>
        useFormState(createDefaultOptions({ initialData, resetOnSuccess: true })),
      );

      // 데이터 변경
      act(() => {
        result.current.updateField('name', 'Changed');
        result.current.markDirty();
      });

      expect(result.current.data.name).toBe('Changed');
      expect(result.current.isDirty).toBe(true);

      // 성공 상태 설정
      act(() => {
        result.current.setSuccess(true);
      });

      expect(result.current.data).toEqual(initialData);
      expect(result.current.isDirty).toBe(false);
    });

    it('resetOnSuccess가 false일 때 성공 시 폼이 초기화되지 않아야 한다', () => {
      const initialData = { name: 'Initial', email: 'initial@example.com', age: 20 };
      const { result } = renderHook(() =>
        useFormState(createDefaultOptions({ initialData, resetOnSuccess: false })),
      );

      // 데이터 변경
      act(() => {
        result.current.updateField('name', 'Changed');
        result.current.markDirty();
      });

      // 성공 상태 설정
      act(() => {
        result.current.setSuccess(true);
      });

      expect(result.current.data.name).toBe('Changed');
      expect(result.current.isDirty).toBe(true);
    });
  });

  describe('메모이제이션', () => {
    it('핸들러 함수들이 적절히 메모이제이션되어야 한다', () => {
      const { result, rerender } = renderHook(() => useFormState(createDefaultOptions()));

      const initialHandlers = {
        updateField: result.current.updateField,
        updateData: result.current.updateData,
        resetForm: result.current.resetForm,
        setLoading: result.current.setLoading,
        setSubmitting: result.current.setSubmitting,
        setError: result.current.setError,
        clearError: result.current.clearError,
        setSuccess: result.current.setSuccess,
        markDirty: result.current.markDirty,
      };

      // 상태가 변경되지 않으면 핸들러가 재사용됨
      rerender();

      expect(result.current.resetForm).toBe(initialHandlers.resetForm);
      expect(result.current.setLoading).toBe(initialHandlers.setLoading);
      expect(result.current.setSubmitting).toBe(initialHandlers.setSubmitting);
      expect(result.current.clearError).toBe(initialHandlers.clearError);
      expect(result.current.markDirty).toBe(initialHandlers.markDirty);
    });

    it('의존성이 변경되면 해당 핸들러가 재생성되어야 한다', () => {
      const { result } = renderHook(() => useFormState(createDefaultOptions()));

      const initialUpdateField = result.current.updateField;

      // error 상태 변경으로 updateField 의존성 변경
      act(() => {
        result.current.setError('에러');
      });

      expect(result.current.updateField).not.toBe(initialUpdateField);
    });
  });

  describe('계산된 값들', () => {
    it('hasError가 error 상태에 따라 올바르게 계산되어야 한다', () => {
      const { result } = renderHook(() => useFormState(createDefaultOptions()));

      expect(result.current.hasError).toBe(false);

      act(() => {
        result.current.setError('에러 메시지');
      });

      expect(result.current.hasError).toBe(true);

      act(() => {
        result.current.clearError();
      });

      expect(result.current.hasError).toBe(false);
    });

    it('canSubmit이 모든 조건을 올바르게 확인해야 한다', () => {
      const validate = (data: TestFormData): string[] => (data.name ? [] : ['이름 필수']);
      const { result } = renderHook(() => useFormState(createDefaultOptions({ validate })));

      // 초기에는 제출 불가 (isDirty가 false)
      expect(result.current.canSubmit).toBe(false);

      // 유효한 데이터로 변경하고 dirty 상태 만들기
      act(() => {
        result.current.updateField('name', 'John');
      });

      expect(result.current.canSubmit).toBe(true);

      // 로딩 중일 때
      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.canSubmit).toBe(false);

      act(() => {
        result.current.setLoading(false);
      });

      // 제출 중일 때
      act(() => {
        result.current.setSubmitting(true);
      });

      expect(result.current.canSubmit).toBe(false);

      act(() => {
        result.current.setSubmitting(false);
      });

      // 유효하지 않을 때
      act(() => {
        result.current.updateField('name', '');
      });

      expect(result.current.canSubmit).toBe(false);
    });
  });
});
