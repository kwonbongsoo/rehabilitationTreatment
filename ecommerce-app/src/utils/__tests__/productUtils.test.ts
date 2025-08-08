import {
  sortProducts,
  filterProductsByCategory,
  COMMON_SORT_OPTIONS,
  COMMON_CATEGORIES,
} from '../productUtils';
import { Product } from '@/domains/product/types/product';

describe('상품 유틸리티', () => {
  const mockProducts: Product[] = [
    {
      id: 1,
      name: 'Test Product 1',
      price: 8000,
      images: ['/test1.jpg'],
      reviews: 10,
      originalPrice: 10000,
      mainImage: '/test1.jpg',
      description: 'Test description 1',
      categoryId: 1,
      sellerId: 'seller1',
      stock: 10,
      rating: 4.5,
      tags: [],
      isNew: false,
      isFeatured: false,
    },
    {
      id: 2,
      name: 'Test Product 2',
      price: 12000,
      images: ['/test2.jpg'],
      reviews: 5,
      mainImage: '/test2.jpg',
      description: 'Test description 2',
      categoryId: 2,
      sellerId: 'seller2',
      stock: 5,
      rating: 3.8,
      tags: [],
      isNew: false,
      isFeatured: false,
    },
  ];

  describe('상품 정렬', () => {
    it('가격 낮은 순으로 상품을 정렬한다', () => {
      const sorted = sortProducts(mockProducts, 'price-low');
      expect(sorted[0]?.price).toBeLessThan(sorted[1]?.price || 0);
    });

    it('가격 높은 순으로 상품을 정렬한다', () => {
      const sorted = sortProducts(mockProducts, 'price-high');
      expect(sorted[0]?.price).toBeGreaterThan(sorted[1]?.price || 0);
    });

    it('평점순으로 상품을 정렬한다', () => {
      const sorted = sortProducts(mockProducts, 'rating');
      expect(sorted[0]?.rating || 0).toBeGreaterThanOrEqual(sorted[1]?.rating || 0);
    });

    it('원본 배열을 변경하지 않고 반환한다', () => {
      const originalOrder = [...mockProducts];
      sortProducts(mockProducts, 'price-low');
      expect(mockProducts).toEqual(originalOrder);
    });
  });

  describe('상품 필터링', () => {
    it('카테고리별로 상품을 필터링한다', () => {
      const filtered = filterProductsByCategory(mockProducts, 1);
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.categoryId).toBe(1);
    });

    it('categoryId가 0일 때 모든 상품을 반환한다', () => {
      const filtered = filterProductsByCategory(mockProducts, 0);
      expect(filtered).toEqual(mockProducts);
    });
  });

  describe('공통 정렬 옵션', () => {
    it('사용 가능한 정렬 옵션을 반환한다', () => {
      expect(COMMON_SORT_OPTIONS).toBeInstanceOf(Array);
      expect(COMMON_SORT_OPTIONS.length).toBeGreaterThan(0);
    });
  });

  describe('공통 카테고리', () => {
    it('카테고리 필터 옵션을 반환한다', () => {
      expect(COMMON_CATEGORIES).toBeInstanceOf(Array);
      expect(COMMON_CATEGORIES.length).toBeGreaterThan(0);
    });
  });
});
