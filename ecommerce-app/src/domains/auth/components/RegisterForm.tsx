import { Button } from '@/components/common/Button';
import { FormContainer, FormInput, FormCheckbox } from '@/components/common/Form';
import React, { useState } from 'react';
import { RegisterFormData } from '../types/auth';
import { REGISTER_CONSTANTS } from '../constants/registerConstants';
import { ValidationError } from '@ecommerce/common';
import { useRegisterForm } from '../hooks/useAuthForm';

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<boolean>;
  isLoading?: boolean; // 외부에서 전달받는 로딩 상태
  isSubmitting?: boolean; // 멱등성 관련 제출 상태
}

export function RegisterForm({
  onSubmit,
  isLoading: externalLoading,
  isSubmitting,
}: RegisterFormProps) {
  const [agreeTerms, setAgreeTerms] = useState(false);

  // 공통 Auth 폼 훅 사용
  const form = useRegisterForm(async (data) => {
    if (!agreeTerms) {
      throw new ValidationError('이용약관에 동의해주세요.', { field: 'agreeTerms' });
    }

    const success = await onSubmit(data);
    if (success) {
      setAgreeTerms(false); // 약관 동의도 초기화
    }
  });

  // 외부 로딩 상태가 있으면 우선 사용, 없으면 내부 상태 사용
  const isFormLoading = externalLoading ?? form.isSubmitting;

  // 버튼 비활성화 조건: 로딩 중이거나 제출 중이거나 약관 미동의
  const isButtonDisabled = isFormLoading || isSubmitting || !agreeTerms || !form.canSubmit;

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
              id: 'register-id',
              label: '',
              type: 'text',
              value: form.data.id,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                form.updateField('id', e.target.value),
              placeholder: 'ID',
              required: true,
              autoComplete: 'username',
            },
            REGISTER_CONSTANTS.ERROR_KEYWORDS.ID,
          )}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Email</label>
        <FormInput
          {...buildFormInputProps(
            {
              id: 'register-email',
              label: '',
              type: 'email',
              value: form.data.email,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                form.updateField('email', e.target.value),
              placeholder: 'Email',
              required: true,
              autoComplete: 'email',
            },
            REGISTER_CONSTANTS.ERROR_KEYWORDS.EMAIL,
          )}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Name</label>
        <FormInput
          {...buildFormInputProps(
            {
              id: 'register-name',
              label: '',
              type: 'text',
              value: form.data.name,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                form.updateField('name', e.target.value),
              placeholder: 'Name',
              required: true,
              autoComplete: 'name',
            },
            REGISTER_CONSTANTS.ERROR_KEYWORDS.NAME,
          )}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <FormInput
          {...buildFormInputProps(
            {
              id: 'register-password',
              label: '',
              type: 'password',
              value: form.data.password,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                form.updateField('password', e.target.value),
              placeholder: 'Password',
              autoComplete: 'new-password',
              required: true,
            },
            REGISTER_CONSTANTS.ERROR_KEYWORDS.PASSWORD,
          )}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Confirm password</label>
        <FormInput
          {...buildFormInputProps(
            {
              id: 'register-confirm-password',
              label: '',
              type: 'password',
              value: form.data.confirmPassword,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                form.updateField('confirmPassword', e.target.value),
              placeholder: 'Confirm Password',
              autoComplete: 'new-password',
              required: true,
            },
            REGISTER_CONSTANTS.ERROR_KEYWORDS.CONFIRM,
          )}
        />
      </div>

      <FormCheckbox
        id="register-agree-terms"
        label={REGISTER_CONSTANTS.FORM_LABELS.AGREE_TERMS}
        checked={agreeTerms}
        onChange={(e) => setAgreeTerms(e.target.checked)}
        required
      />

      <Button
        type="submit"
        variant="primary"
        size="large"
        fullWidth
        isLoading={isFormLoading}
        disabled={isButtonDisabled}
        className="auth-submit-button"
      >
        {isFormLoading
          ? 'Creating account...'
          : 'Sign up'}
      </Button>
    </FormContainer>
  );
}
