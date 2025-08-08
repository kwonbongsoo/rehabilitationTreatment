/**
 * 상품 관련 유틸리티 함수들
 */

import categoriesData from '@/mocks/categories.json';
import sortOptionsData from '@/mocks/sort-options.json';
import { Product } from '@/domains/product/types/product';

export type SortOption = 'price-low' | 'price-high' | 'rating' | 'sales' | 'newest';

/**
 * 상품 배열을 정렬하는 함수
 * @param products 상품 배열
 * @param sortBy 정렬 기준
 * @returns 정렬된 상품 배열
 */
export const sortProducts = <T extends Product>(products: T[], sortBy: SortOption): T[] => {
  return [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'sales':
        return (b.discount || 0) - (a.discount || 0);
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
export const filterProductsByCategory = <T extends Product>(
  products: T[],
  categoryId: number,
): T[] => {
  if (categoryId === 0) {
    return products;
  }
  return products.filter((product) => product.categoryId === categoryId);
};

/**
 * 상품을 필터링하고 정렬하는 통합 함수
 * @param products 상품 배열
 * @param category 카테고리
 * @param sortBy 정렬 기준
 * @returns 필터링되고 정렬된 상품 배열
 */
export const filterAndSortProducts = <T extends Product>(
  products: T[],
  categoryId: number,
  sortBy: SortOption,
): T[] => {
  const filtered = filterProductsByCategory(products, categoryId);
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
