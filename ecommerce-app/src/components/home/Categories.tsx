import Link from 'next/link';
import SectionTitle from '@/components/common/SectionTitle';
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

export default function Categories({ title, categories }: CategoriesProps) {
    if (categories.length === 0) return null;

    return (
        <section className={styles.categorySection}>
            {title && <SectionTitle title={title} />}
            <div className={styles.categoriesWrapper}>
                <div className={styles.categories}>
                    {categories.map(category => (
                        <Link href={category.link} key={category.id} className={styles.category}>
                            <span className={styles.categoryIcon}>{category.icon}</span>
                            <span className={styles.categoryName}>{category.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}