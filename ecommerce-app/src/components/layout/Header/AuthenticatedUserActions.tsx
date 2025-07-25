'use client';

import { useAuth } from '@/domains/auth/stores';
import { useAuthQuery } from '@/hooks/queries/useAuthQuery';
import Link from 'next/link';
import { useEffect } from 'react';
import { FiHeart, FiSearch, FiShoppingCart, FiUser } from 'react-icons/fi';
import styles from '@/styles/layout/Header/UserActions.module.css';

/**
 * 인증 상태를 확인하고 표시하는 컴포넌트
 * - useAuthQuery로 인증 상태 로드 및 Zustand 동기화
 * - 로딩 중에는 부모 컴포넌트에서 스켈레톤 처리
 */
export function AuthenticatedUserActions() {
  const { setUser } = useAuth();
  const { data: user, isLoading } = useAuthQuery();
  const { isGuest } = useAuth();

  // React Query 데이터와 Zustand 동기화
  useEffect(() => {
    if (!isLoading) {
      setUser(user || null);
    }
  }, [user, isLoading, setUser]);

  // 로딩 중이면 null 반환 (부모에서 스켈레톤 처리)
  if (isLoading) {
    return null;
  }

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