import SectionTitle from '@/components/common/SectionTitle';
import styles from '@/styles/home/Brands.module.css';

export default function Brands() {
    return (
        <section className={styles.brandsSection}>
            <SectionTitle title="제휴 브랜드" />
            <div className={styles.brandLogos}>
                {Array(6).fill(0).map((_, index) => (
                    <div key={index} className={styles.brandLogo}>
                        <div className={styles.brandLogoPlaceholder}>브랜드 {index + 1}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}