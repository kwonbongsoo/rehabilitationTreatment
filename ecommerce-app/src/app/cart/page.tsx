'use client';

import OptimizedImage from '@/components/common/OptimizedImage';
import { CartSkeleton } from '@/components/skeleton/PageSkeleton';
import Link from 'next/link';
import { FiArrowRight, FiMinus, FiPlus, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import styles from './page.module.css';
import { useCartStore } from '@/domains/cart/stores';
import { useCartActions } from '@/domains/cart/hooks';

export default function CartPage() {
  const { cartItems, isLoading } = useCartStore();
  const { removeItem, updateQuantity } = useCartActions();

  // Calculate cart totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal >= 50000 ? 0 : 3000; // Free shipping for orders over 50,000원
  const total = subtotal + shippingFee;

  return (
    <main>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <FiShoppingCart className={styles.cartIcon} />
            장바구니
          </h1>
        </div>

        {isLoading ? (
          <CartSkeleton />
        ) : cartItems.length === 0 ? (
          <div className={styles.emptyState}>
            <FiShoppingCart size={60} className={styles.emptyIcon} />
            <h2>장바구니가 비어있습니다.</h2>
            <p>원하는 상품을 장바구니에 담아보세요!</p>
            <Link href="/products" className={styles.shopButton}>
              쇼핑 계속하기
            </Link>
          </div>
        ) : (
          <div className={styles.cartContent}>
            <div className={styles.cartItems}>
              {cartItems.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.itemImage}>
                    <OptimizedImage
                      src={item.image}
                      alt={item.name}
                      width={100}
                      height={100}
                      className={styles.productImage}
                    />
                  </div>
                  <div className={styles.itemDetails}>
                    <h3>{item.name}</h3>
                    <div className={styles.itemOptions}>
                      {item.color && <span>색상: {item.color}</span>}
                      {item.size && <span>사이즈: {item.size}</span>}
                    </div>
                    <p className={styles.itemPrice}>{item.price.toLocaleString()}원</p>
                  </div>
                  <div className={styles.quantityControls}>
                    <button
                      className={styles.quantityButton}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label="수량 감소"
                    >
                      <FiMinus />
                    </button>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <button
                      className={styles.quantityButton}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="수량 증가"
                    >
                      <FiPlus />
                    </button>
                  </div>
                  <div className={styles.itemTotal}>
                    {(item.price * item.quantity).toLocaleString()}원
                  </div>
                  <button
                    className={styles.removeButton}
                    onClick={() => removeItem(item.id)}
                    aria-label="상품 제거"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.orderSummary}>
              <h2 className={styles.summaryTitle}>주문 요약</h2>
              <div className={styles.summaryRow}>
                <span>상품 금액</span>
                <span>{subtotal.toLocaleString()}원</span>
              </div>
              <div className={styles.summaryRow}>
                <span>배송비</span>
                <span>{shippingFee.toLocaleString()}원</span>
              </div>

              {shippingFee === 0 && (
                <div className={styles.freeShippingNotice}>무료 배송 혜택이 적용되었습니다!</div>
              )}

              {subtotal < 50000 && (
                <div className={styles.freeShippingNotice}>
                  {(50000 - subtotal).toLocaleString()}원 더 구매 시 무료 배송
                </div>
              )}

              <div className={styles.summaryDivider} />

              <div className={styles.summaryTotal}>
                <span>총 결제 금액</span>
                <span>{total.toLocaleString()}원</span>
              </div>

              <button className={styles.checkoutButton}>
                결제하기
                <FiArrowRight />
              </button>

              <Link href="/products" className={styles.continueShoppingButton}>
                쇼핑 계속하기
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
