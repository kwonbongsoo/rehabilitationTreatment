'use client';

import React from 'react';
import Link from 'next/link';
import ProductCard, { Product } from '@/components/common/ProductCard';
import styles from '@/styles/home/NewArrivals.module.css';

interface NewArrivalsProps {
  title: string;
  products: Product[];
}

export default function NewArrivals({ title, products }: NewArrivalsProps) {
  const handleWishlistToggle = (productId: number) => productId;

  return (
    <section className={styles.newArrivalsSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <Link href="/products" className={styles.viewAllLink}>
          see all
        </Link>
      </div>

      <div className={styles.productsGrid}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onWishlistToggle={handleWishlistToggle}
            className={styles.productCard}
            priority={false}
          />
        ))}
      </div>
    </section>
  );
}
