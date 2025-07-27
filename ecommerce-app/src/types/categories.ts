// BFF에서 받는 카테고리 관련 타입 정의

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  tags?: string[];
  categoryId?: number;
}

export interface CategoryWithProducts {
  id: number;
  name: string;
  slug: string;
  iconCode: string;
  order: number;
  isActive: boolean;
  products: Product[];
}

export interface CategoryFilter {
  id: string;
  name: string;
  type: 'category' | 'brand' | 'size' | 'color' | 'sort';
  options: string[];
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface CategoryPageData {
  categories: CategoryWithProducts[];
  allProducts: Product[];
  filters: FilterOption[];
  totalProducts: number;
  sortOptions: FilterOption[];
}

export interface CategoryDetailData {
  category: CategoryWithProducts;
  filters: CategoryFilter[];
}

// API 응답 래퍼 타입
export interface CategoryPageResponse {
  success: boolean;
  data: CategoryPageData;
  error?: string;
}

export interface CategoryDetailResponse {
  success: boolean;
  data: CategoryDetailData;
  error?: string;
}

// Server Action 결과 타입
export interface CategoryPageActionResult {
  success: boolean;
  data?: CategoryPageData;
  error?: string;
  statusCode?: number;
}

export interface CategoryDetailActionResult {
  success: boolean;
  data?: CategoryDetailData;
  error?: string;
  statusCode?: number;
}
