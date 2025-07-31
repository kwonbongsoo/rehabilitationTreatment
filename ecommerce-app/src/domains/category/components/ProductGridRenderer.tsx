'use client';

import { useMemo } from 'react';
import ProductCard from '@/components/common/ProductCard';
import { useCategoryContext } from '@/domains/category/context/CategoryContext';
import styles from './ProductGridRenderer.module.css';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  tags?: string[];
  categoryId?: number;
}

interface ProductGridRendererProps {
  allProducts: Product[];
}

export default function ProductGridRenderer({ allProducts }: ProductGridRendererProps) {
  const { selectedCategoryId, currentFilter, currentSort, viewMode } = useCategoryContext();

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
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'popular':
        default:
          return (b.rating || 0) - (a.rating || 0);
      }
    });

    return products;
  }, [allProducts, selectedCategoryId, currentFilter, currentSort]);

  const gridClasses = `${styles.productGrid} ${viewMode === 'list' ? styles.listView : ''}`;

  return (
    <div>
      <div 
        className={gridClasses} 
        data-view-mode={viewMode}
      >
        {filteredAndSortedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onWishlistToggle={(productId) => productId}
          />
        ))}
      </div>
    </div>
  );
}
