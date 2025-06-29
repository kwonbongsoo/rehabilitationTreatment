'use client';

import { Button } from '@/components/common/Button';
import {
  FormActions,
  FormContainer,
  FormInput,
  FormSelect,
  FormTextarea,
} from '@/components/common/Form';
import { useFormState } from '@/hooks/useFormState';
import { ErrorHandler } from '@/utils/errorHandling';
import { NotificationManager } from '@/utils/notifications';
import React from 'react';
import { FiClock, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import styles from './page.module.css';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const form = useFormState<ContactFormData>({
    initialData: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
    validate: (data) => {
      const errors: string[] = [];
      if (!data.name.trim()) errors.push('이름을 입력해주세요.');
      if (!data.email.trim()) errors.push('이메일을 입력해주세요.');
      if (!data.subject) errors.push('문의 유형을 선택해주세요.');
      if (!data.message.trim()) errors.push('문의 내용을 입력해주세요.');
      return errors;
    },
    resetOnSuccess: true,
  });

  const handleSubmit = form.handleSubmit(async (_) => {
    try {
      NotificationManager.showSuccess(
        '문의가 성공적으로 전송되었습니다. 빠른 시일 내에 답변드리겠습니다.',
      );
    } catch (error) {
      // 에러 처리 및 알림
      const standardError = ErrorHandler.handleFormError(error, '문의 전송');
      NotificationManager.showWarning(standardError.message);
    }
  });

  const subjectOptions = [
    { value: '', label: '선택해주세요' },
    { value: 'order', label: '주문 관련' },
    { value: 'product', label: '상품 관련' },
    { value: 'shipping', label: '배송 관련' },
    { value: 'return', label: '교환/반품' },
    { value: 'other', label: '기타' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>문의하기</h1>
        <p className={styles.subtitle}>
          궁금한 사항이 있으시면 언제든지 연락주세요. 최대한 빠르게 답변드리겠습니다.
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.contactInfo}>
          <h2>연락처 정보</h2>

          <div className={styles.contactItem}>
            <FiPhone className={styles.icon} />
            <div>
              <h3>전화 문의</h3>
              <p>1588-0000</p>
              <p className={styles.note}>평일 09:00 - 18:00</p>
            </div>
          </div>

          <div className={styles.contactItem}>
            <FiMail className={styles.icon} />
            <div>
              <h3>이메일 문의</h3>
              <p>support@ecommerce.com</p>
              <p className={styles.note}>24시간 접수 가능</p>
            </div>
          </div>

          <div className={styles.contactItem}>
            <FiMapPin className={styles.icon} />
            <div>
              <h3>본사 주소</h3>
              <p>서울특별시 강남구 테헤란로 123</p>
              <p>ABC빌딩 10층</p>
            </div>
          </div>

          <div className={styles.contactItem}>
            <FiClock className={styles.icon} />
            <div>
              <h3>운영 시간</h3>
              <p>평일: 09:00 - 18:00</p>
              <p>주말 및 공휴일: 휴무</p>
            </div>
          </div>
        </div>

        <div className={styles.contactForm}>
          <h2>문의 양식</h2>
          <FormContainer onSubmit={handleSubmit}>
            <FormInput
              id="name"
              label="이름"
              type="text"
              value={form.data.name}
              onChange={(e) => form.updateField('name', e.target.value)}
              required
            />

            <FormInput
              id="email"
              label="이메일"
              type="email"
              value={form.data.email}
              onChange={(e) => form.updateField('email', e.target.value)}
              required
            />

            <FormInput
              id="phone"
              label="전화번호"
              type="tel"
              value={form.data.phone}
              onChange={(e) => form.updateField('phone', e.target.value)}
            />

            <FormSelect
              id="subject"
              label="문의 유형"
              value={form.data.subject}
              onChange={(e) => form.updateField('subject', e.target.value)}
              options={subjectOptions}
              required
            />

            <FormTextarea
              id="message"
              label="문의 내용"
              value={form.data.message}
              onChange={(e) => form.updateField('message', e.target.value)}
              placeholder="문의하실 내용을 자세히 적어주세요"
              rows={6}
              required
            />

            <FormActions>
              <Button
                type="submit"
                variant="primary"
                size="large"
                fullWidth
                disabled={!form.canSubmit}
              >
                {form.isSubmitting ? '전송 중...' : '문의 보내기'}
              </Button>
            </FormActions>

            {form.hasError && (
              <div style={{ color: 'red', marginTop: '1rem', textAlign: 'center' }}>
                {form.error}
              </div>
            )}
          </FormContainer>
        </div>
      </div>
    </div>
  );
}
