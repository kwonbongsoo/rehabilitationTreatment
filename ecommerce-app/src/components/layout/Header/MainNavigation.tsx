import styles from '@/styles/layout/Header/MainNavigation.module.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { memo, useCallback, useMemo } from 'react';
import { FiX } from 'react-icons/fi';

interface Category {
  href: string;
  label: string;
  isSale?: boolean;
}

interface MainNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: Category[];
}

// 기본 카테고리 배열을 컴포넌트 외부로 이동하여 참조 동일성 보장
const DEFAULT_CATEGORIES: Category[] = [
  { href: '/category/women', label: '여성' },
  { href: '/category/men', label: '남성' },
  { href: '/category/kids', label: '키즈' },
  { href: '/category/accessories', label: '액세서리' },
  { href: '/category/sale', label: '세일', isSale: true },
];

const MainNavigation: React.FC<MainNavigationProps> = memo(({ isOpen, onClose, categories }) => {
  const pathname = usePathname();

  // 카테고리 배열을 useMemo로 메모이제이션
  const memoizedCategories = useMemo(() => {
    return categories || DEFAULT_CATEGORIES;
  }, [categories]);

  // 카테고리 클릭 시 메뉴 닫기를 useCallback으로 메모이제이션
  const handleCategoryClick = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <nav className={`${styles.mainNav} ${isOpen ? styles.active : ''}`}>
      {/* 모바일 메뉴 헤더 (닫기 버튼) */}
      <div className={styles.mobileMenuHeader}>
        <h3 className={styles.menuTitle}>카테고리</h3>
        <button className={styles.closeButton} onClick={onClose} aria-label="메뉴 닫기">
          <FiX size={24} />
        </button>
      </div>

      <ul>
        {memoizedCategories.map((category, index) => (
          <li key={index} className={pathname === category.href ? styles.active : ''}>
            <Link
              href={category.href}
              className={category.isSale ? styles.saleLink : ''}
              onClick={handleCategoryClick}
            >
              {category.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
});

MainNavigation.displayName = 'MainNavigation';

export default MainNavigation;
