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

// ProductRaw는 RawProductData와 동일하므로 common.ts에서 import
import { RawProductData } from './common';
export type ProductRaw = RawProductData;

// API 응답용 변환된 타입
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
export interface FilterOption {
  value: string;
  label: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CategoryPageData {
  categories: CategoryWithProducts[];
  allProducts: Product[];
  filters: FilterOption[];
  sortOptions: FilterOption[];
  totalProducts: number;
}
