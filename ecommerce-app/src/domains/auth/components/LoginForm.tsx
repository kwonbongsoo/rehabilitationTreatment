import { LoginRequest } from '../types/auth';
import { Button } from '@/components/common/Button';
import { FormActions, FormContainer, FormInput } from '@/components/common/Form';
import { useFormState } from '@/hooks/useFormState';
import { validateLoginForm } from '@/utils/validation';

interface LoginFormProps {
  onSubmit: (credentials: LoginRequest) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

interface LoginFormData {
  id: string;
  password: string;
}

export function LoginForm({ onSubmit, isLoading: externalLoading = false }: LoginFormProps) {
  const form = useFormState<LoginFormData>({
    initialData: { id: '', password: '' },
    validate: (data) => validateLoginForm(data).errors,
    preventDuplicateSubmit: true,
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    // useLoginForm에서 모든 성공/에러 처리를 담당하므로 여기서는 단순히 호출만
    // 에러가 발생해도 폼 상태에 영향을 주지 않도록 에러를 다시 던지지 않음
    try {
      await onSubmit({
        id: data.id.trim(),
        password: data.password,
      });
    } catch (error) {
      // 에러를 다시 던지지 않음 - useLoginForm에서 토스트로 처리됨
      // 폼 상태는 그대로 유지
    }
  });

  const isLoading = externalLoading || form.isSubmitting;

  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormInput
        id="login-id"
        label="아이디"
        type="text"
        value={form.data.id}
        onChange={(e) => form.updateField('id', e.target.value)}
        placeholder="아이디를 입력하세요"
        error={form.hasError && form.error.includes('아이디') ? form.error : ''}
        required
      />

      <FormInput
        id="login-password"
        label="비밀번호"
        type="password"
        value={form.data.password}
        onChange={(e) => form.updateField('password', e.target.value)}
        placeholder="비밀번호를 입력하세요"
        error={form.hasError && form.error.includes('비밀번호') ? form.error : ''}
        required
      />

      <FormActions>
        <Button
          type="submit"
          variant="primary"
          size="large"
          fullWidth
          isLoading={isLoading}
          loadingText="로그인 중..."
          disabled={!form.canSubmit || isLoading}
        >
          로그인
        </Button>
      </FormActions>
    </FormContainer>
  );
}
