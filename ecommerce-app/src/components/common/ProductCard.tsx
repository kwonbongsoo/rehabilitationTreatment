'use client';

import React from 'react';
import Link from 'next/link';
import OptimizedImage from './OptimizedImage';
import styles from './ProductCard.module.css';

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  isNew?: boolean;
  discount?: number;
  category?: string;
  description?: string; // 설명 추가
}

export interface ProductCardProps {
  product: Product;
  className?: string;
  onWishlistToggle?: (productId: number) => void;
  isWishlisted?: boolean;
  priority?: boolean;
}

export default function ProductCard({
  product,
  className = '',
  onWishlistToggle,
  isWishlisted = false,
  priority = false,
}: ProductCardProps) {
  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWishlistToggle) {
      onWishlistToggle(product.id);
    }
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('ko-KR')}원`;
  };

  const renderRating = () => {
    if (!product.rating) return null;
    return (
      <div className={styles.rating}>
        <span className={styles.ratingValue}>{product.rating}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFD700" className={styles.star}>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      </div>
    );
  };

  return (
    <div className={`${styles.productCard} ${className}`}>
      <Link href={`/product/${product.id}`} className={styles.productLink}>
        <div className={styles.imageContainer}>
          <OptimizedImage
            src={product.image}
            alt={product.name}
            width={200}
            height={200}
            className={styles.productImage}
            priority={priority}
          />

          {/* 배지들 */}
          <div className={styles.badges}>
            {product.isNew && <span className={styles.newBadge}>NEW</span>}
            {product.discount && (
              <span className={styles.discountBadge}>{Math.round(product.discount)}%</span>
            )}
          </div>

          {/* 찜하기 버튼 */}
          <button
            className={`${styles.wishlistButton} ${isWishlisted ? styles.wishlisted : ''}`}
            onClick={handleWishlistClick}
            aria-label="찜하기"
          >
            {isWishlisted ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF4757">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            )}
          </button>
        </div>

        <div className={styles.productInfo}>
          {/* 상품명과 레이팅을 한 줄에 배치 */}
          <div className={styles.nameAndRating}>
            <h3 className={styles.productName}>{product.name}</h3>
            {renderRating()}
          </div>

          {/* 상품 설명 추가 */}
          {product.description && <p className={styles.description}>{product.description}</p>}

          {/* 가격 정보 */}
          <div className={styles.priceContainer}>
            <span className={styles.price}>{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
