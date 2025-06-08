import React, { useState } from 'react';
import Head from 'next/head';
import styles from './BestSellers.module.css';
import OptimizedImage from '@/components/common/OptimizedImage';

interface Product {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    sales: number;
    rating: number;
    reviews: number;
    category: string;
    badge?: string;
}

const BestSellers: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('sales');

    const bestSellerProducts: Product[] = [
        {
            id: 1,
            name: '베스트셀러 원피스',
            price: 89900,
            originalPrice: 129900,
            image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
            sales: 1250,
            rating: 4.8,
            reviews: 324,
            category: 'dress',
            badge: '1위'
        },
        {
            id: 2,
            name: '인기 스니커즈',
            price: 129900,
            image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpgg',
            sales: 980,
            rating: 4.7,
            reviews: 256,
            category: 'shoes',
            badge: '2위'
        },
        {
            id: 3,
            name: '클래식 블레이저',
            price: 159900,
            originalPrice: 199900,
            image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
            sales: 850,
            rating: 4.6,
            reviews: 189,
            category: 'jacket',
            badge: '3위'
        },
        {
            id: 4,
            name: '데님 청바지',
            price: 79900,
            image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
            sales: 750,
            rating: 4.5,
            reviews: 234,
            category: 'pants'
        },
        {
            id: 5,
            name: '캐시미어 스웨터',
            price: 189900,
            originalPrice: 259900,
            image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
            sales: 680,
            rating: 4.9,
            reviews: 145,
            category: 'top'
        },
        {
            id: 6,
            name: '실크 블라우스',
            price: 119900,
            image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
            sales: 620,
            rating: 4.4,
            reviews: 178,
            category: 'top'
        },
        {
            id: 7,
            name: '레더 핸드백',
            price: 249900,
            originalPrice: 329900,
            image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
            sales: 580,
            rating: 4.8,
            reviews: 92,
            category: 'bag'
        },
        {
            id: 8,
            name: '트렌치 코트',
            price: 299900,
            image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
            sales: 520,
            rating: 4.7,
            reviews: 156,
            category: 'jacket'
        }
    ];

    const categories = [
        { value: 'all', label: '전체' },
        { value: 'dress', label: '원피스' },
        { value: 'top', label: '상의' },
        { value: 'pants', label: '바지' },
        { value: 'jacket', label: '아우터' },
        { value: 'shoes', label: '신발' },
        { value: 'bag', label: '가방' }
    ];

    const sortOptions = [
        { value: 'sales', label: '판매량순' },
        { value: 'price-low', label: '낮은 가격순' },
        { value: 'price-high', label: '높은 가격순' },
        { value: 'rating', label: '평점순' }
    ];

    const getFilteredAndSortedProducts = () => {
        let filtered = selectedCategory === 'all'
            ? bestSellerProducts
            : bestSellerProducts.filter(product => product.category === selectedCategory);

        return filtered.sort((a, b) => {
            switch (sortBy) {
                case 'sales':
                    return b.sales - a.sales;
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'rating':
                    return b.rating - a.rating;
                default:
                    return 0;
            }
        });
    };

    const formatPrice = (price: number) => {
        return price.toLocaleString() + '원';
    };

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={i} className={styles.star}>★</span>);
        }
        if (hasHalfStar) {
            stars.push(<span key="half" className={styles.halfStar}>★</span>);
        }
        for (let i = stars.length; i < 5; i++) {
            stars.push(<span key={i} className={styles.emptyStar}>☆</span>);
        }
        return stars;
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>베스트셀러 - StyleShop</title>
                <meta name="description" content="가장 많이 판매되는 인기 상품들을 만나보세요." />
            </Head>

            <div className={styles.header}>
                <h1>베스트셀러</h1>
                <p>가장 인기 있는 상품들을 만나보세요</p>
            </div>

            <div className={styles.filters}>
                <div className={styles.categoryFilter}>
                    <label>카테고리</label>
                    <div className={styles.categoryButtons}>
                        {categories.map(category => (
                            <button
                                key={category.value}
                                className={`${styles.categoryButton} ${selectedCategory === category.value ? styles.active : ''
                                    }`}
                                onClick={() => setSelectedCategory(category.value)}
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.sortFilter}>
                    <label>정렬</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className={styles.sortSelect}
                    >
                        {sortOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.productGrid}>
                {getFilteredAndSortedProducts().map((product) => (
                    <div key={product.id} className={styles.productCard}>
                        <div className={styles.productImage}>
                            <OptimizedImage
                                src={product.image}
                                alt={product.name}
                                width={500}
                                height={500}
                                className={styles.image}
                            />
                            {product.badge && (
                                <span className={styles.badge}>{product.badge}</span>
                            )}
                        </div>
                        <div className={styles.productInfo}>
                            <h3 className={styles.productName}>{product.name}</h3>
                            <div className={styles.priceContainer}>
                                {product.originalPrice && (
                                    <span className={styles.originalPrice}>
                                        {formatPrice(product.originalPrice)}
                                    </span>
                                )}
                                <span className={styles.price}>
                                    {formatPrice(product.price)}
                                </span>
                            </div>
                            <div className={styles.rating}>
                                <div className={styles.stars}>
                                    {renderStars(product.rating)}
                                </div>
                                <span className={styles.ratingText}>
                                    {product.rating} ({product.reviews}개 리뷰)
                                </span>
                            </div>
                            <div className={styles.salesInfo}>
                                <span className={styles.salesCount}>
                                    🔥 {product.sales}개 판매
                                </span>
                            </div>
                            <button className={styles.addToCartButton}>
                                장바구니 담기
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.loadMore}>
                <button className={styles.loadMoreButton}>
                    더 많은 상품 보기
                </button>
            </div>

            <div className={styles.infoSection}>
                <h3>베스트셀러 선정 기준</h3>
                <div className={styles.infoGrid}>
                    <div className={styles.infoCard}>
                        <h4>📊 판매량</h4>
                        <p>최근 30일간 판매량을 기준으로 선정</p>
                    </div>
                    <div className={styles.infoCard}>
                        <h4>⭐ 고객만족도</h4>
                        <p>평점 4.0 이상 상품만 선별</p>
                    </div>
                    <div className={styles.infoCard}>
                        <h4>🔄 재구매율</h4>
                        <p>높은 재구매율을 보이는 상품</p>
                    </div>
                    <div className={styles.infoCard}>
                        <h4>📈 트렌드</h4>
                        <p>현재 트렌드를 반영한 인기 상품</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BestSellers;

