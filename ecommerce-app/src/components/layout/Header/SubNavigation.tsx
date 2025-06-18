import React from 'react';
import Link from 'next/link';
import styles from '@/styles/layout/Header/SubNavigation.module.css';

interface SubItem {
  href: string;
  label: string;
}

interface SubNavigationProps {
  visible?: boolean; // CSS Scroll-driven Animations 폴백용
  items?: SubItem[];
}

const SubNavigation: React.FC<SubNavigationProps> = ({
  visible,
  items = [
    { href: '/new-arrivals', label: '신상품' },
    { href: '/best-sellers', label: '베스트셀러' },
    { href: '/collections/summer', label: '여름 컬렉션' },
    { href: '/sustainability', label: '지속가능한 패션' },
  ],
}) => {
  // CSS Scroll-driven Animations을 지원하는 브라우저에서는 visible 무시
  // 미지원 브라우저에서만 visible prop 사용
  const className =
    visible !== undefined ? `${styles.subNav} ${visible ? '' : styles.hidden}` : styles.subNav;

  return (
    <div className={className}>
      <div className={styles.container}>
        <ul>
          {items.map((item, index) => (
            <li key={index}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SubNavigation;
