import Link from 'next/link';
import styles from '@/styles/home/Categories.module.css';

interface CategoriesProps {
  title?: string; // 선택적 prop으로 정의
  categories: {
    id: number;
    name: string;
    icon: string;
    link: string;
  }[];
}

export default function Categories({ title: _title, categories }: CategoriesProps) {
  if (categories.length === 0) return null;

  return (
    <section className={styles.categorySection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Category</h2>
        <Link href="/categories" className={styles.seeAllLink}>
          see all
        </Link>
      </div>
      <div className={styles.categoriesWrapper}>
        <div className={styles.categories}>
          {categories.map((category) => (
            <Link href={category.link} key={category.id} className={styles.category}>
              <div className={styles.categoryIconContainer}>
                <span className={styles.categoryIcon}>{category.icon}</span>
              </div>
              <span className={styles.categoryName}>{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
