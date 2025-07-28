'use client';

import ProductGrid from '@/components/common/ProductGrid';
import type { Product } from '@/components/common/ProductCard';

interface CollectionProductGridProps {
  products: Product[];
}

export default function CollectionProductGrid({ products }: CollectionProductGridProps) {
  const handleWishlistToggle = (productId: number) => productId;

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
