import React from 'react';
import { LoginRequest } from '../types/auth';
import { Button } from '@/components/common/Button';
import { FormContainer, FormInput } from '@/components/common/Form';
import { useLoginForm } from '../hooks/useAuthForm';
import { REGISTER_CONSTANTS } from '../constants/registerConstants';

interface LoginFormProps {
  onSubmit: (credentials: LoginRequest) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export function LoginForm({ onSubmit, isLoading: externalLoading = false }: LoginFormProps) {
  // 공통 Auth 폼 훅 사용
  const form = useLoginForm(async (data) => {
    await onSubmit({
      id: data.id.trim(),
      password: data.password,
    });
  });

  const isLoading = externalLoading || form.isSubmitting;

  // 에러 필터링 로직
  const getFilteredError = (errorKeyword: string) => {
    if (!form.hasError || !form.error) return undefined;
    return form.error.includes(errorKeyword) ? form.error : undefined;
  };

  // TypeScript exactOptionalPropertyTypes 호환성을 위한 헬퍼
  const buildFormInputProps = (baseProps: any, errorKeyword: string) => {
    const error = getFilteredError(errorKeyword);
    return error ? { ...baseProps, error } : baseProps;
  };

  return (
    <FormContainer onSubmit={form.submitWithErrorHandling} className="mobile-auth-form">
      <div className="form-group">
        <label className="form-label">ID</label>
        <FormInput
          {...buildFormInputProps(
            {
              id: 'login-id',
              label: '',
              type: 'text',
              value: form.data.id,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                form.updateField('id', e.target.value),
              placeholder: 'Enter ID',
              autoComplete: 'username',
              required: true,
            },
            REGISTER_CONSTANTS.ERROR_KEYWORDS.ID,
          )}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <FormInput
          {...buildFormInputProps(
            {
              id: 'login-password',
              label: '',
              type: 'password',
              value: form.data.password,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                form.updateField('password', e.target.value),
              placeholder: 'Enter Password',
              autoComplete: 'current-password',
              required: true,
            },
            REGISTER_CONSTANTS.ERROR_KEYWORDS.PASSWORD,
          )}
        />
      </div>

      <div className="checkbox-container">
        <input type="checkbox" id="remember-me" className="checkbox-input" />
        <label htmlFor="remember-me" className="checkbox-text">
          Remember me
        </label>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="large"
        fullWidth
        isLoading={isLoading}
        loadingText="Signing in..."
        disabled={!form.canSubmit || isLoading}
        className="auth-submit-button"
      >
        Login
      </Button>

    </FormContainer>
  );
}
