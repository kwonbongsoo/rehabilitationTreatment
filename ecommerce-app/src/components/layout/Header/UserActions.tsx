import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiHeart, FiUser, FiShoppingCart } from 'react-icons/fi';
import styles from '@/styles/layout/Header/UserActions.module.css';
import SearchBar from './SearchBar';
import { useAuth } from '@/store/useAuthStore';

interface UserActionsProps {
  cartItemCount?: number;
}

const UserActions: React.FC<UserActionsProps> = ({ cartItemCount = 3 }) => {
  const { isAuthenticated, isGuest } = useAuth();
  const [isClient, setIsClient] = useState(false);

  // 클라이언트 사이드 확인 (hydration 문제 해결)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 사용자 상태에 따른 아이콘 렌더링 로직 (깜빡임 최소화)
  const renderUserIcon = () => {
    // SSR 시에는 기본 로그인 아이콘 표시 (깜빡임 방지)
    if (!isClient) {
      return (
        <Link href="/auth/login" className={styles.iconButton} aria-label="로그인">
          <FiUser size={20} />
        </Link>
      );
    }

    // 클라이언트에서는 정확한 상태에 따라 렌더링
    if (isAuthenticated && !isGuest) {
      return (
        <Link href="/account" className={styles.iconButton} aria-label="내 계정">
          <FiUser size={20} />
          <span className={styles.userIndicator}></span>
        </Link>
      );
    }

    // 미인증 또는 게스트 사용자
    return (
      <Link href="/auth/login" className={styles.iconButton} aria-label="로그인">
        <FiUser size={20} />
      </Link>
    );
  };

  return (
    <div className={styles.userActions}>
      <SearchBar />

      {/* 위시리스트 */}
      <Link href="/wishlist" className={styles.iconButton} aria-label="위시리스트">
        <FiHeart size={20} />
      </Link>

      {/* 사용자 계정 - 깜빡임 최소화된 렌더링 */}
      {renderUserIcon()}

      {/* 장바구니 */}
      <Link href="/cart" className={styles.cartButton} aria-label="장바구니">
        <FiShoppingCart size={20} />
        {cartItemCount > 0 && <span className={styles.cartCount}>{cartItemCount}</span>}
      </Link>
    </div>
  );
};

export default UserActions;
