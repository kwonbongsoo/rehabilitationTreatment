import { Button } from '@/components/common/Button';
import { FormActions, FormCheckbox, FormContainer, FormInput } from '@/components/common/Form';
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
    } catch (error) {
      // 에러를 다시 던지지 않음 - useRegisterForm에서 토스트로 처리됨
      // 폼 상태는 그대로 유지
    }
  });

  // 외부 로딩 상태가 있으면 우선 사용, 없으면 내부 상태 사용
  const isFormLoading = externalLoading ?? form.isSubmitting;

  // 버튼 비활성화 조건: 로딩 중이거나 제출 중이거나 약관 미동의
  const isButtonDisabled = isFormLoading || isSubmitting || !agreeTerms || !form.canSubmit;

  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormInput
        id="register-id"
        label="아이디"
        type="text"
        value={form.data.id}
        onChange={(e) => form.updateField('id', e.target.value)}
        placeholder="4자 이상 입력하세요"
        {...(form.hasError && form.error.includes('아이디') && { error: form.error })}
        required
      />

      <FormInput
        id="register-name"
        label="이름"
        type="text"
        value={form.data.name}
        onChange={(e) => form.updateField('name', e.target.value)}
        placeholder="이름을 입력하세요"
        {...(form.hasError && form.error.includes('이름') && { error: form.error })}
        required
      />

      <FormInput
        id="register-email"
        label="이메일"
        type="email"
        value={form.data.email}
        onChange={(e) => form.updateField('email', e.target.value)}
        placeholder="example@email.com"
        {...(form.hasError && form.error.includes('이메일') && { error: form.error })}
        required
      />

      <FormInput
        id="register-password"
        label="비밀번호"
        type="password"
        value={form.data.password}
        onChange={(e) => form.updateField('password', e.target.value)}
        placeholder="8자 이상 입력하세요"
        {...(form.hasError && form.error.includes('비밀번호') && { error: form.error })}
        required
      />

      <FormInput
        id="register-confirm-password"
        label="비밀번호 확인"
        type="password"
        value={form.data.confirmPassword}
        onChange={(e) => form.updateField('confirmPassword', e.target.value)}
        placeholder="비밀번호를 다시 입력하세요"
        {...(form.hasError && form.error.includes('확인') && { error: form.error })}
        required
      />

      <FormCheckbox
        id="agree-terms"
        label="이용약관 및 개인정보 처리방침에 동의합니다."
        checked={agreeTerms}
        onChange={(e) => setAgreeTerms(e.target.checked)}
        required
      />

      <FormActions>
        <Button
          type="submit"
          variant="primary"
          size="large"
          fullWidth
          isLoading={isFormLoading}
          disabled={isButtonDisabled}
        >
          {isFormLoading ? '처리 중...' : '회원가입'}
        </Button>
      </FormActions>
    </FormContainer>
  );
}
