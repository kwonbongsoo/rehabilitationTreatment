'use client';

import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/Modal';
import { useLogoutForm } from '@/domains/auth/hooks/useLogoutForm';
import { useAuth } from '@/domains/auth/stores';
import { ErrorHandler } from '@/utils/errorHandling';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiEdit, FiHeart, FiLogOut, FiSettings, FiShoppingBag, FiUser } from 'react-icons/fi';
import styles from './page.module.css';

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
      <div className={styles.container}>
        <div className={styles.content}>
          {/* 사용자 정보 헤더 */}
          <div className={styles.userHeader}>
            <div className={styles.userAvatar}>
              <FiUser size={40} />
            </div>
            <div className={styles.userInfo}>
              <h1 className={styles.userName}>{user?.name || '사용자'}</h1>
              <p className={styles.userEmail}>{user?.email}</p>
              <span className={styles.userRole}>
                {user?.role === 'admin' ? '관리자' : '일반 회원'}
              </span>
            </div>
            <Button
              variant="outline"
              size="small"
              icon={<FiEdit />}
              onClick={() => router.push('/account/profile')}
            >
              프로필 수정
            </Button>
          </div>

          {/* 계정 메뉴 */}
          <div className={styles.menuGrid}>
            <div className={styles.menuCard} onClick={() => router.push('/account/orders')}>
              <div className={styles.menuIcon}>
                <FiShoppingBag size={24} />
              </div>
              <div className={styles.menuContent}>
                <h3 className={styles.menuTitle}>주문 내역</h3>
                <p className={styles.menuDescription}>주문 상태 확인 및 관리</p>
              </div>
            </div>

            <div className={styles.menuCard} onClick={() => router.push('/wishlist')}>
              <div className={styles.menuIcon}>
                <FiHeart size={24} />
              </div>
              <div className={styles.menuContent}>
                <h3 className={styles.menuTitle}>위시리스트</h3>
                <p className={styles.menuDescription}>관심 상품 관리</p>
              </div>
            </div>

            <div className={styles.menuCard} onClick={() => router.push('/account/profile')}>
              <div className={styles.menuIcon}>
                <FiUser size={24} />
              </div>
              <div className={styles.menuContent}>
                <h3 className={styles.menuTitle}>개인정보</h3>
                <p className={styles.menuDescription}>프로필 및 개인정보 관리</p>
              </div>
            </div>

            <div className={styles.menuCard} onClick={() => router.push('/account/settings')}>
              <div className={styles.menuIcon}>
                <FiSettings size={24} />
              </div>
              <div className={styles.menuContent}>
                <h3 className={styles.menuTitle}>계정 설정</h3>
                <p className={styles.menuDescription}>보안 및 알림 설정</p>
              </div>
            </div>
          </div>

          {/* 로그아웃 버튼 */}
          <div className={styles.logoutSection}>
            <Button
              variant="outline"
              size="large"
              fullWidth
              icon={<FiLogOut />}
              onClick={() => setIsLogoutModalOpen(true)}
              disabled={isLoading}
            >
              {isLoading ? '로그아웃 중...' : '로그아웃'}
            </Button>
          </div>
        </div>
      </div>

      {/* 로그아웃 확인 모달 */}
      <ConfirmDialog
        isOpen={isLogoutModalOpen}
        onConfirm={handleLogoutClick}
        onCancel={() => setIsLogoutModalOpen(false)}
        title="로그아웃"
        message="정말 로그아웃하시겠습니까?"
        confirmText={isLoading ? '로그아웃 중...' : '로그아웃'}
        cancelText="취소"
        variant="default"
      />
    </>
  );
}
