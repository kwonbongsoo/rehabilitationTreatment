// 카테고리 관련 타입 정의

// JSON 파일에서 읽어오는 원본 데이터 타입
export interface CategoryRaw {
  id: number;
  name: string;
  slug: string;
  iconCode: string;
  order: number;
  isActive: boolean;
}

import { Product } from './common';

export interface CategoryWithProducts {
  id: number;
  name: string;
  slug: string;
  iconCode: string;
  isActive: boolean;
  products: Product[];
  link: string;
}
export interface FilterOption {
  value: string;
  label: string;
}

// UI 컴포넌트 기본 인터페이스
export interface BaseUIComponent {
  id: string;
  type: string;
  title?: string;
  visible: boolean;
}

// 카테고리 그리드 컴포넌트
export interface CategoryGridComponent extends BaseUIComponent {
  type: 'categoryGrid';
  data: {
    categories: CategoryWithProducts[];
  };
}

// 상품 필터 컴포넌트 (필터와 정렬 옵션 통합)
export interface ProductFiltersComponent extends BaseUIComponent {
  type: 'productFilters';
  data: {
    filterOptions: FilterOption[];
    sortOptions: FilterOption[];
  };
}

// 상품 그리드 컴포넌트
export interface ProductGridComponent extends BaseUIComponent {
  type: 'productGrid';
  data: {
    allProducts: Product[];
  };
}

// UI 컴포넌트 통합 타입
export type UIComponent = CategoryGridComponent | ProductFiltersComponent | ProductGridComponent;

// 새로운 CategoryPageData - components 배열 형태
export interface CategoryPageData {
  components: UIComponent[];
}
