import OptimizedImage from '@/components/common/OptimizedImage';
import { GetServerSideProps } from 'next';
import React from 'react';
import styles from './Category.module.css';

interface CategoryPageProps {
  category: string;
}

const CategoryPage: React.FC<CategoryPageProps> = ({ category }) => {
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
  ];
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{category} 카테고리</h1>
      <div className={styles.productsGrid}>
        {mockProducts.map((product) => (
          <div key={product.id} className={styles.productCard}>
            <div className={styles.productImage}>
              <OptimizedImage src={product.image} alt={product.name} />
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
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const category = params?.slug as string;

  return {
    props: {
      category: category || 'unknown',
    },
  };
};

export default CategoryPage;
