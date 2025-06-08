// 프로모션 관련 타입 정의
export interface Product {
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
    category?: string;
    inStock?: boolean;
}

export interface PromotionHeroData {
    title: string;
    subtitle: string;
    description: string;
    backgroundImage: string;
    ctaText: string;
    ctaLink: string;
    discount?: string;
    validUntil?: string;
}

export interface PromotionSection {
    id: string;
    title: string;
    subtitle?: string;
    products: Product[];
    columns?: 2 | 3 | 4;
    showViewAll?: boolean;
    viewAllLink?: string;
}

export interface PromotionPageData {
    hero: PromotionHeroData;
    sections: PromotionSection[];
    saleEndDate: Date;
    metadata: {
        title: string;
        description: string;
        keywords: string[];
        ogImage: string;
    };
}

// 카운트다운 타이머 관련
export interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export interface CountdownConfig {
    endDate: Date;
    title?: string;
    onExpire?: () => void;
    autoHide?: boolean;
}

// API 응답 타입
export interface PromotionApiResponse {
    success: boolean;
    data: PromotionPageData;
    message?: string;
}

export interface ProductApiResponse {
    success: boolean;
    data: Product[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    message?: string;
}
