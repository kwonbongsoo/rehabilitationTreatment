import Link from 'next/link';
import Image from 'next/image';
import SectionTitle from '@/components/common/SectionTitle';
import Rating from '@/components/common/Rating';
import styles from '@/styles/home/Products.module.css';

interface FeaturedProductsProps {
    title?: string;
    products: {
        id: number;
        name: string;
        price: number;
        discount: number;
        image: string;
        rating: number;
        reviewCount: number;
    }[];
}

export default function FeaturedProducts({
    title,
    products
}: FeaturedProductsProps) {
    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section className={styles.productsSection}>
            {title && <SectionTitle title={title} />}
            <div className={styles.productGrid}>
                {products.map((product) => (
                    <div key={product.id} className={styles.productCard}>
                        <Link href={`/products/${product.id}`}>
                            <div className={styles.productImageContainer}>
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 250px"
                                    className={styles.productImage}
                                    quality={80}
                                />
                                {product.discount > 0 && (
                                    <div className={styles.discountBadge}>
                                        -{product.discount}%
                                    </div>
                                )}
                            </div>
                            <div className={styles.productInfo}>
                                <h3 className={styles.productName}>{product.name}</h3>
                                <div className={styles.priceContainer}>
                                    {product.discount > 0 ? (
                                        <>
                                            <span className={styles.originalPrice}>
                                                {product.price.toLocaleString()}원
                                            </span>
                                            <span className={styles.discountedPrice}>
                                                {Math.round(
                                                    product.price *
                                                    (1 - product.discount / 100)
                                                ).toLocaleString()}
                                                원
                                            </span>
                                        </>
                                    ) : (
                                        <span className={styles.price}>
                                            {product.price.toLocaleString()}원
                                        </span>
                                    )}
                                </div>
                                <Rating
                                    rating={product.rating}
                                    reviewCount={product.reviewCount}
                                />
                            </div>
                        </Link>
                        <button className={styles.addToCartButton}>
                            장바구니에 추가
                        </button>
                    </div>
                ))}
            </div>
            <div className={styles.viewAllContainer}>
                <Link href="/products" className={styles.viewAllButton}>
                    모든 상품 보기
                </Link>
            </div>
        </section>
    );
}