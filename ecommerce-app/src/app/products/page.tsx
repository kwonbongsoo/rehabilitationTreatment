'use client';

import React, { ReactElement } from 'react';
import styles from '@/styles/products/MobileProducts.module.css';
import { useProductStore } from '@/domains/product/stores/useProductStore';
import { useCartActions } from '@/domains/cart/hooks';
import OptimizedImageNext from '@/components/common/OptimizedImageNext';

export default function ProductsPage(): ReactElement {
  const { products } = useProductStore();
  const { addToCart } = useCartActions();

  const handleAddToCart = async (productId: number): Promise<void> => {
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
    <main className={styles.mobileProducts}>
      <div className={styles.header}>
        <h1 className={styles.title}>All Products</h1>
      </div>

      <div className={styles.productsContent}>
        <div className={styles.productsGrid}>
          {products.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.productImageContainer}>
                <OptimizedImageNext
                  src={product.image}
                  alt={product.name}
                  width={500}
                  height={500}
                  className={styles.productImage}
                />
                <button className={styles.favoriteButton}>♡</button>
              </div>
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productPrice}>${product.price}</p>
                <button
                  className={styles.addToCartButton}
                  onClick={() => handleAddToCart(product.id)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
