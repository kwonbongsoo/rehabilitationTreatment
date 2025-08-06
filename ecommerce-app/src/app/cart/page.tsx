'use client';

import React from 'react';
import { ConfirmDialog } from '@/components/common/Modal';
import { CartSkeleton } from '@/components/skeleton/PageSkeleton';
import styles from './page.module.css';
import { useCartPage } from '@/domains/cart/hooks/useCartPage';
import { CartItem } from '@/domains/cart/components/CartItem';
import { CartSummary } from '@/domains/cart/components/CartSummary';
import { EmptyCart } from '@/domains/cart/components/EmptyCart';

export default function CartPage() {
  const {
    // 상태
    displayItems,
    isLoading,
    selectedItemId,
    showDeleteModal,
    showClearModal,
    discountCode,
    subtotal,
    total,
    
    // 액션
    handleItemClick,
    handleDeleteItem,
    confirmDeleteItem,
    confirmClearCart,
    updateItemQuantity,
    setDiscountCode,
    applyDiscountCode,
    handleCheckout,
    
    // 모달 제어
    setShowDeleteModal,
    setShowClearModal,
  } = useCartPage();

  return (
    <div className={styles.cartContainer}>
      {isLoading ? (
        <CartSkeleton />
      ) : displayItems.length === 0 ? (
        <EmptyCart />
      ) : (
        <>
          <div className={styles.cartItems}>
            {displayItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                isSelected={selectedItemId === item.id}
                onItemClick={handleItemClick}
                onQuantityChange={updateItemQuantity}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>

          <CartSummary
            subtotal={subtotal}
            total={total}
            discountCode={discountCode}
            onDiscountCodeChange={setDiscountCode}
            onApplyDiscount={applyDiscountCode}
            onCheckout={handleCheckout}
          />
        </>
      )}

      {/* 개별 삭제 확인 모달 */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteItem}
        title="상품 삭제"
        message="이 상품을 장바구니에서 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
      />

      {/* 전체 삭제 확인 모달 */}
      <ConfirmDialog
        isOpen={showClearModal}
        onCancel={() => setShowClearModal(false)}
        onConfirm={confirmClearCart}
        title="장바구니 비우기"
        message="장바구니의 모든 상품을 삭제하시겠습니까?"
        confirmText="전체 삭제"
        cancelText="취소"
      />
    </div>
  );
}
