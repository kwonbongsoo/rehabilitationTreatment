import React from 'react';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import PromotionHero from '@/components/promotion/PromotionHero';
import PromotionGrid from '@/components/promotion/PromotionGrid';
import CountdownTimer from '@/components/promotion/CountdownTimer';
import styles from '@/styles/promotion/SummerPromotion.module.css';

interface Product {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    image: string;
    slug: string;
    badge?: string;
    rating?: number;
    reviewCount?: number;
}

interface SummerPromotionProps {
    featuredProducts: Product[];
    saleProducts: Product[];
    newProducts: Product[];
}

export default function SummerPromotion({
    featuredProducts,
    saleProducts,
    newProducts
}: SummerPromotionProps) {
    // 세일 종료일 (예: 2025년 8월 31일)
    const saleEndDate = new Date('2025-08-31T23:59:59');

    return (
        <>
            <Head>
                <title>여름 대세일 | 최대 70% 할인</title>
                <meta
                    name="description"
                    content="2025 여름 대세일! 최대 70% 할인된 가격으로 여름 필수 아이템들을 만나보세요. 한정된 시간, 놓치지 마세요!"
                />
                <meta name="keywords" content="여름세일, 할인, 프로모션, 여름옷, 세일" />
                <meta property="og:title" content="여름 대세일 | 최대 70% 할인" />
                <meta
                    property="og:description"
                    content="2025 여름 대세일! 최대 70% 할인된 가격으로 여름 필수 아이템들을 만나보세요."
                />
                <meta property="og:image" content="/images/summer-sale-og.jpg" />
                <meta property="og:type" content="website" />
            </Head>

            <div className={styles.promotionPage}>
                {/* 히어로 섹션 */}
                <PromotionHero
                    title="여름 대세일"
                    subtitle="Summer Sale 2025"
                    description="뜨거운 여름을 시원하게! 여름 필수 아이템들을 최대 70% 할인된 가격으로 만나보세요. 한정된 시간, 놓치지 마세요!"
                    backgroundImage="/images/summer-hero-bg.jpg"
                    ctaText="지금 쇼핑하기"
                    ctaLink="#featured-products"
                    discount="70"
                    validUntil="8월 31일"
                />

                {/* 카운트다운 타이머 */}
                <div className={styles.timerSection}>
                    <div className={styles.container}>                        <CountdownTimer
                        endDate={saleEndDate}
                        title="여름 세일 마감까지"
                        onExpire={() => console.warn('Sale expired!')}
                    />
                    </div>
                </div>

                {/* 특가 상품 */}
                <div id="featured-products">
                    <PromotionGrid
                        title="🔥 핫딜 특가"
                        subtitle="지금이 기회! 가장 인기 있는 상품들을 특가로 만나보세요"
                        products={featuredProducts}
                        columns={4}
                        showViewAll={true}
                        viewAllLink="/collections/summer-hot-deals"
                    />
                </div>

                {/* 세일 상품 */}
                <PromotionGrid
                    title="💧 여름 필수템"
                    subtitle="시원하고 스타일리시한 여름 아이템들을 확인해보세요"
                    products={saleProducts}
                    columns={3}
                    showViewAll={true}
                    viewAllLink="/collections/summer-essentials"
                />

                {/* 신상품 */}
                <PromotionGrid
                    title="✨ 2025 신상품"
                    subtitle="트렌디한 최신 아이템들을 가장 먼저 만나보세요"
                    products={newProducts}
                    columns={4}
                    showViewAll={true}
                    viewAllLink="/collections/new-arrivals"
                />

                {/* 추가 프로모션 배너 */}
                <div className={styles.additionalPromo}>
                    <div className={styles.container}>
                        <div className={styles.promoBanner}>
                            <div className={styles.promoContent}>
                                <h3>무료배송 + 추가할인</h3>
                                <p>5만원 이상 구매시 무료배송, 10만원 이상 구매시 추가 10% 할인!</p>
                            </div>
                            <div className={styles.promoIcon}>🚚</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    // 실제 프로젝트에서는 API나 데이터베이스에서 데이터를 가져옵니다
    const featuredProducts: Product[] = [
        {
            id: 1,
            name: "시원한 린넨 셔츠",
            price: 29900,
            originalPrice: 59800,
            discount: 50,
            image: "/images/products/summerItem.png",
            slug: "cool-linen-shirt",
            badge: "BEST",
            rating: 4.8,
            reviewCount: 156
        },
        {
            id: 2,
            name: "UV차단 선글라스",
            price: 19900,
            originalPrice: 39900,
            discount: 50,
            image: "/images/products/promotion.png",
            slug: "uv-sunglasses",
            rating: 4.6,
            reviewCount: 89
        },
        {
            id: 3,
            name: "쿨링 아이스 티셔츠",
            price: 15900,
            originalPrice: 29900,
            discount: 47,
            image: "/images/products/summerItem.png",
            slug: "cooling-ice-tshirt",
            badge: "HOT",
            rating: 4.7,
            reviewCount: 234
        },
        {
            id: 4,
            name: "여름 플로럴 원피스",
            price: 39900,
            originalPrice: 79800,
            discount: 50,
            image: "/images/products/promotion.png",
            slug: "summer-floral-dress",
            rating: 4.9,
            reviewCount: 127
        }
    ];

    const saleProducts: Product[] = [
        {
            id: 5,
            name: "메쉬 스니커즈",
            price: 49900,
            originalPrice: 89900,
            discount: 44,
            image: "/images/products/summerItem.png",
            slug: "mesh-sneakers",
            rating: 4.5,
            reviewCount: 78
        },
        {
            id: 6,
            name: "비치 햇",
            price: 12900,
            originalPrice: 25800,
            discount: 50,
            image: "/images/products/promotion.png",
            slug: "beach-hat",
            badge: "NEW",
            rating: 4.4,
            reviewCount: 45
        },
        {
            id: 7,
            name: "수영복 세트",
            price: 35900,
            originalPrice: 69900,
            discount: 49,
            image: "/images/products/summerItem.png",
            slug: "swimwear-set",
            rating: 4.6,
            reviewCount: 92
        }
    ];

    const newProducts: Product[] = [
        {
            id: 8,
            name: "아이스 실크 팬츠",
            price: 25900,
            originalPrice: 45900,
            discount: 44,
            image: "/images/products/summerItem.png",
            slug: "ice-silk-pants",
            badge: "NEW",
            rating: 4.3,
            reviewCount: 23
        },
        {
            id: 9,
            name: "쿨링 스포츠 브라",
            price: 18900,
            originalPrice: 32900,
            discount: 43,
            image: "/images/products/summerItem.png",
            slug: "cooling-sports-bra",
            badge: "NEW",
            rating: 4.7,
            reviewCount: 67
        },
        {
            id: 10,
            name: "UV차단 래쉬가드",
            price: 22900,
            originalPrice: 39900,
            discount: 43,
            image: "/images/products/summerItem.png",
            slug: "uv-rashguard",
            rating: 4.8,
            reviewCount: 134
        },
        {
            id: 11,
            name: "여름 크롭 자켓",
            price: 32900,
            originalPrice: 59900,
            discount: 45,
            image: "/images/products/summerItem.png",
            slug: "summer-crop-jacket",
            badge: "NEW",
            rating: 4.5,
            reviewCount: 56
        }
    ];

    return {
        props: {
            featuredProducts,
            saleProducts,
            newProducts
        },
        revalidate: 3600 // 1시간마다 재생성
    };
};
