import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ForgotPasswordForm } from '../ForgotPasswordForm';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('@/hooks/useFormState');
jest.mock('@/utils/errorHandling');
jest.mock('@/utils/notifications');
jest.mock('@/utils/validation');

const mockUseFormState = require('@/hooks/useFormState').useFormState as jest.Mock;
const mockErrorHandler = require('@/utils/errorHandling').ErrorHandler;
const mockNotificationManager = require('@/utils/notifications').NotificationManager;
const mockEmailValidator = require('@/utils/validation').EmailValidator;

describe('ForgotPasswordForm', () => {
  const mockOnSubmit = jest.fn();
  const mockFormState = {
    data: { email: '' },
    isSubmitting: false,
    hasError: false,
    error: '',
    canSubmit: false,
    updateField: jest.fn(),
    handleSubmit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFormState.mockReturnValue(mockFormState);
    mockNotificationManager.showSuccess = jest.fn();
    mockNotificationManager.showWarning = jest.fn();
    mockErrorHandler.handleFormError = jest.fn().mockReturnValue({
      message: 'Error occurred',
    });
    mockEmailValidator.validate = jest.fn().mockReturnValue({
      isValid: true,
      errors: [],
    });

    // Trigger validate function call during useFormState initialization
    mockUseFormState.mockImplementation((config) => {
      if (config.validate) {
        config.validate({ email: '' });
      }
      return mockFormState;
    });
  });

  it('renders email input and submit button', () => {
    render(<ForgotPasswordForm onSubmit={mockOnSubmit} />);

    expect(screen.getByPlaceholderText('Enter email address')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send email/i })).toBeInTheDocument();
  });

  it('validates email on form submission', () => {
    render(<ForgotPasswordForm onSubmit={mockOnSubmit} />);

    // EmailValidator should be called during form initialization
    expect(mockEmailValidator.validate).toHaveBeenCalledWith('');
  });

  it('shows loading state when external loading is true', () => {
    render(<ForgotPasswordForm onSubmit={mockOnSubmit} isLoading={true} />);

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading state when form is submitting', () => {
    mockUseFormState.mockReturnValue({
      ...mockFormState,
      isSubmitting: true,
    });

    render(<ForgotPasswordForm onSubmit={mockOnSubmit} />);

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('disables submit button when form cannot be submitted', () => {
    mockUseFormState.mockReturnValue({
      ...mockFormState,
      canSubmit: false,
    });

    render(<ForgotPasswordForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button');
    expect(submitButton).toBeDisabled();
  });

  it('shows success message after successful submission', async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    const mockHandleSubmit = jest.fn((callback) => {
      callback({ email: 'test@example.com' });
    });
    mockUseFormState.mockReturnValue({
      ...mockFormState,
      data: { email: 'test@example.com' },
      handleSubmit: mockHandleSubmit,
    });

    render(<ForgotPasswordForm onSubmit={mockOnSubmit} />);

    // Simulate form submission
    const submitButton = screen.getByRole('button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('이메일이 전송되었습니다!')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    expect(mockNotificationManager.showSuccess).toHaveBeenCalledWith(
      '비밀번호 재설정 이메일이 전송되었습니다.',
    );
  });

  it('handles submission errors correctly', async () => {
    const error = new Error('Network error');
    mockOnSubmit.mockRejectedValue(error);

    const mockHandleSubmit = jest.fn((callback) => {
      callback({ email: 'test@example.com' });
    });
    mockUseFormState.mockReturnValue({
      ...mockFormState,
      data: { email: 'test@example.com' },
      handleSubmit: mockHandleSubmit,
    });

    render(<ForgotPasswordForm onSubmit={mockOnSubmit} />);

    // Simulate form submission
    const submitButton = screen.getByRole('button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockErrorHandler.handleFormError).toHaveBeenCalledWith(error, '비밀번호 찾기');
    });

    await waitFor(() => {
      expect(mockNotificationManager.showWarning).toHaveBeenCalledWith('Error occurred');
    });
  });

  it('updates email field when user types', () => {
    render(<ForgotPasswordForm onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByPlaceholderText('Enter email address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(mockFormState.updateField).toHaveBeenCalledWith('email', 'test@example.com');
  });

  it('trims email before submission', async () => {
    const mockHandleSubmit = jest.fn((callback) => {
      callback({ email: '  test@example.com  ' });
    });
    mockUseFormState.mockReturnValue({
      ...mockFormState,
      handleSubmit: mockHandleSubmit,
    });

    render(<ForgotPasswordForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
    });
  });
});
