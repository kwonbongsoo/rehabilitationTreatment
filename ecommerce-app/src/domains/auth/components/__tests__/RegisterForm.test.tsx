import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { RegisterForm } from '../RegisterForm';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('@/domains/auth/hooks/useAuthForm', () => ({
  useRegisterForm: jest.fn(),
}));
jest.mock('@/utils/errorHandling');
jest.mock('@/utils/notifications');

const { useRegisterForm } = require('@/domains/auth/hooks/useAuthForm');
const mockErrorHandler = require('@/utils/errorHandling').ErrorHandler;
const mockNotificationManager = require('@/utils/notifications').NotificationManager;

describe('RegisterForm', () => {
  const mockOnSubmit = jest.fn();
  const mockFormReturn = {
    data: {
      id: '',
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
    },
    isSubmitting: false,
    hasError: false,
    error: '',
    canSubmit: false,
    updateField: jest.fn(),
    submitWithErrorHandling: jest.fn(),
    handleSubmit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useRegisterForm.mockReturnValue(mockFormReturn);
    mockNotificationManager.showSuccess = jest.fn();
    mockNotificationManager.showWarning = jest.fn();
    mockErrorHandler.handleFormError = jest.fn().mockReturnValue({
      message: 'Error occurred',
    });
  });

  it('renders all form fields correctly', () => {
    render(<RegisterForm onSubmit={mockOnSubmit} />);

    expect(screen.getByPlaceholderText('ID')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('disables submit button when terms are not agreed', () => {
    render(<RegisterForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when terms are agreed and form is valid', () => {
    useRegisterForm.mockReturnValue({
      ...mockFormReturn,
      canSubmit: true,
    });

    render(<RegisterForm onSubmit={mockOnSubmit} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('shows loading state when external loading is true', () => {
    render(<RegisterForm onSubmit={mockOnSubmit} isLoading={true} />);

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('shows loading state when form is submitting', () => {
    useRegisterForm.mockReturnValue({
      ...mockFormReturn,
      isSubmitting: true,
    });

    render(<RegisterForm onSubmit={mockOnSubmit} />);

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('throws validation error when terms are not agreed on submit', async () => {
    const mockSubmitHandler = jest.fn();
    useRegisterForm.mockImplementation((submitFn: (data: any) => void) => {
      mockSubmitHandler.mockImplementation(async (data) => {
        await submitFn(data);
      });
      return {
        ...mockFormReturn,
        handleSubmit: mockSubmitHandler,
      };
    });

    render(<RegisterForm onSubmit={mockOnSubmit} />);

    // Try to submit without agreeing to terms - should throw validation error
    await expect(
      mockSubmitHandler({
        id: '',
        email: '',
        name: '',
        password: '',
        confirmPassword: '',
      }),
    ).rejects.toThrow('이용약관에 동의해주세요.');
  });

  it('calls onSubmit when form is valid and terms are agreed', async () => {
    mockOnSubmit.mockResolvedValue(true);

    const mockSubmitHandler = jest.fn();
    useRegisterForm.mockImplementation((submitFn: (data: any) => void) => {
      mockSubmitHandler.mockImplementation(submitFn);
      return {
        ...mockFormReturn,
        canSubmit: true,
        handleSubmit: mockSubmitHandler,
      };
    });

    render(<RegisterForm onSubmit={mockOnSubmit} />);

    // Agree to terms
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // Submit form
    await mockSubmitHandler(mockFormReturn.data);

    expect(mockOnSubmit).toHaveBeenCalledWith(mockFormReturn.data);
  });

  it('resets terms agreement after successful submission', async () => {
    mockOnSubmit.mockResolvedValue(true);

    const mockSubmitHandler = jest.fn();
    useRegisterForm.mockImplementation((submitFn: (data: any) => Promise<void>) => {
      mockSubmitHandler.mockImplementation(async (data) => {
        await submitFn(data);
      });
      return {
        ...mockFormReturn,
        canSubmit: true,
        handleSubmit: mockSubmitHandler,
      };
    });

    render(<RegisterForm onSubmit={mockOnSubmit} />);

    // Agree to terms
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    // Simulate successful form submission
    await act(async () => {
      await mockSubmitHandler(mockFormReturn.data);
    });

    // After successful submission, checkbox should be unchecked
    expect(checkbox).not.toBeChecked();
  });

  it('displays error messages correctly', () => {
    useRegisterForm.mockReturnValue({
      ...mockFormReturn,
      hasError: true,
      error: 'ID already exists',
    });

    render(<RegisterForm onSubmit={mockOnSubmit} />);

    // Form should render with error state
    expect(screen.getByPlaceholderText('ID')).toBeInTheDocument();
  });

  it('updates form fields when user types', () => {
    render(<RegisterForm onSubmit={mockOnSubmit} />);

    const idInput = screen.getByPlaceholderText('ID');
    fireEvent.change(idInput, { target: { value: 'testuser' } });

    expect(mockFormReturn.updateField).toHaveBeenCalledWith('id', 'testuser');
  });
});
