'use client';

import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
import OptimizedImage from '@/components/common/OptimizedImage';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/Modal';
import { CartSkeleton } from '@/components/skeleton/PageSkeleton';
import Link from 'next/link';
import { FiShoppingCart } from 'react-icons/fi';
import styles from './page.module.css';
import { useCartStore } from '@/domains/cart/stores';
import { useCartActions } from '@/domains/cart/hooks';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function CartPage() {
  // const router = useRouter();
  const { cartItems, isLoading } = useCartStore();
  const { removeItem, updateQuantity, clearCart } = useCartActions();

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState('');

  // Mock cart items for demo
  const mockCartItems: CartItem[] = [
    {
      id: '1',
      name: 'Classic T-shirt',
      price: 169.0,
      quantity: 1,
      image: 'https://www.kbs-cdn.shop/image/promotion.jpg',
    },
    {
      id: '2',
      name: 'Skinny Jeans',
      price: 169.0,
      quantity: 1,
      image: 'https://www.kbs-cdn.shop/image/promotion.jpg',
    },
    {
      id: '3',
      name: 'Slip Dresses',
      price: 169.0,
      quantity: 1,
      image: 'https://www.kbs-cdn.shop/image/promotion.jpg',
    },
  ];

  const displayItems = cartItems.length > 0 ? cartItems : mockCartItems;

  // Calculate totals
  const subtotal = displayItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal; // No additional fees for now

  const handleItemClick = (itemId: string) => {
    setSelectedItemId(selectedItemId === itemId ? null : itemId);
  };

  const handleDeleteItem = (itemId: string) => {
    setItemToDelete(itemId);
    setShowDeleteModal(true);
  };

  const handleClearCart = () => {
    setShowClearModal(true);
  };

  const confirmDeleteItem = () => {
    if (itemToDelete) {
      removeItem(itemToDelete);
      setItemToDelete(null);
      setSelectedItemId(null);
    }
    setShowDeleteModal(false);
  };

  const confirmClearCart = () => {
    clearCart();
    setSelectedItemId(null);
    setShowClearModal(false);
  };

  const updateItemQuantity = (itemId: string, change: number) => {
    const item = displayItems.find((item) => item.id === itemId);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      updateQuantity(itemId, newQuantity);
    }
  };

  const applyDiscountCode = () => {
    console.log('Applying discount code:', discountCode);
    // Implement discount logic here
  };

  const handleCheckout = () => {
    console.log('Proceeding to checkout');
    // Implement checkout logic here
  };

  // CommonLayout에서 발생하는 clearCart 이벤트 리스너
  useEffect(() => {
    const handleClearCartEvent = () => {
      handleClearCart();
    };

    window.addEventListener('clearCart', handleClearCartEvent);

    return () => {
      window.removeEventListener('clearCart', handleClearCartEvent);
    };
  }, []);

  return (
    <div className={styles.cartContainer}>
      {isLoading ? (
        <CartSkeleton />
      ) : displayItems.length === 0 ? (
        <div className={styles.emptyState}>
          <FiShoppingCart size={60} className={styles.emptyIcon} />
          <h2>Your cart is empty</h2>
          <p>Add items to get started</p>
          <Link href="/products" className={styles.shopButton}>
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.cartItems}>
            {displayItems.map((item) => (
              <div key={item.id} className={styles.cartItemWrapper}>
                <div
                  className={`${styles.cartItem} ${selectedItemId === item.id ? styles.selected : ''}`}
                  onClick={() => handleItemClick(item.id)}
                >
                  <div className={styles.itemImage}>
                    <OptimizedImage
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
                        updateItemQuantity(item.id, -1);
                      }}
                      aria-label="수량 감소"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <line
                          x1="5"
                          y1="12"
                          x2="19"
                          y2="12"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <button
                      className={styles.quantityButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateItemQuantity(item.id, 1);
                      }}
                      aria-label="수량 증가"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <line
                          x1="12"
                          y1="5"
                          x2="12"
                          y2="19"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <line
                          x1="5"
                          y1="12"
                          x2="19"
                          y2="12"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {selectedItemId === item.id && (
                  <button
                    className={styles.deleteButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(item.id);
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
            ))}
          </div>

          <div className={styles.summary}>
            {/* 할인 코드 */}
            <div className={styles.discountSection}>
              <div className={styles.discountInputContainer}>
                <input
                  type="text"
                  placeholder="Enter Discount Code"
                  className={styles.discountInput}
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                />
                <button className={styles.applyButton} onClick={applyDiscountCode}>
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
            <Button variant="primary" className={styles.checkoutButton} onClick={handleCheckout}>
              Check Out
            </Button>
          </div>
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
