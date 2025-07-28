import Link from 'next/link';
import styles from '@/styles/home/Promotion.module.css';

interface PromotionProps {
  title: string;
  description: string;
  link: string;
  buttonText: string;
}

export default function Promotion({ title, description, link, buttonText }: PromotionProps) {
  return (
    <section className={styles.promotionSection}>
      <div className={styles.promotionCard}>
        <div className={styles.promotionContent}>
          <h2 className={styles.promotionTitle}>{title}</h2>
          <p className={styles.promotionDescription}>{description}</p>
          <Link href={link} className={styles.promotionButton} prefetch={false}>
            {buttonText}
          </Link>
        </div>
        <div className={styles.promotionDecoration}>
          <div className={styles.circle1}></div>
          <div className={styles.circle2}></div>
        </div>
      </div>
    </section>
  );
}
