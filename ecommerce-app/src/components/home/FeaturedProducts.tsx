import ProductGrid from '@/components/common/ProductGrid';
import styles from '@/styles/home/FeaturedProducts.module.css';
import { calculateDiscountedPrice } from '@/utils/formatters';
import Link from 'next/link';

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
  const transformedProducts = products.map((product) => {
    const discountedPrice =
      product.discount > 0
        ? calculateDiscountedPrice(product.price, Math.min(Math.max(product.discount, 0), 100))
        : product.price;

    return {
      ...product,
      price: discountedPrice,
      ...(product.discount > 0 && { originalPrice: product.price }),
    };
  });

  const handleAddToCart = (productId: number) => {
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
        {...(styles.featuredGrid && { className: styles.featuredGrid })}
      />
      <div className={styles.viewAllContainer}>
        <Link href="/products" className={styles.viewAllButton}>
          모든 상품 보기
        </Link>
      </div>
    </section>
  );
}
