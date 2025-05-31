import Link from 'next/link';
import styles from '@/styles/home/Promotion.module.css';

export default function Promotion() {
    return (
        <section className={styles.promoSection}>
            <div className={styles.promoCard}>
                <div className={styles.promoContent}>
                    <h2 className={styles.promoTitle}>여름 시즌 특별 프로모션</h2>
                    <p className={styles.promoText}>최대 50% 할인된 가격으로 여름 필수 아이템을 준비하세요!</p>
                    <Link href="/promotion/summer" className={styles.promoButton}>
                        자세히 보기
                    </Link>
                </div>
            </div>
        </section>
    );
}