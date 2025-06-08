import React from 'react';
import OptimizedImage from '@/components/common/OptimizedImage';
import SectionTitle from '@/components/common/SectionTitle';
import styles from '@/styles/home/Brands.module.css';

interface BrandsProps {
    title?: string;
    logos: {
        id: number;
        name: string;
        image?: string;
    }[];
}

export default function Brands({ title, logos }: BrandsProps) {
    return (
        <section className={styles.brandsSection}>
            {title && <SectionTitle title={title} />}
            <div className={styles.brandLogos}>
                {logos.map(logo => (
                    <div key={logo.id} className={styles.brandLogo}>
                        {logo.image ? (
                            <div className={styles.brandImageContainer}>
                                <OptimizedImage
                                    src={logo.image}
                                    alt={logo.name}
                                    width={120}
                                    height={80}
                                    className={styles.brandImage}
                                />
                            </div>
                        ) : (
                            <div className={styles.brandLogoPlaceholder}>{logo.name}</div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}