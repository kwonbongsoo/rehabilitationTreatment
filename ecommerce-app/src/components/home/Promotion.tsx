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
    <section className={styles.promoSection}>
      <div className={styles.promoCard}>
        <div className={styles.promoContent}>
          <h2 className={styles.promoTitle}>{title}</h2>
          <p className={styles.promoText}>{description}</p>
          <Link href={link} className={styles.promoButton} prefetch={false}>
            {buttonText}
          </Link>
        </div>
      </div>
    </section>
  );
}
