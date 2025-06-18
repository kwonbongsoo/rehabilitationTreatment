import { useState, useMemo } from 'react';
import ProductCard, { ProductCardProps } from './ProductCard';
import {
  filterAndSortProducts,
  SortOption,
  COMMON_CATEGORIES,
  COMMON_SORT_OPTIONS,
  BESTSELLER_SORT_OPTIONS,
} from '@/utils/productUtils';
import styles from './ProductGrid.module.css';

interface ProductGridProps {
  products: ProductCardProps['product'][];
  title?: string;
  showFilters?: boolean;
  showCategoryFilter?: boolean;
  showSortFilter?: boolean;
  initialCategory?: string;
  initialSort?: SortOption;
  variant?: ProductCardProps['variant'];
  columns?: 2 | 3 | 4 | 5;
  gap?: 'small' | 'medium' | 'large';
  showAddToCart?: boolean;
  showRating?: boolean;
  showSalesInfo?: boolean;
  showCategory?: boolean;
  imageHeight?: number;
  className?: string;
  gridType?: 'default' | 'bestseller';
  onAddToCart?: (productId: number) => void;
  emptyMessage?: string;
}

export default function ProductGrid({
  products,
  title,
  showFilters = true,
  showCategoryFilter = true,
  showSortFilter = true,
  initialCategory = 'all',
  initialSort = 'newest',
  variant = 'default',
  columns = 4,
  gap = 'medium',
  showAddToCart = true,
  showRating = true,
  showSalesInfo = false,
  showCategory = false,
  imageHeight = 250,
  className = '',
  gridType = 'default',
  onAddToCart,
  emptyMessage = '상품이 없습니다.',
}: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);

  // 그리드 타입에 따른 정렬 옵션 선택
  const sortOptions = gridType === 'bestseller' ? BESTSELLER_SORT_OPTIONS : COMMON_SORT_OPTIONS;

  // 필터링 및 정렬된 상품들
  const filteredProducts = useMemo(() => {
    return filterAndSortProducts(products, selectedCategory, sortBy);
  }, [products, selectedCategory, sortBy]);

  const gridClass = `
    ${styles.productGrid}
    ${styles[`columns${columns}`]}
    ${styles[`gap${gap.charAt(0).toUpperCase() + gap.slice(1)}`]}
    ${className}
  `.trim();

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <div className={styles.filters}>
        {showCategoryFilter && (
          <div className={styles.categoryFilter}>
            <label className={styles.filterLabel}>카테고리</label>
            <div className={styles.categoryButtons}>
              {COMMON_CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  className={`${styles.categoryButton} ${
                    selectedCategory === category.value ? styles.active : ''
                  }`}
                  onClick={() => setSelectedCategory(category.value)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {showSortFilter && (
          <div className={styles.sortFilter}>
            <label className={styles.filterLabel}>정렬</label>
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
      </div>
    );
  };

  const renderProducts = () => {
    if (filteredProducts.length === 0) {
      return (
        <div className={styles.emptyState}>
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className={gridClass}>
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            variant={variant}
            showAddToCart={showAddToCart}
            showRating={showRating}
            showSalesInfo={showSalesInfo}
            showCategory={showCategory}
            imageHeight={imageHeight}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {title && (
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
        </div>
      )}

      {renderFilters()}
      {renderProducts()}
    </div>
  );
}
