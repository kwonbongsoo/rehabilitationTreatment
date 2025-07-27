'use client';

import React from 'react';
import Link from 'next/link';
import ProductCard, { Product } from '@/components/common/ProductCard';
import styles from '@/styles/home/FeaturedProducts.module.css';

interface FeaturedProduct extends Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  isNew?: boolean;
  discount?: number;
}

interface FeaturedProductsProps {
  title: string;
  products: FeaturedProduct[];
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ title, products }) => {
  const handleWishlistToggle = (productId: number) => {
    console.log('Toggle wishlist for product:', productId);
    // 위시리스트 토글 로직 구현
  };

  return (
    <section className={styles.featuredSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <Link href="/products" className={styles.viewAllLink}>
          see all
        </Link>
      </div>

      <div className={styles.productsGrid}>
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            onWishlistToggle={handleWishlistToggle}
            className={styles.productCard || ''}
            priority={index < 2}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
