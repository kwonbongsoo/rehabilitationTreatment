import React from 'react';
import Link from 'next/link';
import OptimizedImage from '@/components/common/OptimizedImage';
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
    viewAllLink = '/collections/summer-sale'
}: PromotionGridProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ko-KR').format(price);
    };

    const calculateDiscount = (price: number, originalPrice: number) => {
        return Math.round(((originalPrice - price) / originalPrice) * 100);
    };

    return (
        <section className={styles.gridSection}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>

                <div className={`${styles.grid} ${styles[`grid${columns}`]}`}>
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            className={styles.productCard}
                        >
                            <div className={styles.imageContainer}>
                                <OptimizedImage
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className={styles.productImage}
                                    sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1200px) 25vw, 300px"
                                />

                                {product.badge && (
                                    <div className={styles.badge}>
                                        {product.badge}
                                    </div>
                                )}

                                {product.discount && (
                                    <div className={styles.discountBadge}>
                                        -{product.discount}%
                                    </div>
                                )}
                            </div>

                            <div className={styles.productInfo}>
                                <h3 className={styles.productName}>{product.name}</h3>

                                {product.rating && (
                                    <div className={styles.rating}>
                                        <div className={styles.stars}>
                                            {[...Array(5)].map((_, i) => (
                                                <span
                                                    key={i}
                                                    className={`${styles.star} ${i < Math.floor(product.rating!) ? styles.filled : ''}`}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                        {product.reviewCount && (
                                            <span className={styles.reviewCount}>
                                                ({product.reviewCount})
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div className={styles.priceContainer}>
                                    <span className={styles.price}>
                                        {formatPrice(product.price)}원
                                    </span>
                                    {product.originalPrice && (
                                        <span className={styles.originalPrice}>
                                            {formatPrice(product.originalPrice)}원
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

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
