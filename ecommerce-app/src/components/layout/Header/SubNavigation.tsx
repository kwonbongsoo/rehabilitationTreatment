import React, { memo, useMemo } from 'react';
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

// 기본 아이템 배열을 컴포넌트 외부로 이동하여 참조 동일성 보장
const DEFAULT_ITEMS: SubItem[] = [
  { href: '/new-arrivals', label: '신상품' },
  { href: '/best-sellers', label: '베스트셀러' },
  { href: '/collections/summer', label: '여름 컬렉션' },
  { href: '/sustainability', label: '지속가능한 패션' },
];

const SubNavigation: React.FC<SubNavigationProps> = memo(({ visible, items }) => {
  // 아이템 배열을 useMemo로 메모이제이션
  const memoizedItems = useMemo(() => {
    return items || DEFAULT_ITEMS;
  }, [items]);

  // className 계산을 useMemo로 메모이제이션
  const className = useMemo(() => {
    // CSS Scroll-driven Animations을 지원하는 브라우저에서는 visible 무시
    // 미지원 브라우저에서만 visible prop 사용
    return visible !== undefined
      ? `${styles.subNav} ${visible ? '' : styles.hidden}`
      : styles.subNav;
  }, [visible]);

  return (
    <div className={className}>
      <div className={styles.container}>
        <ul>
          {memoizedItems.map((item, index) => (
            <li key={index}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

SubNavigation.displayName = 'SubNavigation';

export default SubNavigation;
