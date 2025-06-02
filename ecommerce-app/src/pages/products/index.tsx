import React from 'react';
import Link from 'next/link';
import styles from './Products.module.css';

const ProductsPage: React.FC = () => {
    // Mock products data
    const mockProducts = [
        {
            id: 1,
            name: '스타일리시 원피스',
            price: 89900,
            image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
            rating: 4.5,
            category: '여성',
        },
        {
            id: 2,
            name: '클래식 셔츠',
            price: 59900,
            image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
            rating: 4.3,
            category: '남성',
        },
        {
            id: 3,
            name: '캐주얼 스니커즈',
            price: 129900,
            image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
            rating: 4.7,
            category: '신발',
        },
        {
            id: 4,
            name: '레더 핸드백',
            price: 199900,
            image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
            rating: 4.6,
            category: '가방',
        },
        {
            id: 5,
            name: '무선 이어폰',
            price: 79900,
            image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
            rating: 4.4,
            category: '디지털',
        },
        {
            id: 6,
            name: '스포츠 티셔츠',
            price: 39900,
            image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
            rating: 4.2,
            category: '스포츠',
        },
    ];

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>모든 상품</h1>

            <div className={styles.filters}>
                <select className={styles.filterSelect}>
                    <option value="">카테고리 선택</option>
                    <option value="women">여성</option>
                    <option value="men">남성</option>
                    <option value="shoes">신발</option>
                    <option value="bags">가방</option>
                    <option value="digital">디지털</option>
                    <option value="sports">스포츠</option>
                </select>

                <select className={styles.filterSelect}>
                    <option value="">가격순</option>
                    <option value="low">낮은 가격순</option>
                    <option value="high">높은 가격순</option>
                </select>

                <select className={styles.filterSelect}>
                    <option value="">평점순</option>
                    <option value="rating">높은 평점순</option>
                </select>
            </div>

            <div className={styles.productsGrid}>
                {mockProducts.map((product) => (
                    <Link href={`/product/${product.id}`} key={product.id} className={styles.productCard}>
                        <div className={styles.productImage}>
                            <img src={product.image} alt={product.name} />
                        </div>
                        <div className={styles.productInfo}>
                            <span className={styles.productCategory}>{product.category}</span>
                            <h3 className={styles.productName}>{product.name}</h3>
                            <p className={styles.productPrice}>
                                {product.price.toLocaleString()}원
                            </p>
                            <div className={styles.productRating}>
                                ⭐ {product.rating}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ProductsPage;

