import OptimizedImage from '@/components/common/OptimizedImage';
import React from 'react';
import styles from './page.module.css';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug: category } = params;

  // Mock products for the category
  const mockProducts = [
    {
      id: 1,
      name: `${category} 상품 1`,
      price: 29900,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
      rating: 4.5,
    },
    {
      id: 2,
      name: `${category} 상품 2`,
      price: 39900,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
      rating: 4.3,
    },
    {
      id: 3,
      name: `${category} 상품 3`,
      price: 49900,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
      rating: 4.7,
    },
    {
      id: 4,
      name: `${category} 상품 4`,
      price: 59900,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
      rating: 4.6,
    },
    {
      id: 5,
      name: `${category} 상품 5`,
      price: 69900,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
      rating: 4.8,
    },
    {
      id: 6,
      name: `${category} 상품 6`,
      price: 79900,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
      rating: 4.4,
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{category} 카테고리</h1>
        <p className={styles.subtitle}>{category} 관련 다양한 상품들을 만나보세요</p>
      </div>

      <div className={styles.filterSection}>
        <div className={styles.resultCount}>총 {mockProducts.length}개의 상품</div>
        <div className={styles.sortOptions}>
          <select className={styles.sortSelect}>
            <option value="popularity">인기순</option>
            <option value="price-low">낮은 가격순</option>
            <option value="price-high">높은 가격순</option>
            <option value="rating">평점순</option>
            <option value="newest">최신순</option>
          </select>
        </div>
      </div>

      <div className={styles.productsGrid}>
        {mockProducts.map((product) => (
          <div key={product.id} className={styles.productCard}>
            <div className={styles.productImage}>
              <OptimizedImage
                src={product.image}
                alt={product.name}
                width={300}
                height={300}
                className={styles.image}
              />
            </div>
            <div className={styles.productInfo}>
              <h3 className={styles.productName}>{product.name}</h3>
              <p className={styles.productPrice}>{product.price.toLocaleString()}원</p>
              <div className={styles.productRating}>⭐ {product.rating}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 메타데이터 생성
export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = params;

  return {
    title: `${slug} 카테고리 | 쇼핑몰`,
    description: `${slug} 카테고리의 다양한 상품들을 확인해보세요.`,
  };
}
