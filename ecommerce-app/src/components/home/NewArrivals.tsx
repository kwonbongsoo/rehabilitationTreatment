import Link from 'next/link';
import Image from 'next/image';
import SectionTitle from '@/components/common/SectionTitle';
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
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill // width/height 대신 fill 사용
                                sizes="(max-width: 768px) 100vw, 300px" // 반응형 이미지 크기
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