'use client';

import ProductGrid from '@/components/common/ProductGrid';
import type { Product } from '@/components/common/ProductCard';

interface CollectionProductGridProps {
  products: Product[];
}

export default function CollectionProductGrid({ products }: CollectionProductGridProps) {
  const handleWishlistToggle = (productId: number) => {
    console.log('Wishlist toggle for product:', productId);
    // 실제 위시리스트 토글 로직 구현
  };

  const isWishlisted = (_productId: number) => {
    // 실제 위시리스트 상태 확인 로직
    return false;
  };

  return (
    <ProductGrid
      products={products}
      showFilters={false}
      gridType="default"
      onWishlistToggle={handleWishlistToggle}
      isWishlisted={isWishlisted}
    />
  );
}
