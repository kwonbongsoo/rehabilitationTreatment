import React from 'react';
import Link from 'next/link';
import OptimizedImage from './OptimizedImage';
import Rating from './Rating';
import { formatPrice } from '@/utils/formatters';
import styles from './ProductCard.module.css';

export interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    rating?: number;
    reviewCount?: number;
    reviews?: number;
    sales?: number;
    category?: string;
    badge?: string;
    discount?: number;
    isNew?: boolean;
    onSale?: boolean;
  };
  variant?: 'default' | 'compact' | 'featured' | 'bestseller';
  showAddToCart?: boolean;
  showRating?: boolean;
  showSalesInfo?: boolean;
  showCategory?: boolean;
  imageHeight?: number;
  className?: string;
  onAddToCart?: (productId: number) => void;
}

export default function ProductCard({
  product,
  variant = 'default',
  showAddToCart = true,
  showRating = true,
  showSalesInfo = false,
  showCategory = false,
  imageHeight = 250,
  className = '',
  onAddToCart,
}: ProductCardProps) {
  const {
    id,
    name,
    price,
    originalPrice,
    image,
    rating,
    reviewCount,
    reviews,
    sales,
    category,
    badge,
    discount,
    isNew,
    onSale,
  } = product;

  const cardClass = `${styles.productCard} ${styles[variant]} ${className}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(id);
    }
  };

  const renderBadges = () => (
    <>
      {badge && <span className={styles.badge}>{badge}</span>}
      {isNew && <span className={`${styles.badge} ${styles.newBadge}`}>NEW</span>}
      {onSale && <span className={`${styles.badge} ${styles.saleBadge}`}>SALE</span>}
      {discount && discount > 0 && (
        <span className={`${styles.badge} ${styles.discountBadge}`}>-{discount}%</span>
      )}
    </>
  );

  const renderPrice = () => (
    <div className={styles.priceContainer}>
      {originalPrice ? (
        <>
          <span className={styles.originalPrice}>{formatPrice(originalPrice)}</span>
          <span className={styles.price}>{formatPrice(price)}</span>
        </>
      ) : (
        <span className={styles.price}>{formatPrice(price)}</span>
      )}
    </div>
  );

  const renderRating = () => {
    if (!showRating || !rating) return null;

    const reviewCountToShow = reviewCount || reviews;
    return <Rating rating={rating} reviewCount={reviewCountToShow} />;
  };

  const renderSalesInfo = () => {
    if (!showSalesInfo || !sales) return null;

    return (
      <div className={styles.salesInfo}>
        <span className={styles.salesCount}>🔥 {sales}개 판매</span>
      </div>
    );
  };

  const renderCategory = () => {
    if (!showCategory || !category) return null;

    return <span className={styles.productCategory}>{category}</span>;
  };

  return (
    <div className={cardClass}>
      <Link href={`/products/${id}`} className={styles.productLink}>
        <div className={styles.imageContainer} style={{ height: imageHeight }}>
          <OptimizedImage
            src={image}
            alt={name}
            width={500}
            height={500}
            className={styles.productImage}
          />
          {renderBadges()}
        </div>

        <div className={styles.productInfo}>
          {renderCategory()}
          <h3 className={styles.productName}>{name}</h3>
          {renderPrice()}
          {renderRating()}
          {renderSalesInfo()}
        </div>
      </Link>

      {showAddToCart && (
        <button className={styles.addToCartButton} onClick={handleAddToCart}>
          장바구니 담기
        </button>
      )}
    </div>
  );
}
