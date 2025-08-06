/**
 * 장바구니 아이템 컴포넌트
 * 개별 장바구니 아이템 UI 렌더링
 */

import React, { ReactElement } from 'react';
import OptimizedImageNext from '@/components/common/OptimizedImageNext';
import styles from './CartItem.module.css';

interface CartItemData {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartItemProps {
  item: CartItemData;
  isSelected: boolean;
  onItemClick: (itemId: string) => void;
  onQuantityChange: (itemId: string, change: number) => void;
  onDelete: (itemId: string) => void;
}

export function CartItem({
  item,
  isSelected,
  onItemClick,
  onQuantityChange,
  onDelete,
}: CartItemProps): ReactElement {
  return (
    <div className={styles.cartItemWrapper}>
      <div
        className={`${styles.cartItem} ${isSelected ? styles.selected : ''}`}
        onClick={() => onItemClick(item.id)}
      >
        <div className={styles.itemImage}>
          <OptimizedImageNext
            src={item.image}
            alt={item.name}
            width={60}
            height={60}
            className={styles.productImage}
          />
        </div>

        <div className={styles.itemInfo}>
          <h3 className={styles.itemName}>{item.name}</h3>
          <p className={styles.itemPrice}>{item.price.toLocaleString('ko-KR')}원</p>
        </div>

        <div className={styles.quantityControls}>
          <button
            className={styles.quantityButton}
            onClick={(e) => {
              e.stopPropagation();
              onQuantityChange(item.id, -1);
            }}
            aria-label="수량 감소"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
          <span className={styles.quantity}>{item.quantity}</span>
          <button
            className={styles.quantityButton}
            onClick={(e) => {
              e.stopPropagation();
              onQuantityChange(item.id, 1);
            }}
            aria-label="수량 증가"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" />
              <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>

      {isSelected && (
        <button
          className={styles.deleteButton}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          aria-label="상품 삭제"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2" />
            <path
              d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" />
            <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      )}
    </div>
  );
}
