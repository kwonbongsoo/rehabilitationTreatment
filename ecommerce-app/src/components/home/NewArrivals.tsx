import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SectionTitle from '@/components/common/SectionTitle';
import OptimizedImage from '@/components/common/OptimizedImage';
import styles from '@/styles/home/NewArrivals.module.css';

interface NewArrivalsProps {
    title?: string;
    products: {
        id: number;
        name: string;
        price: number;
        image: string;
    }[];
}

export default function NewArrivals({ title, products }: NewArrivalsProps) {
    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section className={styles.newArrivalsSection}>
            {title && <SectionTitle title={title} />}
            <div className={styles.newArrivalsGrid}>
                {products.map(product => (
                    <Link href={`/products/${product.id}`} key={product.id} className={styles.newArrivalCard}>
                        <div className={styles.newArrivalImageContainer}>
                            <OptimizedImage
                                src={product.image}
                                alt={product.name}
                                width={500}
                                height={500}
                                className={styles.newArrivalImage}
                                quality={80}
                            />
                        </div>
                        <div className={styles.newArrivalInfo}>
                            <h3 className={styles.newArrivalName}>{product.name}</h3>
                            <span className={styles.newArrivalPrice}>{product.price.toLocaleString()}원</span>
                            <span className={styles.newBadge}>NEW</span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}