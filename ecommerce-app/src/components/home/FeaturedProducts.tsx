import React from 'react';
import Link from 'next/link';
import styles from './FeaturedProducts.module.css';
import OptimizedImage from '@/components/common/OptimizedImage';
import Rating from '@/components/common/Rating';

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

export default function FeaturedProducts({
    title,
    products
}: FeaturedProductsProps) {
    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section className={styles.section}>
            <h2 className={styles.title}>{title}</h2>
            <div className={styles.productGrid}>
                {products.map((product) => (
                    <div key={product.id} className={styles.productCard}>
                        <Link href={`/product/${product.id}`} className={styles.productLink} prefetch={false}>
                            <div className={styles.productImage}>
                                <OptimizedImage
                                    src={product.image}
                                    alt={product.name}
                                    width={500}
                                    height={500}
                                    className={styles.image}
                                />
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