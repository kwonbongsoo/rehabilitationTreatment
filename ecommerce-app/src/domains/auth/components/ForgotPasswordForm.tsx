import { Button } from '@/components/common/Button';
import { FormActions, FormContainer, FormInput } from '@/components/common/Form';
import { ForgotPasswordRequest } from '@/domains/auth/types/auth';
import { useFormState } from '@/hooks/useFormState';
// import styles from '@/styles/auth/Form.module.css';
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
        <div style={{ textAlign: 'center', background: '#d4edda', color: '#155724', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 12px 0' }}>이메일이 전송되었습니다!</h3>
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
    <FormContainer onSubmit={handleSubmit}>
      <div style={{ marginBottom: '20px' }}>
        <p>
          비밀번호를 재설정하려면 가입 시 사용한 이메일 주소를 입력해주세요.
          <br />
          재설정 링크를 이메일로 보내드립니다.
        </p>
      </div>

      <FormInput
        id="forgot-password-email"
        label="이메일 주소"
        type="email"
        value={form.data.email}
        onChange={(e) => form.updateField('email', e.target.value)}
        placeholder="example@email.com"
        {...(form.hasError && { error: form.error })}
        required
        autoComplete="email"
        autoFocus
      />

      <FormActions>
        <Button
          type="submit"
          variant="primary"
          size="large"
          fullWidth
          isLoading={isLoading}
          disabled={!form.canSubmit || isLoading}
        >
          {isLoading ? '전송 중...' : '비밀번호 재설정 링크 보내기'}
        </Button>
      </FormActions>

      <div style={{ marginTop: '16px' }}>
        <p>
          • 이메일 전송까지 몇 분이 소요될 수 있습니다
          <br />
          • 스팸 폴더도 함께 확인해주세요
          <br />• 가입한 이메일 주소가 기억나지 않으시면 고객센터로 문의해주세요
        </p>
      </div>
    </FormContainer>
  );
}
