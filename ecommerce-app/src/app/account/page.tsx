'use client';

import { ConfirmDialog } from '@/components/common/Modal';
import { useLogoutForm } from '@/domains/auth/hooks/useLogoutForm';
import { useAuth } from '@/domains/auth/stores';
import { ErrorHandler } from '@/utils/errorHandling';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiHeart, FiLogOut, FiSettings, FiShoppingBag, FiUser } from 'react-icons/fi';
import styles from '@/styles/account/MobileAccount.module.css';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { handleLogout, isLoading } = useLogoutForm();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const isClientSide = typeof window !== 'undefined';

  // 로그아웃 처리
  const handleLogoutClick = async () => {
    if (isLoading) return; // 이미 로딩 중이면 무시

    try {
      await handleLogout();
      setIsLogoutModalOpen(false);
    } catch (error) {
      ErrorHandler.handleFormError(error, '로그아웃');
      setIsLogoutModalOpen(false);
    }
  };

  // 로딩 상태이거나 인증되지 않은 경우 로딩 표시
  if (!isClientSide || !isAuthenticated) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <>
      <div className={styles.mobileAccountContainer}>
        {/* 헤더 */}
        <div className={styles.accountHeader}>
          <h1 className={styles.accountTitle}>Profile</h1>
        </div>

        {/* 사용자 정보 카드 */}
        <div className={styles.userCard}>
          <div className={styles.userAvatar}>
            <FiUser size={32} />
          </div>
          <div className={styles.userInfo}>
            <h2 className={styles.userName}>{user?.name || 'User'}</h2>
            <p className={styles.userEmail}>{user?.email || 'user@example.com'}</p>
          </div>
        </div>

        {/* 메뉴 리스트 */}
        <div className={styles.menuList}>
          <div className={styles.menuItem} onClick={() => router.push('/account/orders')}>
            <div className={styles.menuIcon}>
              <FiShoppingBag size={20} />
            </div>
            <span className={styles.menuText}>Orders</span>
            <div className={styles.menuArrow}>›</div>
          </div>

          <div className={styles.menuItem} onClick={() => router.push('/wishlist')}>
            <div className={styles.menuIcon}>
              <FiHeart size={20} />
            </div>
            <span className={styles.menuText}>Wishlist</span>
            <div className={styles.menuArrow}>›</div>
          </div>

          <div className={styles.menuItem} onClick={() => router.push('/account/profile')}>
            <div className={styles.menuIcon}>
              <FiUser size={20} />
            </div>
            <span className={styles.menuText}>Profile</span>
            <div className={styles.menuArrow}>›</div>
          </div>

          <div className={styles.menuItem} onClick={() => router.push('/account/settings')}>
            <div className={styles.menuIcon}>
              <FiSettings size={20} />
            </div>
            <span className={styles.menuText}>Settings</span>
            <div className={styles.menuArrow}>›</div>
          </div>

          <div className={styles.menuItem} onClick={() => setIsLogoutModalOpen(true)}>
            <div className={styles.menuIcon}>
              <FiLogOut size={20} />
            </div>
            <span className={styles.menuText}>Logout</span>
            <div className={styles.menuArrow}>›</div>
          </div>
        </div>
      </div>

      {/* 로그아웃 확인 모달 */}
      <ConfirmDialog
        isOpen={isLogoutModalOpen}
        onConfirm={handleLogoutClick}
        onCancel={() => setIsLogoutModalOpen(false)}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText={isLoading ? 'Logging out...' : 'Logout'}
        cancelText="Cancel"
        variant="default"
      />
    </>
  );
}
