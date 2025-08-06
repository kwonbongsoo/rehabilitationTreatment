'use client';

import { useMemo, useState } from 'react';
import ProductCard from './ProductCard';
import {
  BESTSELLER_SORT_OPTIONS,
  COMMON_CATEGORIES,
  COMMON_SORT_OPTIONS,
  filterAndSortProducts,
  SortOption,
} from '@/utils/productUtils';
import type { Product } from '@/domains/product/types/product';
import styles from './ProductGrid.module.css';

interface ProductGridProps {
  products: Product[];
  title?: string;
  showFilters?: boolean;
  initialCategory?: number;
  initialSort?: SortOption;
  gridType?: 'default' | 'bestseller';
  emptyMessage?: string;
  onWishlistToggle?: (productId: number) => void;
  isWishlisted?: (productId: number) => boolean;
}

export default function ProductGrid({
  products,
  title,
  showFilters = true,
  initialCategory = 0,
  initialSort = 'newest',
  gridType = 'default',
  emptyMessage = '상품이 없습니다.',
  onWishlistToggle,
  isWishlisted,
}: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);

  const sortOptions = useMemo(() => {
    return gridType === 'bestseller' ? BESTSELLER_SORT_OPTIONS : COMMON_SORT_OPTIONS;
  }, [gridType]);

  const filteredProducts = useMemo(() => {
    return filterAndSortProducts(products, selectedCategory, sortBy);
  }, [products, selectedCategory, sortBy]);

  if (filteredProducts.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {title && (
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
        </div>
      )}

      {showFilters && (
        <div className={styles.filters}>
          <div className={styles.categoryFilter}>
            {COMMON_CATEGORIES.map((category) => (
              <button
                key={category.id}
                className={`${styles.categoryButton} ${
                  selectedCategory === category.id ? styles.active : ''
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className={styles.sortSelect}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.productGrid}>
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onWishlistToggle={onWishlistToggle || (() => {})}
            isWishlisted={isWishlisted ? isWishlisted(product.id) : false}
          />
        ))}
      </div>
    </div>
  );
}
