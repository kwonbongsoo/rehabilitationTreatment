'use client';

import { useState } from 'react';
import OptimizedImageNext from '@/components/common/OptimizedImageNext';
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
    'https://static.kbs-cdn.shop/image/promotion.jpg',
    'https://static.kbs-cdn.shop/image/promotion.jpg',
    'https://static.kbs-cdn.shop/image/promotion.jpg',
    'https://static.kbs-cdn.shop/image/promotion.jpg',
    'https://static.kbs-cdn.shop/image/promotion.jpg',
  ],
  colors: [
    { id: 'green', name: 'Green', image: 'https://static.kbs-cdn.shop/image/promotion.jpg' },
    { id: 'black', name: 'Black', image: 'https://static.kbs-cdn.shop/image/promotion.jpg' },
    { id: 'red', name: 'Red', image: 'https://static.kbs-cdn.shop/image/promotion.jpg' },
    { id: 'blue', name: 'Blue', image: 'https://static.kbs-cdn.shop/image/promotion.jpg' },
    { id: 'pink', name: 'Pink', image: 'https://static.kbs-cdn.shop/image/promotion.jpg' },
  ],
  sizes: ['S', 'M', 'L', 'XL', '2X'],
  rating: 4.9,
  isWishlisted: false,
};

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = params;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(mockProduct.colors[0]);
  const [selectedSize, setSelectedSize] = useState('');
  // const [quantity, setQuantity] = useState(1); // 제거

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('사이즈를 선택해주세요.');
      return;
    }
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      alert('사이즈를 선택해주세요.');
      return;
    }
  };

  return (
    <div className={styles.productDetail}>
      {/* 상품 이미지 */}
      <div className={styles.imageSection}>
        <div className={styles.mainImageContainer}>
          <OptimizedImageNext
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
              aria-label={`${id} - ${index}`}
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
              <OptimizedImageNext
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
