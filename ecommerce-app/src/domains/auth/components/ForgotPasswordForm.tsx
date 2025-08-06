import { Button } from '@/components/common/Button';
import { FormContainer, FormInput } from '@/components/common/Form';
import { ForgotPasswordRequest } from '@/domains/auth/types/auth';
import { useFormState } from '@/hooks/useFormState';
import { ErrorHandler } from '@/utils/errorHandling';
import { NotificationManager } from '@/utils/notifications';
import { EmailValidator } from '@/utils/validation';
import { useState } from 'react';

interface ForgotPasswordFormProps {
  onSubmit: (request: ForgotPasswordRequest) => Promise<void>;
  isLoading?: boolean;
}

export function ForgotPasswordForm({
  onSubmit,
  isLoading: externalLoading = false,
}: ForgotPasswordFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useFormState<ForgotPasswordRequest>({
    initialData: { email: '' },
    validate: (data) => {
      const email = data.email.trim();
      const emailValidation = EmailValidator.validate(email);
      return emailValidation.isValid ? [] : emailValidation.errors;
    },
    preventDuplicateSubmit: true,
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit({ email: data.email.trim() });
      setIsSuccess(true);
      NotificationManager.showSuccess('비밀번호 재설정 이메일이 전송되었습니다.');
    } catch (error) {
      // 에러 처리 및 알림
      const standardError = ErrorHandler.handleFormError(error, '비밀번호 찾기');
      NotificationManager.showWarning(standardError.message);
    }
  });

  const isLoading = externalLoading || form.isSubmitting;

  // 성공 상태일 때는 성공 메시지 표시
  if (isSuccess) {
    return (
      <div style={{ padding: '20px' }}>
        <div
          style={{
            textAlign: 'center',
            background: '#d4edda',
            color: '#155724',
            padding: '20px',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 12px 0' }}>
            이메일이 전송되었습니다!
          </h3>
          <p>
            입력하신 이메일 주소로 비밀번호 재설정 링크를 전송했습니다.
            <br />
            이메일을 확인하시고 링크를 클릭하여 비밀번호를 재설정해주세요.
          </p>
          <p style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0' }}>
            <strong>{form.data.email}</strong>로 전송되었습니다.
          </p>
          <p style={{ fontSize: '12px', color: '#495057', lineHeight: '1.5', margin: '0' }}>
            이메일이 도착하지 않았다면 스팸 폴더를 확인해주세요.
            <br />몇 분 후에도 이메일이 오지 않으면 다시 시도해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <FormContainer onSubmit={handleSubmit} className="mobile-auth-form">
      <div className="form-group">
        <label className="form-label">Email</label>
        <FormInput
          id="forgot-password-email"
          label=""
          type="email"
          value={form.data.email}
          onChange={(e) => form.updateField('email', e.target.value)}
          placeholder="Enter email address"
          {...(form.hasError && { error: form.error })}
          required
          autoComplete="email"
          autoFocus
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="large"
        fullWidth
        isLoading={isLoading}
        disabled={!form.canSubmit || isLoading}
        className="auth-submit-button"
      >
        {isLoading ? 'Sending...' : 'Send Email'}
      </Button>
    </FormContainer>
  );
}
