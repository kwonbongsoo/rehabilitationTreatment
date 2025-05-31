import Link from 'next/link';
import Image from 'next/image';
import SectionTitle from '@/components/common/SectionTitle';
import styles from '@/styles/home/NewArrivals.module.css';

// 더미 데이터
const newArrivals = [
    { id: 101, name: '플로랄 드레스', price: 79000, image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg' },
    { id: 102, name: '슬림핏 청바지', price: 69000, image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg' },
    { id: 103, name: '니트 스웨터', price: 59000, image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg' },
    { id: 104, name: '캐주얼 슬립온', price: 49000, image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg' },
];

export default function NewArrivals() {
    return (
        <section className={styles.newArrivalsSection}>
            <SectionTitle title="신상품" />
            <div className={styles.newArrivalsGrid}>
                {newArrivals.map(product => (
                    <Link href={`/products/${product.id}`} key={product.id} className={styles.newArrivalCard}>
                        <div className={styles.newArrivalImageContainer}>
                            <img
                                src={product.image}
                                alt={product.name}
                                className={styles.newArrivalImage}
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