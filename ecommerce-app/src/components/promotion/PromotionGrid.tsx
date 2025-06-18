import React from 'react';
import Link from 'next/link';
import ProductGrid from '@/components/common/ProductGrid';
import styles from './PromotionGrid.module.css';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  slug: string;
  badge?: string;
  rating?: number;
  reviewCount?: number;
}

interface PromotionGridProps {
  title: string;
  subtitle?: string;
  products: Product[];
  columns?: 2 | 3 | 4;
  showViewAll?: boolean;
  viewAllLink?: string;
}

export default function PromotionGrid({
  title,
  subtitle,
  products,
  columns = 4,
  showViewAll = true,
  viewAllLink = '/collections/summer-sale',
}: PromotionGridProps) {
  // 상품 데이터를 ProductCard 형식으로 변환
  const transformedProducts = products.map((product) => ({
    ...product,
    // slug가 있으면 그대로 사용, 없으면 id 사용
    id: product.id,
  }));

  const handleAddToCart = (productId: number) => {
    console.log('장바구니에 상품 추가:', productId);
    // 실제 장바구니 추가 로직 구현
  };

  return (
    <section className={styles.gridSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>

        <ProductGrid
          products={transformedProducts}
          showFilters={false}
          variant="featured"
          columns={columns}
          gap="large"
          imageHeight={250}
          onAddToCart={handleAddToCart}
          className={styles.promotionGrid}
        />

        {showViewAll && (
          <div className={styles.viewAllContainer}>
            <Link href={viewAllLink} className={styles.viewAllButton}>
              전체 상품 보기
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
