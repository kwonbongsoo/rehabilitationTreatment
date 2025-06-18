import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiX } from 'react-icons/fi';
import styles from '@/styles/layout/Header/MainNavigation.module.css';

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

const MainNavigation: React.FC<MainNavigationProps> = ({
  isOpen,
  onClose,
  categories = [
    { href: '/category/women', label: '여성' },
    { href: '/category/men', label: '남성' },
    { href: '/category/kids', label: '키즈' },
    { href: '/category/accessories', label: '액세서리' },
    { href: '/category/sale', label: '세일', isSale: true },
  ],
}) => {
  const router = useRouter();

  // 카테고리 클릭 시 메뉴 닫기
  const handleCategoryClick = () => {
    onClose();
  };

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
        {categories.map((category, index) => (
          <li key={index} className={router.pathname === category.href ? styles.active : ''}>
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
};

export default MainNavigation;
