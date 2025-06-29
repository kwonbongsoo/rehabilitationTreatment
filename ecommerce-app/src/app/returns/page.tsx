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
import React, { useState } from 'react';
import styles from './page.module.css';

interface ReturnFormData {
  orderNumber: string;
  reason: string;
  details: string;
}

export default function Returns() {
  const [activeTab, setActiveTab] = useState<'policy' | 'process' | 'info'>('policy');

  const returnForm = useFormState<ReturnFormData>({
    initialData: {
      orderNumber: '',
      reason: '',
      details: '',
    },
    validate: (data) => {
      const errors: string[] = [];
      if (!data.orderNumber.trim()) errors.push('주문번호를 입력해주세요.');
      if (!data.reason) errors.push('반품 사유를 선택해주세요.');
      return errors;
    },
    resetOnSuccess: true,
  });

  const handleReturnSubmit = returnForm.handleSubmit(async (data) => {
    try {
      // 실제 API 호출 로직이 들어갈 곳
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 모의 API 호출

      NotificationManager.showSuccess(
        '반품 신청이 성공적으로 접수되었습니다. 처리 현황은 마이페이지에서 확인하실 수 있습니다.',
      );
    } catch (error) {
      // 에러 처리 및 알림
      const standardError = ErrorHandler.handleFormError(error, '반품 신청');
      NotificationManager.showWarning(standardError.message);
      throw error;
    }
  });

  const returnReasons = [
    '단순 변심',
    '사이즈 불만족',
    '색상 불만족',
    '상품 불량',
    '배송 상품 오류',
    '기타',
  ];

  const reasonOptions = [
    { value: '', label: '반품 사유를 선택해주세요' },
    ...returnReasons.map((reason) => ({ value: reason, label: reason })),
  ];

  const returnProcess = [
    {
      step: 1,
      title: '반품 신청',
      description: '마이페이지에서 반품 신청 또는 고객센터 연락',
    },
    {
      step: 2,
      title: '반품 승인',
      description: '반품 사유 검토 후 승인 처리 (1-2일 소요)',
    },
    {
      step: 3,
      title: '상품 발송',
      description: '제공된 반품 주소로 상품 발송',
    },
    {
      step: 4,
      title: '상품 확인',
      description: '반품 상품 수령 및 상태 확인',
    },
    {
      step: 5,
      title: '환불 처리',
      description: '환불 승인 후 3-5일 내 환불 완료',
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>교환/반품 안내</h1>
        <p>안전하고 간편한 교환/반품 서비스를 제공합니다.</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'policy' ? styles.active : ''}`}
          onClick={() => setActiveTab('policy')}
        >
          교환/반품 정책
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'process' ? styles.active : ''}`}
          onClick={() => setActiveTab('process')}
        >
          처리 절차
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'info' ? styles.active : ''}`}
          onClick={() => setActiveTab('info')}
        >
          주의사항
        </button>
      </div>

      {activeTab === 'policy' && (
        <div className={styles.tabContent}>
          <div className={styles.policySection}>
            <h2>교환/반품 가능 기간</h2>
            <div className={styles.policyCard}>
              <h3>📅 반품 기간</h3>
              <p>
                상품 수령일로부터 <strong>7일 이내</strong>
              </p>
              <ul>
                <li>단순 변심: 7일 이내</li>
                <li>상품 불량: 30일 이내</li>
                <li>배송 오류: 30일 이내</li>
              </ul>
            </div>

            <div className={styles.policyCard}>
              <h3>💰 반품 비용</h3>
              <ul>
                <li>단순 변심: 고객 부담 (편도 3,000원)</li>
                <li>상품 불량/배송 오류: 회사 부담</li>
                <li>교환 시: 왕복 배송비 6,000원</li>
              </ul>
            </div>

            <div className={styles.policyCard}>
              <h3>✅ 반품 가능 상품</h3>
              <ul>
                <li>미사용 상품 (택, 라벨 그대로 보존)</li>
                <li>원래 포장재에 포장된 상품</li>
                <li>상품 구성품이 모두 있는 경우</li>
              </ul>
            </div>

            <div className={styles.policyCard}>
              <h3>❌ 반품 불가 상품</h3>
              <ul>
                <li>착용 흔적이 있는 상품</li>
                <li>향수, 화장품 등 위생용품</li>
                <li>맞춤 제작 상품</li>
                <li>세일/할인 상품 (일부)</li>
                <li>속옷, 양말 등 개인위생 관련 상품</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'process' && (
        <div className={styles.tabContent}>
          <h2>반품 처리 절차</h2>
          <div className={styles.processContainer}>
            {returnProcess.map((item) => (
              <div key={item.step} className={styles.processStep}>
                <div className={styles.stepNumber}>{item.step}</div>
                <div className={styles.stepContent}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.returnForm}>
            <h3>온라인 반품 신청</h3>
            <FormContainer onSubmit={handleReturnSubmit}>
              <FormInput
                id="orderNumber"
                label="주문번호"
                type="text"
                placeholder="주문번호를 입력하세요"
                value={returnForm.data.orderNumber}
                onChange={(e) => returnForm.updateField('orderNumber', e.target.value)}
                error={returnForm.error}
                required
              />

              <FormSelect
                id="reason"
                label="반품 사유"
                value={returnForm.data.reason}
                onChange={(e) => returnForm.updateField('reason', e.target.value)}
                options={reasonOptions}
                error={returnForm.error}
                required
              />

              <FormTextarea
                id="details"
                label="상세 사유"
                placeholder="반품 사유를 자세히 적어주세요 (선택사항)"
                value={returnForm.data.details}
                onChange={(e) => returnForm.updateField('details', e.target.value)}
                rows={4}
              />

              <FormActions>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => returnForm.resetForm()}
                  disabled={returnForm.isSubmitting}
                >
                  초기화
                </Button>
                <Button type="submit" variant="primary" disabled={returnForm.isSubmitting}>
                  {returnForm.isSubmitting ? '처리 중...' : '반품 신청'}
                </Button>
              </FormActions>
            </FormContainer>
          </div>
        </div>
      )}

      {activeTab === 'info' && (
        <div className={styles.tabContent}>
          <h2>주의사항</h2>
          <div className={styles.infoSection}>
            <div className={styles.infoCard}>
              <h3>⚠️ 반품 신청 전 확인사항</h3>
              <ul>
                <li>상품의 원래 포장재와 구성품이 모두 있는지 확인</li>
                <li>상품에 손상이나 오염이 없는지 확인</li>
                <li>반품 사유가 정당한지 확인</li>
              </ul>
            </div>

            <div className={styles.infoCard}>
              <h3>📞 고객센터 안내</h3>
              <p>반품 관련 문의사항이 있으시면 언제든지 연락주세요.</p>
              <p>
                <strong>전화:</strong> 1588-0000
              </p>
              <p>
                <strong>운영시간:</strong> 평일 9:00-18:00 (주말/공휴일 휴무)
              </p>
              <p>
                <strong>이메일:</strong> returns@styleshop.co.kr
              </p>
            </div>

            <div className={styles.infoCard}>
              <h3>💡 반품 팁</h3>
              <ul>
                <li>반품 시 원래 박스나 포장재를 사용하세요</li>
                <li>택배 전표는 반드시 보관하세요</li>
                <li>깨지기 쉬운 상품은 충분히 포장하세요</li>
                <li>반품 사유를 명확히 기재해주세요</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
