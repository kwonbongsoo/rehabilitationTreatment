'use client';

import { useState, useMemo } from 'react';
import ProductCard, { Product } from '@/components/common/ProductCard';
import ProductFilters from '@/components/common/ProductFilters';
import { Button } from '@/components/common/Button';
import styles from './page.module.css';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

const sortOptions = [
  { value: 'popularity', label: '인기순' },
  { value: 'price-low', label: '낮은 가격순' },
  { value: 'price-high', label: '높은 가격순' },
  { value: 'rating', label: '평점순' },
  { value: 'newest', label: '최신순' },
];

const filterOptions = [
  { value: '전체', label: '전체' },
  { value: '할인상품', label: '할인상품' },
  { value: '신상품', label: '신상품' },
  { value: '인기상품', label: '인기상품' },
];

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug: category } = params;
  const [sortBy, setSortBy] = useState('popularity');
  const [filterBy, setFilterBy] = useState('전체');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  console.log(category);

  // Mock products for the category - useMemo로 안정적인 참조 생성
  const mockProducts: Product[] = useMemo(
    () => [
      {
        id: 1,
        name: 'White shirt',
        price: 69.0,
        originalPrice: 89.0,
        image: 'https://www.kbs-cdn.shop/image/promotion.jpg',
        rating: 4.9,
        isNew: true,
        discount: 22,
      },
      {
        id: 2,
        name: 'Black shirt',
        price: 70.0,
        image: 'https://www.kbs-cdn.shop/image/promotion.jpg',
        rating: 4.9,
      },
      {
        id: 3,
        name: 'White shirt',
        price: 69.0,
        originalPrice: 89.0,
        image: 'https://www.kbs-cdn.shop/image/promotion.jpg',
        rating: 4.9,
        discount: 22,
      },
      {
        id: 4,
        name: 'Black shirt',
        price: 70.0,
        image: 'https://www.kbs-cdn.shop/image/promotion.jpg',
        rating: 4.9,
      },
    ],
    [],
  ); // 빈 의존성 배열 - 컴포넌트 생명주기 동안 안정적

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = mockProducts;

    // 필터링
    if (filterBy !== '전체') {
      filtered = filtered.filter((product) => {
        switch (filterBy) {
          case '할인상품':
            return product.discount;
          case '신상품':
            return product.isNew;
          case '인기상품':
            return product.rating && product.rating >= 4.5;
          default:
            return true;
        }
      });
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        default:
          return (b.rating || 0) - (a.rating || 0);
      }
    });

    return filtered;
  }, [sortBy, filterBy, mockProducts]);

  const handleWishlistToggle = (productId: number) => {
    console.log('Toggle wishlist for product:', productId);
    // 위시리스트 토글 로직 구현
  };

  const handleFilterChange = (filter: string) => {
    setFilterBy(filter);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  return (
    <div className={styles.categoryContainer}>
      {/* 필터 및 정렬 */}
      <ProductFilters
        filterOptions={filterOptions}
        sortOptions={sortOptions}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onViewModeChange={handleViewModeChange}
        defaultFilter={filterBy}
        defaultSort={sortBy}
        defaultViewMode={viewMode}
      />

      {/* 상품 리스트 */}
      <div className={`${styles.productGrid} ${viewMode === 'list' ? styles.listView : ''}`}>
        {filteredAndSortedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onWishlistToggle={handleWishlistToggle}
            className={styles.productCard || ''}
          />
        ))}
      </div>

      {/* 필터 FAB */}
      <Button className={styles.filterFab} variant="primary">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <polygon
            points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
        필터
      </Button>
    </div>
  );
}

// generateMetadata 함수 제거 - 클라이언트 컴포넌트에서는 사용 불가