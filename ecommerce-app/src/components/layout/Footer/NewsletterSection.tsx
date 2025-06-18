import React from 'react';
import { useFormState } from '@/hooks/useFormState';
import { EmailValidator } from '@/utils/validation';
import { ErrorHandler } from '@/utils/errorHandling';
import { NotificationManager } from '@/utils/notifications';
import { FormContainer, FormInput, FormCheckbox } from '@/components/common/Form';
import { Button } from '@/components/common/Button';
import styles from '@/styles/layout/Footer/NewsletterSection.module.css';

interface NewsletterFormData {
  email: string;
  agreeToMarketing: boolean;
}

const NewsletterSection: React.FC = () => {
  const form = useFormState<NewsletterFormData>({
    initialData: {
      email: '',
      agreeToMarketing: false,
    },
    validate: (data) => {
      const errors: string[] = [];
      const emailValidation = EmailValidator.validate(data.email);
      if (!emailValidation.isValid) {
        errors.push(...emailValidation.errors);
      }
      if (!data.agreeToMarketing) {
        errors.push('개인정보 수집 및 마케팅 정보 수신에 동의해주세요.');
      }
      return errors;
    },
    resetOnSuccess: true,
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      // 실제 API 호출 로직이 들어갈 곳
      await new Promise((resolve) => setTimeout(resolve, 500)); // 모의 API 호출

      NotificationManager.showSuccess(
        '뉴스레터 구독이 완료되었습니다. 신상품 소식을 먼저 받아보세요!',
      );
      console.log('Newsletter subscription:', data);
    } catch (error) {
      // 에러 처리 및 알림
      const standardError = ErrorHandler.handleFormError(error, '뉴스레터 구독');
      NotificationManager.showWarning(standardError.message);
    }
  });

  return (
    <div className={styles.newsletterSection}>
      <h3>SHOP의 소식을 먼저 받아보세요</h3>
      <p>신상품 소식, 특별 프로모션, 스타일 팁을 받아보세요.</p>

      <FormContainer onSubmit={handleSubmit} className={styles.newsletterForm}>
        <div className={styles.inputGroup}>
          <FormInput
            id="newsletter-email"
            label=""
            type="email"
            value={form.data.email}
            onChange={(e) => form.updateField('email', e.target.value)}
            placeholder="이메일 주소"
            className={styles.emailInput}
            required
          />
          <Button
            type="submit"
            variant="primary"
            size="medium"
            isLoading={form.isSubmitting}
            disabled={!form.canSubmit}
            className={styles.subscribeButton}
          >
            {form.isSubmitting ? '구독 중...' : '구독하기'}
          </Button>
        </div>

        <FormCheckbox
          id="newsletter-agree"
          label="개인정보 수집 및 마케팅 정보 수신에 동의합니다."
          checked={form.data.agreeToMarketing}
          onChange={(e) => form.updateField('agreeToMarketing', e.target.checked)}
          className={styles.checkboxLabel}
          required
        />

        {form.hasError && <div className={styles.errorMessage}>{form.error}</div>}
      </FormContainer>
    </div>
  );
};

export default NewsletterSection;
