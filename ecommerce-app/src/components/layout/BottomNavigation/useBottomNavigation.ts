import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/domains/auth/stores';
import { useCallback, useMemo } from 'react';
import { NavItem } from './types';
import { NAVIGATION_ITEMS } from './constants';

export const useBottomNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isGuest } = useAuth();

  // 현재 경로에 따른 활성 상태 계산
  const navItemsWithActiveState = useMemo(() => {
    return NAVIGATION_ITEMS.map((item) => ({
      ...item,
      isActive: item.path === '/' ? pathname === item.path : pathname.startsWith(item.path),
    }));
  }, [pathname]);

  // 네비게이션 클릭 핸들러
  const handleNavClick = useCallback(
    (item: NavItem) => {
      // 인증이 필요한 페이지이고 게스트인 경우 로그인 페이지로 리다이렉트
      if (item.requiresAuth && isGuest) {
        router.push('/auth/login');
        return;
      }

      // 일반적인 네비게이션
      router.push(item.path);
    },
    [router, isGuest],
  );

  return {
    navItems: navItemsWithActiveState,
    handleNavClick,
    isGuest,
  };
};
