'use client';

import { useState, useMemo } from 'react';
import MobileHeader from '@/components/home/MobileHeader';
import ProductCard, { Product } from '@/components/common/ProductCard';
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
  { value: 'all', label: '전체' },
  { value: 'sale', label: '할인상품' },
  { value: 'new', label: '신상품' },
  { value: 'popular', label: '인기상품' },
];

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug: category } = params;
  const [sortBy, setSortBy] = useState('popularity');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock products for the category
  const mockProducts: Product[] = [
    {
      id: 1,
      name: 'White shirt',
      price: 69.0,
      originalPrice: 89.0,
      image: '/images/products/promotion.jpg',
      rating: 4.9,
      isNew: true,
      discount: 22,
    },
    {
      id: 2,
      name: 'Black shirt',
      price: 70.0,
      image: '/images/products/promotion.jpg',
      rating: 4.9,
    },
    {
      id: 3,
      name: 'White shirt',
      price: 69.0,
      originalPrice: 89.0,
      image: '/images/products/promotion.jpg',
      rating: 4.9,
      discount: 22,
    },
    {
      id: 4,
      name: 'Black shirt',
      price: 70.0,
      image: '/images/products/promotion.jpg',
      rating: 4.9,
    },
  ];

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = mockProducts;

    // 필터링
    if (filterBy !== 'all') {
      filtered = filtered.filter((product) => {
        switch (filterBy) {
          case 'sale':
            return product.discount;
          case 'new':
            return product.isNew;
          case 'popular':
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
  }, [sortBy, filterBy]);

  const categoryDisplayName =
    {
      shoes: '신발',
      clothing: '의류',
      accessories: '액세서리',
    }[category] || category;

  const handleWishlistToggle = (productId: number) => {
    console.log('Toggle wishlist for product:', productId);
    // 위시리스트 토글 로직 구현
  };

  return (
    <div className={styles.categoryContainer}>
      <MobileHeader title={categoryDisplayName} showBackButton={true} />

      {/* 필터 및 정렬 */}
      <div className={styles.controls}>
        <div className={styles.filters}>
          {filterOptions.map((option) => (
            <button
              key={option.value}
              className={`${styles.filterButton} ${filterBy === option.value ? styles.active : ''}`}
              onClick={() => setFilterBy(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className={styles.sortAndView}>
          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" />
                <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" />
                <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" />
                <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            <button
              className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => setViewMode('list')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" />
                <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" />
                <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" />
                <line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" strokeWidth="2" />
                <line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" strokeWidth="2" />
                <line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

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
