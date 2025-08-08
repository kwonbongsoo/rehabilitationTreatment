/**
 * 빈 장바구니 상태 컴포넌트
 */

import React, { ReactElement } from 'react';
import Link from 'next/link';
import { FiShoppingCart } from 'react-icons/fi';
import styles from './EmptyCart.module.css';

export function EmptyCart(): ReactElement {
  return (
    <div className={styles.emptyState}>
      <FiShoppingCart size={60} className={styles.emptyIcon} />
      <h2 className={styles.emptyTitle}>Your cart is empty</h2>
      <p className={styles.emptyMessage}>Add items to get started</p>
      <Link href="/products" className={styles.shopButton}>
        Continue Shopping
      </Link>
    </div>
  );
}
