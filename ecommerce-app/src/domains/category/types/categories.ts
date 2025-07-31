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

// UI 컴포넌트는 공통으로 이동된 타입 사용
import type { UIComponent } from '@/components/common/types/ui-components';

export interface CategoryPageData {
  components: UIComponent[];
}

export interface CategoryDetailData {
  category: CategoryWithProducts;
  filters: CategoryFilter[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export type CategoryPageResponse = ApiResponse<CategoryPageData>;
export type CategoryDetailResponse = ApiResponse<CategoryDetailData>;

export interface ActionResult<T> extends ApiResponse<T> {
  statusCode?: number;
}

export interface CategoryGridRendererProps {
  categories: CategoryI[];
}

export interface CategoryI {
  id: number;
  name: string;
  slug: string;
  iconCode: string;
  order: number;
  isActive: boolean;
  products: Product[];
  link: string;
}

export type CategoryPageActionResult = ActionResult<CategoryPageData>;
