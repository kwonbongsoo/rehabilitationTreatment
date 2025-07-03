/**
 * 상품 관련 유틸리티 함수들
 */

import categoriesData from '@/mocks/categories.json';
import sortOptionsData from '@/mocks/sort-options.json';

export interface BaseProduct {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  category?: string;
  sales?: number;
  reviews?: number;
  reviewCount?: number;
  badge?: string;
  discount?: number;
  isNew?: boolean;
  onSale?: boolean;
}

export type SortOption = 'price-low' | 'price-high' | 'rating' | 'sales' | 'newest';

/**
 * 상품 배열을 정렬하는 함수
 * @param products 상품 배열
 * @param sortBy 정렬 기준
 * @returns 정렬된 상품 배열
 */
export const sortProducts = <T extends BaseProduct>(products: T[], sortBy: SortOption): T[] => {
  return [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'sales':
        return (b.sales || 0) - (a.sales || 0);
      case 'newest':
        return b.id - a.id; // ID가 클수록 최신이라고 가정
      default:
        return 0;
    }
  });
};

/**
 * 카테고리별로 상품을 필터링하는 함수
 * @param products 상품 배열
 * @param category 카테고리 (all인 경우 전체 반환)
 * @returns 필터링된 상품 배열
 */
export const filterProductsByCategory = <T extends BaseProduct>(
  products: T[],
  category: string,
): T[] => {
  if (category === 'all') {
    return products;
  }
  return products.filter((product) => product.category === category);
};

/**
 * 상품을 필터링하고 정렬하는 통합 함수
 * @param products 상품 배열
 * @param category 카테고리
 * @param sortBy 정렬 기준
 * @returns 필터링되고 정렬된 상품 배열
 */
export const filterAndSortProducts = <T extends BaseProduct>(
  products: T[],
  category: string,
  sortBy: SortOption,
): T[] => {
  const filtered = filterProductsByCategory(products, category);
  return sortProducts(filtered, sortBy);
};

/**
 * 공통 카테고리 옵션들
 */
export const COMMON_CATEGORIES = categoriesData.categories;

/**
 * 공통 정렬 옵션들
 */
export const COMMON_SORT_OPTIONS = sortOptionsData.common;

/**
 * 베스트셀러 전용 정렬 옵션들
 */
export const BESTSELLER_SORT_OPTIONS = sortOptionsData.bestseller;
