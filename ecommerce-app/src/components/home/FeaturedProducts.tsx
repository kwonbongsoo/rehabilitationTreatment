import Link from 'next/link';
import Image from 'next/image';
import SectionTitle from '@/components/common/SectionTitle';
import Rating from '@/components/common/Rating';
import styles from '@/styles/home/Products.module.css';

// 더미 데이터
const featuredProducts = [
    {
        id: 1,
        name: '심플 티셔츠',
        price: 29000,
        discount: 0,
        image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
        rating: 4.5,
        reviewCount: 123,
    },
    {
        id: 2,
        name: '캐주얼 데님 자켓',
        price: 89000,
        discount: 15,
        image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
        rating: 4.8,
        reviewCount: 87,
    },
    {
        id: 3,
        name: '클래식 운동화',
        price: 69000,
        discount: 0,
        image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
        rating: 4.2,
        reviewCount: 56,
    },
    {
        id: 4,
        name: '미니멀 백팩',
        price: 59000,
        discount: 10,
        image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
        rating: 4.7,
        reviewCount: 92,
    },
    {
        id: 5,
        name: '패션 선글라스',
        price: 32000,
        discount: 0,
        image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
        rating: 4.4,
        reviewCount: 45,
    },
    {
        id: 6,
        name: '캐주얼 모자',
        price: 25000,
        discount: 0,
        image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
        rating: 4.6,
        reviewCount: 78,
    },
    {
        id: 7,
        name: '가죽 벨트',
        price: 39000,
        discount: 5,
        image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
        rating: 4.3,
        reviewCount: 34,
    },
    {
        id: 8,
        name: '캐주얼 시계',
        price: 85000,
        discount: 20,
        image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
        rating: 4.9,
        reviewCount: 112,
    },
];

export default function FeaturedProducts() {
    return (
        <section className={styles.productsSection}>
            <SectionTitle title="추천 상품" />
            <div className={styles.productGrid}>
                {featuredProducts.map((product) => (
                    <div key={product.id} className={styles.productCard}>
                        <Link href={`/products/${product.id}`}>
                            <div className={styles.productImageContainer}>
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className={styles.productImage}
                                />
                                {product.discount > 0 && (
                                    <div className={styles.discountBadge}>
                                        -{product.discount}%
                                    </div>
                                )}
                            </div>
                            <div className={styles.productInfo}>
                                <h3 className={styles.productName}>{product.name}</h3>
                                <div className={styles.priceContainer}>
                                    {product.discount > 0 ? (
                                        <>
                                            <span className={styles.originalPrice}>
                                                {product.price.toLocaleString()}원
                                            </span>
                                            <span className={styles.discountedPrice}>
                                                {Math.round(
                                                    product.price *
                                                    (1 - product.discount / 100)
                                                ).toLocaleString()}
                                                원
                                            </span>
                                        </>
                                    ) : (
                                        <span className={styles.price}>
                                            {product.price.toLocaleString()}원
                                        </span>
                                    )}
                                </div>
                                <Rating
                                    rating={product.rating}
                                    reviewCount={product.reviewCount}
                                />
                            </div>
                        </Link>
                        <button className={styles.addToCartButton}>
                            장바구니에 추가
                        </button>
                    </div>
                ))}
            </div>
            <div className={styles.viewAllContainer}>
                <Link href="/products" className={styles.viewAllButton}>
                    모든 상품 보기
                </Link>
            </div>
        </section>
    );
}