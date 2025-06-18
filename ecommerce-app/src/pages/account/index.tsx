import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FiUser, FiSettings, FiShoppingBag, FiHeart, FiLogOut, FiEdit } from 'react-icons/fi';
import { useAuth } from '@/store/useAuthStore';
import { Button } from '@/components/common/Button';
import { Modal, ConfirmDialog } from '@/components/common/Modal';
import styles from './Account.module.css';

export default function Account() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const isClient = typeof window !== 'undefined';

  // 인증되지 않은 사용자 리다이렉트
  useEffect(() => {
    if (isClient && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isClient, isAuthenticated, router]);

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    } finally {
      setIsLogoutModalOpen(false);
    }
  };

  // 로딩 상태 또는 인증되지 않은 상태에서는 빈 페이지
  if (!isClient || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>내 계정 | 쇼핑몰</title>
        <meta name="description" content="계정 관리 및 개인정보 설정" />
      </Head>

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
            >
              로그아웃
            </Button>
          </div>
        </div>
      </div>

      {/* 로그아웃 확인 모달 */}
      <ConfirmDialog
        isOpen={isLogoutModalOpen}
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
        title="로그아웃"
        message="정말 로그아웃하시겠습니까?"
        confirmText="로그아웃"
        cancelText="취소"
        variant="default"
      />
    </>
  );
}
