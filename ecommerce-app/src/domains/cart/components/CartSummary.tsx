/**
 * 장바구니 요약 컴포넌트
 * 할인 코드, 가격 정보, 체크아웃 버튼
 */

import React, { ReactElement } from 'react';
import { Button } from '@/components/common/Button';
import styles from './CartSummary.module.css';

interface CartSummaryProps {
  subtotal: number;
  total: number;
  discountCode: string;
  onDiscountCodeChange: (code: string) => void;
  onApplyDiscount: () => void;
  onCheckout: () => void;
}

export function CartSummary({
  subtotal,
  total,
  discountCode,
  onDiscountCodeChange,
  onApplyDiscount,
  onCheckout,
}: CartSummaryProps): ReactElement {
  return (
    <div className={styles.summary}>
      {/* 할인 코드 */}
      <div className={styles.discountSection}>
        <div className={styles.discountInputContainer}>
          <input
            type="text"
            placeholder="Enter Discount Code"
            className={styles.discountInput}
            value={discountCode}
            onChange={(e) => onDiscountCodeChange(e.target.value)}
          />
          <button className={styles.applyButton} onClick={onApplyDiscount}>
            Apply
          </button>
        </div>
      </div>

      {/* 가격 정보 */}
      <div className={styles.priceSection}>
        <div className={styles.priceRow}>
          <span className={styles.priceLabel}>Subtotal</span>
          <span className={styles.priceValue}>{subtotal.toLocaleString('ko-KR')}원</span>
        </div>
        <div className={styles.priceRow}>
          <span className={styles.totalLabel}>Total</span>
          <span className={styles.totalValue}>{total.toLocaleString('ko-KR')}원</span>
        </div>
      </div>

      {/* 체크아웃 버튼 */}
      <Button variant="primary" className={styles.checkoutButton} onClick={onCheckout}>
        Check Out
      </Button>
    </div>
  );
}
