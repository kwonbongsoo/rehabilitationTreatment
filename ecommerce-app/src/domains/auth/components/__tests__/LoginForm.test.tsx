import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { LoginForm } from '../LoginForm';
import { jest, describe, beforeEach, it } from '@jest/globals';
import type { LoginRequest } from '../../types/auth';

// Override expect to support jest-dom matchers
const expect = (actual: any) => (global as any).expect(actual);

// Create mock functions first
const mockValidateLoginForm = jest.fn();
const mockUseFormState = jest.fn();

// Mock dependencies with immediate return values
jest.mock('@/utils/validation', () => ({
  validateLoginForm: mockValidateLoginForm,
}));

jest.mock('@/hooks/useFormState', () => ({
  useFormState: mockUseFormState,
}));

describe('LoginForm', () => {
  const mockOnSubmit = jest
    .fn<(credentials: LoginRequest) => Promise<void>>()
    .mockResolvedValue(undefined);

  // Mock form state
  const mockFormState = {
    data: { id: '', password: '' },
    isLoading: false,
    isSubmitting: false,
    error: '',
    hasError: false,
    isSuccess: false,
    isDirty: false,
    isValid: true,
    canSubmit: true,
    updateField: jest.fn(),
    updateData: jest.fn(),
    resetForm: jest.fn(),
    setLoading: jest.fn(),
    setSubmitting: jest.fn(),
    setError: jest.fn(),
    clearError: jest.fn(),
    setSuccess: jest.fn(),
    markDirty: jest.fn(),
    handleSubmit: jest.fn(() => jest.fn()),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock validateLoginForm to return errors array
    mockValidateLoginForm.mockReturnValue({
      isValid: true,
      errors: [],
    });

    // Mock useFormState to return form state
    mockUseFormState.mockReturnValue(mockFormState);
  });

  describe('렌더링', () => {
    it('로그인 폼이 올바르게 렌더링된다', () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      // 실제 컴포넌트는 placeholder를 사용하므로 placeholder로 찾기
      expect(screen.getByPlaceholderText('Enter ID')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    });

    it('ID 입력 필드가 올바른 속성을 가진다', () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const idInput = screen.getByPlaceholderText('Enter ID');
      expect(idInput).toHaveAttribute('type', 'text');
      expect(idInput).toHaveAttribute('id', 'login-id');
      expect(idInput).toHaveAttribute('placeholder', 'Enter ID');
      expect(idInput).toHaveAttribute('required');
    });

    it('비밀번호 입력 필드가 올바른 속성을 가진다', () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const passwordInput = screen.getByPlaceholderText('Enter Password');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('id', 'login-password');
      expect(passwordInput).toHaveAttribute('placeholder', 'Enter Password');
      expect(passwordInput).toHaveAttribute('required');
    });

    it('로그인 버튼이 올바른 속성을 가진다', () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: 'Login' });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('폼 상태 관리', () => {
    it('컴포넌트가 에러 없이 렌더링된다', () => {
      expect(() => {
        render(<LoginForm onSubmit={mockOnSubmit} />);
      }).not.toThrow();
    });
  });

  describe('로딩 상태', () => {
    it('외부 로딩 상태가 true일 때 로그인 버튼이 비활성화된다', () => {
      render(<LoginForm onSubmit={mockOnSubmit} isLoading={true} />);

      expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled();
    });

    it('제출 중일 때 로그인 버튼이 비활성화된다', () => {
      mockUseFormState.mockReturnValue({
        ...mockFormState,
        isSubmitting: true,
      });

      render(<LoginForm onSubmit={mockOnSubmit} />);

      expect(screen.getByRole('button', { name: 'Login' })).toBeDisabled();
    });

    it('제출할 수 없을 때 로그인 버튼이 비활성화된다', () => {
      mockUseFormState.mockReturnValue({
        ...mockFormState,
        canSubmit: false,
      });

      render(<LoginForm onSubmit={mockOnSubmit} />);

      expect(screen.getByRole('button', { name: 'Login' })).toBeDisabled();
    });
  });

  describe('접근성', () => {
    it('모든 입력 필드에 적절한 ID가 설정되어 있다', () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const idInput = screen.getByPlaceholderText('Enter ID');
      const passwordInput = screen.getByPlaceholderText('Enter Password');

      expect(idInput).toHaveAttribute('id', 'login-id');
      expect(passwordInput).toHaveAttribute('id', 'login-password');
    });

    it('필수 입력 필드에 required 속성이 설정되어 있다', () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      expect(screen.getByPlaceholderText('Enter ID')).toHaveAttribute('required');
      expect(screen.getByPlaceholderText('Enter Password')).toHaveAttribute('required');
    });

    it('로그인 버튼이 폼 제출 타입을 가진다', () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      expect(screen.getByRole('button', { name: 'Login' })).toHaveAttribute('type', 'submit');
    });

    it('로그인 상태 유지 체크박스가 올바르게 렌더링된다', () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const checkbox = screen.getByTestId('remember-me');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('id', 'remember-me');
    });
  });
});
