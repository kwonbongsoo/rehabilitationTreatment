'use client';

import React from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';
import { Product } from '@/domains/product/types/product';
import styles from './ProductSection.module.css';

interface ProductSectionProps {
  title: string;
  products: Product[];
  showViewAll?: boolean;
  viewAllText?: string;
  viewAllLink?: string;
  className?: string;
  onWishlistToggle?: (productId: number) => void;
  eagerCount?: number; // eager 로딩할 상품 개수
  allLazy?: boolean; // 모두 lazy 로딩할지 여부
}

export default function ProductSection({
  title,
  products,
  showViewAll = true,
  viewAllText = 'see all',
  viewAllLink = '/products',
  className = '',
  onWishlistToggle,
  eagerCount = 2,
  allLazy = false,
}: ProductSectionProps) {
  const handleWishlistToggle = (productId: number) => {
    onWishlistToggle?.(productId);
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className={`${styles.productSection} ${className}`}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {showViewAll && (
          <Link href={viewAllLink} className={styles.viewAllLink}>
            {viewAllText}
          </Link>
        )}
      </div>

      <div className={styles.productsGrid}>
        {products.map((product, index) => {
          const shouldBeEager = !allLazy && index < eagerCount;
          const shouldBeLazy = allLazy || index >= eagerCount;

          return (
            <ProductCard
              key={product.id}
              product={product}
              onWishlistToggle={handleWishlistToggle}
              priority={shouldBeEager}
              lazy={shouldBeLazy}
            />
          );
        })}
      </div>
    </section>
  );
}
