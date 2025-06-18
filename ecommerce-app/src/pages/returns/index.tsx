import { useState } from 'react';
import Head from 'next/head';
import { useFormState } from '@/hooks/useFormState';
import { ErrorHandler } from '@/utils/errorHandling';
import { NotificationManager } from '@/utils/notifications';
import {
  FormContainer,
  FormInput,
  FormSelect,
  FormTextarea,
  FormActions,
} from '@/components/common/Form';
import { Button } from '@/components/common/Button';
import styles from './Returns.module.css';

interface ReturnFormData {
  orderNumber: string;
  reason: string;
  details: string;
}

const Returns: React.FC = () => {
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
      <Head>
        <title>교환/반품 안내 - StyleShop</title>
        <meta name="description" content="StyleShop의 교환/반품 정책과 절차를 확인하세요." />
      </Head>

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
                value={returnForm.data.orderNumber}
                onChange={(e) => returnForm.updateField('orderNumber', e.target.value)}
                placeholder="주문번호를 입력해주세요"
                required
              />

              <FormSelect
                id="reason"
                label="반품 사유"
                value={returnForm.data.reason}
                onChange={(e) => returnForm.updateField('reason', e.target.value)}
                options={reasonOptions}
                required
              />

              <FormTextarea
                id="details"
                label="상세 사유"
                value={returnForm.data.details}
                onChange={(e) => returnForm.updateField('details', e.target.value)}
                placeholder="상세 사유를 입력해주세요 (선택사항)"
                rows={4}
              />

              <FormActions>
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  fullWidth
                  isLoading={returnForm.isSubmitting}
                  disabled={!returnForm.canSubmit}
                >
                  {returnForm.isSubmitting ? '신청 중...' : '반품 신청'}
                </Button>
              </FormActions>

              {returnForm.hasError && (
                <div style={{ color: 'red', marginTop: '1rem', textAlign: 'center' }}>
                  {returnForm.error}
                </div>
              )}
            </FormContainer>
          </div>
        </div>
      )}

      {activeTab === 'info' && (
        <div className={styles.tabContent}>
          <h2>교환/반품 주의사항</h2>

          <div className={styles.infoSection}>
            <h3>🏷️ 상품 보관 주의사항</h3>
            <ul>
              <li>상품 택과 라벨을 제거하지 마세요</li>
              <li>원래 포장재를 훼손하지 마세요</li>
              <li>향수나 화장품 냄새가 배지 않도록 주의하세요</li>
              <li>애완동물의 털이나 냄새가 배지 않도록 주의하세요</li>
            </ul>
          </div>

          <div className={styles.infoSection}>
            <h3>📦 반품 포장 방법</h3>
            <ul>
              <li>원래 포장재에 다시 포장해주세요</li>
              <li>구성품을 모두 포함해주세요</li>
              <li>반품 신청서를 동봉해주세요</li>
              <li>파손되지 않도록 안전하게 포장해주세요</li>
            </ul>
          </div>

          <div className={styles.infoSection}>
            <h3>💳 환불 방법</h3>
            <ul>
              <li>신용카드: 카드사 정책에 따라 2-5일 소요</li>
              <li>계좌이체: 반품 승인 후 3일 내 입금</li>
              <li>포인트: 즉시 환불 처리</li>
              <li>쿠폰 사용 주문: 쿠폰 재발급 (유효기간 내)</li>
            </ul>
          </div>

          <div className={styles.contactInfo}>
            <h3>문의하기</h3>
            <p>교환/반품 관련 문의사항이 있으시면 언제든 연락주세요.</p>
            <div className={styles.contactDetails}>
              <div>
                <strong>고객센터</strong>
                <p>1588-1234</p>
                <p>평일 9:00-18:00</p>
              </div>
              <div>
                <strong>이메일</strong>
                <p>returns@styleshop.com</p>
                <p>24시간 접수</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Returns;
