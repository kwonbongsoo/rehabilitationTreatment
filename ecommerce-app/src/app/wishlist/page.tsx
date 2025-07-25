'use client';

import OptimizedImage from '@/components/common/OptimizedImage';
import Link from 'next/link';
import React from 'react';
import { FiHeart, FiTrash2 } from 'react-icons/fi';
import styles from '@/styles/wishlist/MobileWishlist.module.css';
import { useWishlistStore } from '@/domains/wishlist/stores';
import { useWishlistActions } from '@/domains/wishlist/hooks';
import { useCartActions } from '@/domains/cart/hooks';

export default function WishlistPage() {
  const { wishlistItems } = useWishlistStore();
  const { removeFromWishlist } = useWishlistActions();
  const { addToCart } = useCartActions();

  const moveToCart = async (id: number) => {
    const item = wishlistItems.find((item) => item.id === id);
    if (item) {
      await addToCart({
        id: `${item.id}_${item.size}_${item.color}`,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1,
      });
      // 장바구니에 추가 후 위시리스트에서 제거
      removeFromWishlist(id);
    }
  };

  return (
    <main className={styles.mobileWishlist}>
      <div className={styles.header}>
        <h1 className={styles.title}>Wishlist</h1>
      </div>

      {wishlistItems.length === 0 ? (
        <div className={styles.emptyState}>
          <FiHeart size={60} className={styles.emptyIcon} />
          <h2>Your wishlist is empty</h2>
          <p>Save items you love to buy later</p>
          <Link href="/products" className={styles.shopButton}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className={styles.wishlistContent}>
          <div className={styles.itemCount}>
            {wishlistItems.length} item{wishlistItems.length > 1 ? 's' : ''}
          </div>

          <div className={styles.wishlistGrid}>
            {wishlistItems.map((item) => (
              <div key={item.id} className={styles.wishlistItem}>
                <div className={styles.productImageContainer}>
                  <OptimizedImage
                    src={item.image}
                    alt={item.name}
                    width={200}
                    height={200}
                    className={styles.productImage}
                  />
                  <button
                    className={styles.removeButton}
                    onClick={() => removeFromWishlist(item.id)}
                    aria-label="Remove from wishlist"
                  >
                    <FiTrash2 size={16} />
                  </button>
                  {!item.inStock && (
                    <div className={styles.outOfStockBadge}>
                      Out of Stock
                    </div>
                  )}
                </div>
                
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{item.name}</h3>
                  <p className={styles.productPrice}>${item.price}</p>
                  
                  {item.inStock ? (
                    <button
                      className={styles.addToCartButton}
                      onClick={() => moveToCart(item.id)}
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <button className={styles.notifyButton}>
                      Notify When Available
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
