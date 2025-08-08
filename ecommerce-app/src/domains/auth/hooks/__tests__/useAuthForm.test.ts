/**
 * useAuthForm 훅 테스트
 *
 * Auth 공통 폼 훅의 타입 안전성, 검증 로직, 에러 처리를 테스트합니다.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuthForm, useLoginForm, useRegisterForm, useForgotPasswordForm } from '../useAuthForm';
import { authValidationService } from '../../services';
import { ValidationError } from '@ecommerce/common';

// Mock dependencies
jest.mock('../../services', () => ({
  authValidationService: {
    validateLoginCredentials: jest.fn(),
    validateRegisterForm: jest.fn(),
    validateForgotPasswordForm: jest.fn(),
  },
}));

jest.mock('@/hooks/useFormState', () => ({
  useFormState: jest.fn(),
}));

const mockAuthValidationService = authValidationService as jest.Mocked<typeof authValidationService>;

// useFormState mock implementation
const mockUseFormState = require('@/hooks/useFormState').useFormState as jest.MockedFunction<any>;

describe('useAuthForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // useFormState 기본 mock 구현
    mockUseFormState.mockReturnValue({
      formData: { id: '', password: '' },
      errors: {},
      isLoading: false,
      isDirty: false,
      isValid: true,
      handleChange: jest.fn(),
      handleBlur: jest.fn(),
      handleSubmit: jest.fn((callback) => async (e) => {
        e?.preventDefault?.();
        await callback({ id: 'test', password: 'test123' });
      }),
      reset: jest.fn(),
      setFieldError: jest.fn(),
      clearFieldError: jest.fn(),
      validate: jest.fn(),
    });
  });

  describe('기본 기능', () => {
    it('올바른 초기 옵션으로 useFormState를 호출해야 한다', () => {
      const options = {
        type: 'login' as const,
        initialData: { id: '', password: '' },
        onSubmit: mockOnSubmit,
        preventDuplicateSubmit: true,
        resetOnSuccess: false,
      };

      renderHook(() => useAuthForm(options));

      expect(mockUseFormState).toHaveBeenCalledWith({
        initialData: { id: '', password: '' },
        validate: expect.any(Function),
        preventDuplicateSubmit: true,
        resetOnSuccess: false,
      });
    });

    it('폼 상태와 submitWithErrorHandling을 반환해야 한다', () => {
      const options = {
        type: 'login' as const,
        initialData: { id: '', password: '' },
        onSubmit: mockOnSubmit,
      };

      const { result } = renderHook(() => useAuthForm(options));

      expect(result.current).toEqual({
        formData: { id: '', password: '' },
        errors: {},
        isLoading: false,
        isDirty: false,
        isValid: true,
        handleChange: expect.any(Function),
        handleBlur: expect.any(Function),
        handleSubmit: expect.any(Function),
        reset: expect.any(Function),
        setFieldError: expect.any(Function),
        clearFieldError: expect.any(Function),
        validate: expect.any(Function),
        submitWithErrorHandling: expect.any(Function),
      });
    });
  });

  describe('검증 로직', () => {
    it('로그인 타입에 대해 올바른 검증 함수를 호출해야 한다', () => {
      mockAuthValidationService.validateLoginCredentials.mockReturnValue({
        isValid: true,
        errors: [],
      });

      const options = {
        type: 'login' as const,
        initialData: { id: '', password: '' },
        onSubmit: mockOnSubmit,
      };

      renderHook(() => useAuthForm(options));

      // useFormState의 validate 함수 호출
      const validateCall = mockUseFormState.mock.calls[0][0];
      const testData = { id: 'test', password: 'test123' };
      
      validateCall.validate(testData);

      expect(mockAuthValidationService.validateLoginCredentials).toHaveBeenCalledWith(testData);
    });

    it('회원가입 타입에 대해 올바른 검증 함수를 호출해야 한다', () => {
      mockAuthValidationService.validateRegisterForm.mockReturnValue({
        isValid: true,
        errors: [],
      });

      const options = {
        type: 'register' as const,
        initialData: { id: '', password: '', confirmPassword: '', name: '', email: '' },
        onSubmit: mockOnSubmit,
      };

      renderHook(() => useAuthForm(options));

      const validateCall = mockUseFormState.mock.calls[0][0];
      const testData = { id: 'test', password: 'test123', confirmPassword: 'test123', name: 'Test', email: 'test@test.com' };
      
      validateCall.validate(testData);

      expect(mockAuthValidationService.validateRegisterForm).toHaveBeenCalledWith(testData);
    });

    it('비밀번호 찾기 타입에 대해 올바른 검증 함수를 호출해야 한다', () => {
      mockAuthValidationService.validateForgotPasswordForm.mockReturnValue({
        isValid: true,
        errors: [],
      });

      const options = {
        type: 'forgotPassword' as const,
        initialData: { email: '' },
        onSubmit: mockOnSubmit,
      };

      renderHook(() => useAuthForm(options));

      const validateCall = mockUseFormState.mock.calls[0][0];
      const testData = { email: 'test@test.com' };
      
      validateCall.validate(testData);

      expect(mockAuthValidationService.validateForgotPasswordForm).toHaveBeenCalledWith(testData);
    });

    it('검증 에러를 올바르게 반환해야 한다', () => {
      const mockErrors = ['아이디를 입력하세요', '비밀번호를 입력하세요'];
      mockAuthValidationService.validateLoginCredentials.mockReturnValue({
        isValid: false,
        errors: mockErrors,
      });

      const options = {
        type: 'login' as const,
        initialData: { id: '', password: '' },
        onSubmit: mockOnSubmit,
      };

      renderHook(() => useAuthForm(options));

      const validateCall = mockUseFormState.mock.calls[0][0];
      const result = validateCall.validate({ id: '', password: '' });

      expect(result).toEqual(mockErrors);
    });
  });

  describe('에러 처리', () => {
    it('성공적인 제출을 처리해야 한다', async () => {
      mockOnSubmit.mockResolvedValue(undefined);

      const options = {
        type: 'login' as const,
        initialData: { id: '', password: '' },
        onSubmit: mockOnSubmit,
      };

      const { result } = renderHook(() => useAuthForm(options));

      await act(async () => {
        const mockEvent = { preventDefault: jest.fn() };
        await result.current.submitWithErrorHandling(mockEvent as any);
      });

      expect(mockOnSubmit).toHaveBeenCalledWith({ id: 'test', password: 'test123' });
    });

    it('ValidationError를 다시 던져야 한다', async () => {
      const validationError = new ValidationError('검증 실패', 'validation_error', {
        field: 'id',
        value: 'invalid',
      });

      // handleSubmit mock이 ValidationError를 던지도록 수정
      mockUseFormState.mockReturnValue({
        formData: { id: '', password: '' },
        errors: {},
        isLoading: false,
        isDirty: false,
        isValid: true,
        handleChange: jest.fn(),
        handleBlur: jest.fn(),
        handleSubmit: jest.fn(() => async (e) => {
          e?.preventDefault?.();
          throw validationError;
        }),
        reset: jest.fn(),
        setFieldError: jest.fn(),
        clearFieldError: jest.fn(),
        validate: jest.fn(),
      });

      const options = {
        type: 'login' as const,
        initialData: { id: '', password: '' },
        onSubmit: mockOnSubmit,
      };

      const { result } = renderHook(() => useAuthForm(options));

      await expect(async () => {
        await act(async () => {
          const mockEvent = { preventDefault: jest.fn() };
          await result.current.submitWithErrorHandling(mockEvent as any);
        });
      }).rejects.toThrow(validationError);
    });

    it('일반 에러를 조용히 처리해야 한다', async () => {
      const generalError = new Error('서버 에러');
      mockOnSubmit.mockRejectedValue(generalError);

      const options = {
        type: 'login' as const,
        initialData: { id: '', password: '' },
        onSubmit: mockOnSubmit,
      };

      const { result } = renderHook(() => useAuthForm(options));

      await act(async () => {
        const mockEvent = { preventDefault: jest.fn() };
        await result.current.submitWithErrorHandling(mockEvent as any);
      });

      // 일반 에러는 조용히 처리되므로 throw되지 않음
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });
});

describe('useLoginForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFormState.mockReturnValue({
      formData: { id: '', password: '' },
      errors: {},
      isLoading: false,
      isDirty: false,
      isValid: true,
      handleChange: jest.fn(),
      handleBlur: jest.fn(),
      handleSubmit: jest.fn(),
      reset: jest.fn(),
      setFieldError: jest.fn(),
      clearFieldError: jest.fn(),
      validate: jest.fn(),
      submitWithErrorHandling: jest.fn(),
    });
  });

  it('올바른 타입과 초기 데이터로 useAuthForm을 호출해야 한다', () => {
    renderHook(() => useLoginForm(mockOnSubmit));

    expect(mockUseFormState).toHaveBeenCalledWith({
      initialData: { id: '', password: '' },
      validate: expect.any(Function),
      preventDuplicateSubmit: true,
      resetOnSuccess: false,
    });
  });

  it('추가 옵션을 올바르게 전달해야 한다', () => {
    const options = { resetOnSuccess: true, preventDuplicateSubmit: false };
    
    renderHook(() => useLoginForm(mockOnSubmit, options));

    expect(mockUseFormState).toHaveBeenCalledWith({
      initialData: { id: '', password: '' },
      validate: expect.any(Function),
      preventDuplicateSubmit: false,
      resetOnSuccess: true,
    });
  });
});

describe('useRegisterForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFormState.mockReturnValue({
      formData: { id: '', password: '', confirmPassword: '', name: '', email: '' },
      errors: {},
      isLoading: false,
      isDirty: false,
      isValid: true,
      handleChange: jest.fn(),
      handleBlur: jest.fn(),
      handleSubmit: jest.fn(),
      reset: jest.fn(),
      setFieldError: jest.fn(),
      clearFieldError: jest.fn(),
      validate: jest.fn(),
      submitWithErrorHandling: jest.fn(),
    });
  });

  it('올바른 타입과 초기 데이터로 useAuthForm을 호출해야 한다', () => {
    renderHook(() => useRegisterForm(mockOnSubmit));

    expect(mockUseFormState).toHaveBeenCalledWith({
      initialData: { id: '', password: '', confirmPassword: '', name: '', email: '' },
      validate: expect.any(Function),
      preventDuplicateSubmit: true,
      resetOnSuccess: true, // 회원가입은 기본적으로 성공 시 초기화
    });
  });

  it('추가 옵션을 올바르게 전달해야 한다', () => {
    const options = { resetOnSuccess: false };
    
    renderHook(() => useRegisterForm(mockOnSubmit, options));

    expect(mockUseFormState).toHaveBeenCalledWith({
      initialData: { id: '', password: '', confirmPassword: '', name: '', email: '' },
      validate: expect.any(Function),
      preventDuplicateSubmit: true,
      resetOnSuccess: false,
    });
  });
});

describe('useForgotPasswordForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFormState.mockReturnValue({
      formData: { email: '' },
      errors: {},
      isLoading: false,
      isDirty: false,
      isValid: true,
      handleChange: jest.fn(),
      handleBlur: jest.fn(),
      handleSubmit: jest.fn(),
      reset: jest.fn(),
      setFieldError: jest.fn(),
      clearFieldError: jest.fn(),
      validate: jest.fn(),
      submitWithErrorHandling: jest.fn(),
    });
  });

  it('올바른 타입과 초기 데이터로 useAuthForm을 호출해야 한다', () => {
    renderHook(() => useForgotPasswordForm(mockOnSubmit));

    expect(mockUseFormState).toHaveBeenCalledWith({
      initialData: { email: '' },
      validate: expect.any(Function),
      preventDuplicateSubmit: true,
      resetOnSuccess: false,
    });
  });

  it('추가 옵션을 올바르게 전달해야 한다', () => {
    const options = { resetOnSuccess: true };
    
    renderHook(() => useForgotPasswordForm(mockOnSubmit, options));

    expect(mockUseFormState).toHaveBeenCalledWith({
      initialData: { email: '' },
      validate: expect.any(Function),
      preventDuplicateSubmit: true,
      resetOnSuccess: true,
    });
  });
});