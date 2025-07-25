'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OptimizedImage from '@/components/common/OptimizedImage';
import { Button } from '@/components/common/Button';
import styles from './page.module.css';
import Link from 'next/link';

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

// 가라 데이터
const mockProduct = {
  id: 1,
  name: 'Chill Mode Tee',
  price: 129.0,
  originalPrice: 159.0,
  description:
    'A stylish and comfortable T-shirt made from high-quality fabric, ensuring all-day versatile look. Learn more',
  images: [
    '/images/products/promotion.jpg',
    '/images/products/promotion.jpg',
    '/images/products/promotion.jpg',
    '/images/products/promotion.jpg',
    '/images/products/promotion.jpg',
  ],
  colors: [
    { id: 'green', name: 'Green', image: '/images/products/promotion.jpg' },
    { id: 'black', name: 'Black', image: '/images/products/promotion.jpg' },
    { id: 'red', name: 'Red', image: '/images/products/promotion.jpg' },
    { id: 'blue', name: 'Blue', image: '/images/products/promotion.jpg' },
    { id: 'pink', name: 'Pink', image: '/images/products/promotion.jpg' },
  ],
  sizes: ['S', 'M', 'L', 'XL', '2X'],
  rating: 4.9,
  isWishlisted: false,
};

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const router = useRouter();
  const { id } = params;
  console.log('id', id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(mockProduct.colors[0]);
  const [selectedSize, setSelectedSize] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(mockProduct.isWishlisted);
  // const [quantity, setQuantity] = useState(1); // 제거

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('사이즈를 선택해주세요.');
      return;
    }
    console.log('Add to cart:', {
      product: mockProduct,
      color: selectedColor,
      size: selectedSize,
      quantity: 1, // 고정값 사용
    });
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      alert('사이즈를 선택해주세요.');
      return;
    }
    console.log('Buy now:', {
      product: mockProduct,
      color: selectedColor,
      size: selectedSize,
      quantity: 1, // 고정값 사용
    });
  };

  return (
    <div className={styles.productDetail}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
        <h1 className={styles.headerTitle}>Details</h1>
        <button
          className={`${styles.wishlistButton} ${isWishlisted ? styles.wishlisted : ''}`}
          onClick={handleWishlistToggle}
        >
          {isWishlisted ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF4757">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
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

      {/* 상품 이미지 */}
      <div className={styles.imageSection}>
        <div className={styles.mainImageContainer}>
          <OptimizedImage
            src={mockProduct.images[selectedImageIndex] || ''}
            alt={mockProduct.name}
            width={400}
            height={400}
            className={styles.mainImage}
          />
        </div>

        {/* 이미지 인디케이터 */}
        <div className={styles.imageIndicators}>
          {mockProduct.images.map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${selectedImageIndex === index ? styles.active : ''}`}
              onClick={() => setSelectedImageIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* 색상 선택 */}
      <div className={styles.colorSection}>
        <div className={styles.colorOptions}>
          {mockProduct.colors.map((color) => (
            <button
              key={color.id}
              className={`${styles.colorOption} ${selectedColor?.id === color.id ? styles.selected : ''}`}
              onClick={() => setSelectedColor(color)}
            >
              <OptimizedImage
                src={color.image}
                alt={color.name}
                width={50}
                height={50}
                className={styles.colorImage}
              />
            </button>
          ))}
        </div>
      </div>

      {/* 상품 정보 */}
      <div className={styles.productInfo}>
        <div className={styles.productHeader}>
          <h2 className={styles.productName}>{mockProduct.name}</h2>
          <div className={styles.priceContainer}>
            <span className={styles.price}>{mockProduct.price.toLocaleString('ko-KR')}원</span>
            {mockProduct.originalPrice && (
              <span className={styles.originalPrice}>
                {mockProduct.originalPrice.toLocaleString('ko-KR')}원
              </span>
            )}
          </div>
        </div>

        {/* 사이즈 선택 */}
        <div className={styles.sizeSection}>
          <div className={styles.sizeHeader}>
            <span className={styles.sizeLabel}>Select size</span>
            <Link className={styles.sizeChartButton} href="/size-guide">
              Size Guide
            </Link>
          </div>
          <div className={styles.sizeOptions}>
            {mockProduct.sizes.map((size) => (
              <button
                key={size}
                className={`${styles.sizeOption} ${selectedSize === size ? styles.selected : ''}`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* 상품 설명 */}
        <div className={styles.description}>
          <p className={styles.descriptionText}>{mockProduct.description}</p>
        </div>
      </div>

      {/* 하단 버튼들 */}
      <div className={styles.bottomActions}>
        <button className={styles.cartButton} onClick={handleAddToCart}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="m1 1 4 4 4.5 11h7l4-8H6" />
          </svg>
        </button>
        <Button className={styles.buyButton} variant="primary" onClick={handleBuyNow}>
          Buy now
        </Button>
      </div>
    </div>
  );
}
