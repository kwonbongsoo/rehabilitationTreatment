'use client';

import React, { memo, ReactElement } from 'react';
import { usePathname } from 'next/navigation';
import CommonHeader from './CommonHeader';

interface CommonLayoutProps {
  children: React.ReactNode;
}

const getPageTitle = (pathname: string): string => {
  if (pathname === '/cart') return 'My Cart';
  if (pathname.startsWith('/collections/')) {
    const collection = pathname.split('/')[2] || '';
    const titles: { [key: string]: string } = {
      summer: '여름 컬렉션',
      winter: '겨울 컬렉션',
      spring: '봄 컬렉션',
      fall: '가을 컬렉션',
    };
    return titles[collection] || '컬렉션';
  }
  if (pathname.startsWith('/categories/')) {
    const category = pathname.split('/')[2] || '';
    const titles: { [key: string]: string } = {
      shoes: '신발',
      clothing: '의류',
      accessories: '액세서리',
    };
    return titles[category] || category;
  }
  if (pathname === '/products') return '상품';
  if (pathname === '/wishlist') return '위시리스트';
  if (pathname === '/account') return '계정';
  if (pathname === '/filter') return '필터';
  if (pathname === '/size-guide') return '사이즈 가이드';
  if (pathname.startsWith('/product/')) return 'Details';
  if (pathname.startsWith('/categories')) return 'Categories';

  return '페이지';
};

const CommonLayout: React.FC<CommonLayoutProps> = memo(({ children }): ReactElement => {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const isCartPage = pathname === '/cart';

  const handleClearCart = (): void => {
    // 카트 페이지에서 전체 삭제 이벤트를 자식 컴포넌트로 전달하기 위한 이벤트 발생
    const event = new CustomEvent('clearCart');
    window.dispatchEvent(event);
  };

  return (
    <>
      <CommonHeader
        title={title}
        showDeleteButton={isCartPage}
        onDeleteClick={isCartPage ? handleClearCart : () => {}}
      />
      {children}
    </>
  );
});

CommonLayout.displayName = 'CommonLayout';

export default CommonLayout;
