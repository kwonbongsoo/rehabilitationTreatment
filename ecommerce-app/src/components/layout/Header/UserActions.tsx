import { useAuth } from '@/domains/auth/stores';
import Link from 'next/link';
// Tree shaking 적용을 위해 개별 아이콘 임포트
import styles from '@/styles/layout/Header/UserActions.module.css';
import { FiHeart, FiSearch, FiShoppingCart, FiUser } from 'react-icons/fi';

export default function UserActions() {
  const { isGuest } = useAuth();

  return (
    <div className={styles.userActions}>
      {/* 검색 */}
      <button className={styles.actionButton} aria-label="검색">
        <FiSearch size={20} />
      </button>

      {/* 사용자 계정 */}
      <div className={styles.userMenu}>
        {isGuest ? (
          <Link href="/auth/login" className={styles.actionButton}>
            <FiUser size={20} />
          </Link>
        ) : (
          <div className={styles.userInfo}>
            <Link href="/account" className={styles.actionButton}>
              <FiUser size={20} />
            </Link>
          </div>
        )}
      </div>

      {/* 위시리스트 */}
      <Link href="/wishlist" className={styles.actionButton} aria-label="위시리스트">
        <FiHeart size={20} />
      </Link>

      {/* 장바구니 */}
      <Link href="/cart" className={styles.actionButton} aria-label="장바구니">
        <FiShoppingCart size={20} />
      </Link>
    </div>
  );
}
