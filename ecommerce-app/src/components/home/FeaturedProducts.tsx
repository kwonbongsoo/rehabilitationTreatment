import Link from 'next/link';
import ProductGrid from '@/components/common/ProductGrid';
import { calculateDiscountedPrice } from '@/utils/formatters';
import styles from './FeaturedProducts.module.css';

interface Product {
  id: number;
  name: string;
  price: number;
  discount: number;
  image: string;
  rating: number;
  reviewCount: number;
}

interface FeaturedProductsProps {
  title: string;
  products: Product[];
}

export default function FeaturedProducts({ title, products }: FeaturedProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  // 상품 데이터를 ProductCard 형식으로 변환
  const transformedProducts = products.map((product) => ({
    ...product,
    originalPrice: product.discount > 0 ? product.price : undefined,
    price:
      product.discount > 0
        ? calculateDiscountedPrice(product.price, Math.min(Math.max(product.discount, 0), 100))
        : product.price,
  }));

  const handleAddToCart = (productId: number) => {
    console.log('장바구니에 상품 추가:', productId);
    // 실제 장바구니 추가 로직 구현
  };

  return (
    <section className={styles.section}>
      <ProductGrid
        products={transformedProducts}
        title={title}
        showFilters={false}
        variant="featured"
        columns={4}
        gap="large"
        onAddToCart={handleAddToCart}
        className={styles.featuredGrid}
      />
      <div className={styles.viewAllContainer}>
        <Link href="/products" className={styles.viewAllButton}>
          모든 상품 보기
        </Link>
      </div>
    </section>
  );
}
