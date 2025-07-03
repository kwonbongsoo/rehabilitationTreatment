'use client';

import ProductGrid from '@/components/common/ProductGrid';
import React from 'react';
import styles from './page.module.css';
import { useProductStore } from '@/domains/product/stores/useProductStore';
import { useCartActions } from '@/domains/cart/hooks';

export default function ProductsPage() {
  const { products } = useProductStore();
  const { addToCart } = useCartActions();

  const handleAddToCart = async (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      await addToCart({
        id: `${product.id}_${product.size}_${product.color}`,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>모든 상품</h1>
        <p className={styles.subtitle}>다양한 브랜드의 트렌디한 상품들을 만나보세요</p>
      </div>

      <div className={styles.productsWrapper}>
        <ProductGrid
          products={products}
          title=""
          onAddToCart={handleAddToCart}
          className={styles.productsGrid}
        />
      </div>
    </div>
  );
}
