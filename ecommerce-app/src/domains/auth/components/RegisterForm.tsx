import { Button } from '@/components/common/Button';
import { useFormState } from '@/hooks/useFormState';
import { authValidationService } from '@/domains/auth/services';
import { useState } from 'react';
import { RegisterFormData } from '../types/auth';

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

  const form = useFormState<RegisterFormData>({
    initialData: {
      id: '',
      password: '',
      confirmPassword: '',
      name: '',
      email: '',
    },
    validate: (data) => authValidationService.validateRegisterForm(data).errors,
    resetOnSuccess: true,
    preventDuplicateSubmit: true,
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!agreeTerms) {
      throw new Error('이용약관에 동의해주세요.');
    }

    // useRegisterForm에서 모든 성공/에러 처리를 담당하므로 여기서는 단순히 호출만
    // 에러가 발생해도 폼 상태에 영향을 주지 않도록 에러를 다시 던지지 않음
    try {
      const success = await onSubmit(data);
      if (success) {
        setAgreeTerms(false); // 약관 동의도 초기화
      }
    } catch {
      // 에러를 다시 던지지 않음 - useRegisterForm에서 토스트로 처리됨
      // 폼 상태는 그대로 유지
    }
  });

  // 외부 로딩 상태가 있으면 우선 사용, 없으면 내부 상태 사용
  const isFormLoading = externalLoading ?? form.isSubmitting;

  // 버튼 비활성화 조건: 로딩 중이거나 제출 중이거나 약관 미동의
  const isButtonDisabled = isFormLoading || isSubmitting || !agreeTerms || !form.canSubmit;

  return (
    <form onSubmit={handleSubmit} className="mobile-auth-form">
      <div className="form-group">
        <input
          id="register-id"
          type="text"
          value={form.data.id}
          onChange={(e) => form.updateField('id', e.target.value)}
          placeholder="Username"
          className="form-input"
          required
        />
        {form.hasError && form.error.includes('아이디') && (
          <span className="error-text">{form.error}</span>
        )}
      </div>

      <div className="form-group">
        <input
          id="register-name"
          type="text"
          value={form.data.name}
          onChange={(e) => form.updateField('name', e.target.value)}
          placeholder="Name"
          className="form-input"
          required
        />
        {form.hasError && form.error.includes('이름') && (
          <span className="error-text">{form.error}</span>
        )}
      </div>

      <div className="form-group">
        <input
          id="register-email"
          type="email"
          value={form.data.email}
          onChange={(e) => form.updateField('email', e.target.value)}
          placeholder="Email"
          className="form-input"
          required
        />
        {form.hasError && form.error.includes('이메일') && (
          <span className="error-text">{form.error}</span>
        )}
      </div>

      <div className="form-group">
        <input
          id="register-password"
          type="password"
          value={form.data.password}
          onChange={(e) => form.updateField('password', e.target.value)}
          placeholder="Password"
          className="form-input"
          required
        />
        {form.hasError && form.error.includes('비밀번호') && (
          <span className="error-text">{form.error}</span>
        )}
      </div>

      <div className="form-group">
        <input
          id="register-confirm-password"
          type="password"
          value={form.data.confirmPassword}
          onChange={(e) => form.updateField('confirmPassword', e.target.value)}
          placeholder="Confirm Password"
          className="form-input"
          required
        />
        {form.hasError && form.error.includes('확인') && (
          <span className="error-text">{form.error}</span>
        )}
      </div>

      <div className="form-group">
        <label className="checkbox-container">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="checkbox-input"
          />
          <span className="checkbox-text">Agree with Terms & Condition</span>
        </label>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="large"
        fullWidth
        isLoading={isFormLoading}
        disabled={isButtonDisabled}
        className="auth-submit-button"
      >
        {isFormLoading ? 'Creating...' : 'Sign up'}
      </Button>
    </form>
  );
}
