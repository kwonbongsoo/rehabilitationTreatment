import Link from 'next/link';
import SectionTitle from '@/components/common/SectionTitle';
import styles from '@/styles/home/Categories.module.css';

// 더미 데이터
const categories = [
    { id: 1, name: '의류', icon: '👕', link: '/category/clothing' },
    { id: 2, name: '신발', icon: '👟', link: '/category/shoes' },
    { id: 3, name: '가방', icon: '👜', link: '/category/bags' },
    { id: 4, name: '액세서리', icon: '💍', link: '/category/accessories' },
    { id: 5, name: '뷰티', icon: '💄', link: '/category/beauty' },
    { id: 6, name: '홈리빙', icon: '🏠', link: '/category/home' },
    { id: 7, name: '디지털', icon: '💻', link: '/category/digital' },
    { id: 8, name: '스포츠', icon: '⚽', link: '/category/sports' },
];

export default function Categories() {
    return (
        <section className={styles.categorySection}>
            <SectionTitle title="카테고리" />
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