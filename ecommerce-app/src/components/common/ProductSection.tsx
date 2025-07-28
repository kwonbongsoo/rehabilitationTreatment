'use client';

import React from 'react';
import Link from 'next/link';
import ProductCard, { Product } from './ProductCard';
import styles from './ProductSection.module.css';

interface ProductSectionProps {
  title: string;
  products: Product[];
  showViewAll?: boolean;
  viewAllText?: string;
  viewAllLink?: string;
  className?: string;
  onWishlistToggle?: (productId: number) => void;
  isFirstSection?: boolean;
}

export default function ProductSection({
  title,
  products,
  showViewAll = true,
  viewAllText = 'see all',
  viewAllLink = '/products',
  className = '',
  onWishlistToggle,
  isFirstSection = false,
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
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            onWishlistToggle={handleWishlistToggle}
            priority={isFirstSection && index < 4}
          />
        ))}
      </div>
    </section>
  );
}
