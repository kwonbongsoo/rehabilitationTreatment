'use client';
import { useState, useMemo } from 'react';
import CategoryIconGrid from '@/components/common/CategoryIconGrid';
import ProductCard from '@/components/common/ProductCard';
import ProductFilters from '@/components/common/ProductFilters';
import { CategoryWithProducts, FilterOption, Product } from '../types';
import styles from './CategoriesClient.module.css';

interface CategoriesClientProps {
  categories: CategoryWithProducts[];
  allProducts: Product[];
  filterOptions: FilterOption[];
  sortOptions: FilterOption[];
  initialCategoryFilter?: string;
}

export default function CategoriesClient({
  categories,
  allProducts,
  filterOptions,
  sortOptions,
  initialCategoryFilter,
}: CategoriesClientProps) {
  // 초기 카테고리 ID 설정
  const getInitialCategoryId = () => {
    if (!initialCategoryFilter || initialCategoryFilter === '0') return 0;
    return parseInt(initialCategoryFilter);
  };

  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(getInitialCategoryId());
  const [currentFilter, setCurrentFilter] = useState('전체');

  const [currentSort, setCurrentSort] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 카테고리 선택 핸들러
  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
  };

  // 필터링된 상품 계산
  const filteredAndSortedProducts = useMemo(() => {
    let products = allProducts;

    // 카테고리 필터링
    if (selectedCategoryId !== 0) {
      products = products.filter((product) => product.categoryId === selectedCategoryId);
    }

    // 추가 필터링 (할인상품, 신상품 등)
    if (currentFilter !== '전체') {
      products = products.filter((product) => {
        switch (currentFilter) {
          case '할인상품':
            return product.discount && product.discount > 0;
          case '신상품':
            return product.isNew;
          case '인기상품':
            return product.rating > 2;
          default:
            return true;
        }
      });
    }

    // 정렬
    products.sort((a, b) => {
      switch (currentSort) {
        case 'newest':
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'popular':
        default:
          return (b.rating || 0) - (a.rating || 0);
      }
    });

    return products;
  }, [allProducts, selectedCategoryId, currentFilter, currentSort]);

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
  };

  const handleSortChange = (sort: string) => {
    setCurrentSort(sort);
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  return (
    <div>
      <CategoryIconGrid
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onCategoryClick={handleCategoryClick}
        disableNavigation={true}
      />

      <div style={{ backgroundColor: '#f8f9fa' }}>
        <ProductFilters
          filterOptions={filterOptions}
          sortOptions={sortOptions}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onViewModeChange={handleViewModeChange}
          defaultFilter={currentFilter}
          defaultSort={currentSort}
          defaultViewMode={viewMode}
        />
        <div className={`${styles.productGrid} ${viewMode === 'list' ? styles.listView : ''}`}>
          {filteredAndSortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onWishlistToggle={(productId) => productId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
