import React from 'react';
import Link from 'next/link';
import OptimizedImage from '@/components/common/OptimizedImage';
import styles from './PromotionHero.module.css';

interface PromotionHeroProps {
    title: string;
    subtitle: string;
    description: string;
    backgroundImage: string;
    ctaText: string;
    ctaLink: string;
    discount?: string;
    validUntil?: string;
}

export default function PromotionHero({
    title,
    subtitle,
    description,
    backgroundImage,
    ctaText,
    ctaLink,
    discount,
    validUntil
}: PromotionHeroProps) {
    return (
        <section className={styles.heroSection}>
            <div className={styles.backgroundContainer}>
                <OptimizedImage
                    src={backgroundImage}
                    alt={title}
                    fill
                    priority
                    className={styles.backgroundImage}
                    sizes="100vw"
                />
                <div className={styles.overlay}></div>
            </div>

            <div className={styles.content}>
                <div className={styles.container}>
                    {discount && (
                        <div className={styles.discountBadge}>
                            최대 {discount}% 할인
                        </div>
                    )}

                    <h1 className={styles.title}>{title}</h1>
                    <h2 className={styles.subtitle}>{subtitle}</h2>
                    <p className={styles.description}>{description}</p>

                    {validUntil && (
                        <div className={styles.validity}>
                            {validUntil}까지 진행
                        </div>
                    )}

                    <Link href={ctaLink} className={styles.ctaButton}>
                        {ctaText}
                    </Link>
                </div>
            </div>
        </section>
    );
}
