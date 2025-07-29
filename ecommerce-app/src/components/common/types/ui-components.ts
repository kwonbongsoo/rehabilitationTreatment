export type UIComponentType =
  | 'banner'
  | 'categories'
  | 'featuredProducts'
  | 'newArrivals'
  | 'promotion'
  | 'reviews'
  | 'brands';

// 공통 인터페이스
export interface BaseUIComponent {
  id: string;
  type: UIComponentType;
  title?: string;
  visible: boolean;
}

// 배너 컴포넌트 타입
export interface BannerComponent extends BaseUIComponent {
  type: 'banner';
  data: {
    slides: {
      id: number;
      src: string;
      alt: string;
      link: string;
      title?: string;
      description?: string;
      backgroundColor?: string;
    }[];
  };
}

// 카테고리 컴포넌트 타입
export interface CategoriesComponent extends BaseUIComponent {
  type: 'categories';
  data: {
    categories: {
      id: number;
      name: string;
      icon: string;
      link: string;
    }[];
  };
}

// 추천 상품 컴포넌트 타입
export interface FeaturedProductsComponent extends BaseUIComponent {
  type: 'featuredProducts';
  data: {
    products: {
      id: number;
      name: string;
      price: number;
      discount: number;
      image: string;
      rating: number;
      reviewCount: number;
    }[];
  };
}

// 신상품 컴포넌트 타입
export interface NewArrivalsComponent extends BaseUIComponent {
  type: 'newArrivals';
  data: {
    products: {
      id: number;
      name: string;
      price: number;
      image: string;
    }[];
  };
}

// 프로모션 컴포넌트 타입
export interface PromotionComponent extends BaseUIComponent {
  type: 'promotion';
  data: {
    title: string;
    description: string;
    link: string;
    buttonText: string;
  };
}

// 리뷰 컴포넌트 타입
export interface ReviewsComponent extends BaseUIComponent {
  type: 'reviews';
  data: {
    reviews: {
      id: number;
      name: string;
      initials: string;
      rating: number;
      text: string;
      product: string;
    }[];
  };
}

// 브랜드 컴포넌트 타입
export interface BrandsComponent extends BaseUIComponent {
  type: 'brands';
  data: {
    logos: {
      id: number;
      name: string;
      image?: string;
    }[];
  };
}

// UI 컴포넌트 통합 타입
export type UIComponent =
  | BannerComponent
  | CategoriesComponent
  | FeaturedProductsComponent
  | NewArrivalsComponent
  | PromotionComponent
  | ReviewsComponent
  | BrandsComponent;