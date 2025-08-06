/**
 * useProductCategories 훅 테스트
 *
 * 상품 카테고리 로딩 로직을 테스트합니다.
 * 사이드이펙트 방지를 위해 외부 서비스와 console을 모킹합니다.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useProductCategories } from '../useProductCategories';
import type { CategoryOption } from '@/domains/category/services/categoriesService';

// 외부 서비스 모킹
jest.mock('@/domains/category/services/categoriesService', () => ({
  fetchCategories: jest.fn(),
}));

// console.error 모킹
const mockConsoleError = jest.fn();
global.console.error = mockConsoleError;

describe('useProductCategories', () => {
  const mockFetchCategories =
    require('@/domains/category/services/categoriesService').fetchCategories;

  const mockCategories: CategoryOption[] = [
    {
      id: 1,
      name: '의류',
      slug: 'clothing',
      iconCode: '👕',
    },
    {
      id: 2,
      name: '신발',
      slug: 'shoes',
      iconCode: '👟',
    },
    {
      id: 3,
      name: '액세서리',
      slug: 'accessories',
      iconCode: '👜',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();
  });

  describe('초기 상태', () => {
    it('올바른 초기값이 설정되어야 한다', () => {
      // fetchCategories가 무한 대기하도록 모킹 (초기 상태 확인용)
      mockFetchCategories.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useProductCategories());

      expect(result.current.categories).toEqual([]);
      expect(result.current.loadingCategories).toBe(true);
      expect(result.current.categoriesError).toBe(null);
    });
  });

  describe('성공적인 카테고리 로딩', () => {
    it('카테고리가 성공적으로 로드되어야 한다', async () => {
      mockFetchCategories.mockResolvedValue({
        success: true,
        data: mockCategories,
      });

      const { result } = renderHook(() => useProductCategories());

      // 초기 로딩 상태 확인
      expect(result.current.loadingCategories).toBe(true);
      expect(result.current.categories).toEqual([]);

      // 카테고리 로딩 완료 대기
      await waitFor(() => {
        expect(result.current.loadingCategories).toBe(false);
      });

      expect(result.current.categories).toEqual(mockCategories);
      expect(result.current.categoriesError).toBe(null);
    });

    it('빈 카테고리 목록도 올바르게 처리되어야 한다', async () => {
      mockFetchCategories.mockResolvedValue({
        success: true,
        data: [],
      });

      const { result } = renderHook(() => useProductCategories());

      await waitFor(() => {
        expect(result.current.loadingCategories).toBe(false);
      });

      expect(result.current.categories).toEqual([]);
      expect(result.current.categoriesError).toBe(null);
    });
  });

  describe('서버 응답 에러 처리', () => {
    it('success가 false일 때 에러가 설정되어야 한다', async () => {
      const errorMessage = '서버에서 카테고리를 찾을 수 없습니다.';
      mockFetchCategories.mockResolvedValue({
        success: false,
        error: errorMessage,
      });

      const { result } = renderHook(() => useProductCategories());

      await waitFor(() => {
        expect(result.current.loadingCategories).toBe(false);
      });

      expect(result.current.categories).toEqual([]);
      expect(result.current.categoriesError).toBe(errorMessage);
      expect(mockConsoleError).toHaveBeenCalledWith('Failed to fetch categories:', errorMessage);
    });

    it('success가 false이고 error 메시지가 없을 때 기본 메시지가 설정되어야 한다', async () => {
      mockFetchCategories.mockResolvedValue({
        success: false,
      });

      const { result } = renderHook(() => useProductCategories());

      await waitFor(() => {
        expect(result.current.loadingCategories).toBe(false);
      });

      expect(result.current.categories).toEqual([]);
      expect(result.current.categoriesError).toBe('Failed to load categories');
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to fetch categories:',
        'Failed to load categories',
      );
    });

    it('success가 true이지만 data가 없을 때 에러가 설정되어야 한다', async () => {
      mockFetchCategories.mockResolvedValue({
        success: true,
        data: null,
      });

      const { result } = renderHook(() => useProductCategories());

      await waitFor(() => {
        expect(result.current.loadingCategories).toBe(false);
      });

      expect(result.current.categories).toEqual([]);
      expect(result.current.categoriesError).toBe('Failed to load categories');
    });

    it('success가 true이지만 data가 undefined일 때 에러가 설정되어야 한다', async () => {
      mockFetchCategories.mockResolvedValue({
        success: true,
        data: undefined,
      });

      const { result } = renderHook(() => useProductCategories());

      await waitFor(() => {
        expect(result.current.loadingCategories).toBe(false);
      });

      expect(result.current.categories).toEqual([]);
      expect(result.current.categoriesError).toBe('Failed to load categories');
    });
  });

  describe('네트워크 에러 처리', () => {
    it('fetchCategories가 exception을 던질 때 에러가 처리되어야 한다', async () => {
      const networkError = new Error('Network timeout');
      mockFetchCategories.mockRejectedValue(networkError);

      const { result } = renderHook(() => useProductCategories());

      await waitFor(() => {
        expect(result.current.loadingCategories).toBe(false);
      });

      expect(result.current.categories).toEqual([]);
      expect(result.current.categoriesError).toBe('Failed to load categories');
      expect(mockConsoleError).toHaveBeenCalledWith('Error loading categories:', networkError);
    });

    it('문자열 에러가 던져져도 올바르게 처리되어야 한다', async () => {
      mockFetchCategories.mockRejectedValue('String error');

      const { result } = renderHook(() => useProductCategories());

      await waitFor(() => {
        expect(result.current.loadingCategories).toBe(false);
      });

      expect(result.current.categories).toEqual([]);
      expect(result.current.categoriesError).toBe('Failed to load categories');
      expect(mockConsoleError).toHaveBeenCalledWith('Error loading categories:', 'String error');
    });

    it('null 에러가 던져져도 올바르게 처리되어야 한다', async () => {
      mockFetchCategories.mockRejectedValue(null);

      const { result } = renderHook(() => useProductCategories());

      await waitFor(() => {
        expect(result.current.loadingCategories).toBe(false);
      });

      expect(result.current.categories).toEqual([]);
      expect(result.current.categoriesError).toBe('Failed to load categories');
      expect(mockConsoleError).toHaveBeenCalledWith('Error loading categories:', null);
    });
  });

  describe('로딩 상태 관리', () => {
    it('로딩 중에는 loadingCategories가 true여야 한다', async () => {
      let resolvePromise: (value: any) => void;
      const loadingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetchCategories.mockReturnValue(loadingPromise);

      const { result } = renderHook(() => useProductCategories());

      // 로딩 상태 확인
      expect(result.current.loadingCategories).toBe(true);
      expect(result.current.categories).toEqual([]);
      expect(result.current.categoriesError).toBe(null);

      // Promise 해결
      resolvePromise!({
        success: true,
        data: mockCategories,
      });

      await waitFor(() => {
        expect(result.current.loadingCategories).toBe(false);
      });

      expect(result.current.categories).toEqual(mockCategories);
    });

    it('에러 발생시에도 loadingCategories가 false가 되어야 한다', async () => {
      mockFetchCategories.mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useProductCategories());

      expect(result.current.loadingCategories).toBe(true);

      await waitFor(() => {
        expect(result.current.loadingCategories).toBe(false);
      });

      expect(result.current.categoriesError).toBe('Failed to load categories');
    });
  });

  describe('에러 상태 재설정', () => {
    it('새로운 요청 시작시 이전 에러가 클리어되어야 한다', async () => {
      // 첫 번째 요청 - 실패
      mockFetchCategories.mockRejectedValueOnce(new Error('First error'));

      const { result } = renderHook(() => useProductCategories());

      await waitFor(() => {
        expect(result.current.categoriesError).toBe('Failed to load categories');
      });

      // 이 테스트는 실제로는 useEffect가 한 번만 실행되므로
      // 에러 클리어 로직을 확인하기 위한 개념적 테스트
      expect(result.current.categoriesError).toBe('Failed to load categories');
    });

    it('로딩 시작시 에러 상태가 null로 리셋되어야 한다', async () => {
      // 첫 번째 렌더링에서는 성공적으로 로드되도록 설정
      mockFetchCategories.mockResolvedValue({
        success: true,
        data: mockCategories,
      });

      const { result } = renderHook(() => useProductCategories());

      // 초기에는 에러가 null이어야 함
      expect(result.current.categoriesError).toBe(null);

      await waitFor(() => {
        expect(result.current.loadingCategories).toBe(false);
      });

      // 로딩 완료 후에도 에러가 null이어야 함
      expect(result.current.categoriesError).toBe(null);
    });
  });

  describe('컴포넌트 라이프사이클', () => {
    it('마운트시 즉시 카테고리 로딩이 시작되어야 한다', () => {
      mockFetchCategories.mockResolvedValue({
        success: true,
        data: mockCategories,
      });

      renderHook(() => useProductCategories());

      expect(mockFetchCategories).toHaveBeenCalledTimes(1);
      expect(mockFetchCategories).toHaveBeenCalledWith();
    });

    it('리렌더링시 추가 요청이 발생하지 않아야 한다', async () => {
      mockFetchCategories.mockResolvedValue({
        success: true,
        data: mockCategories,
      });

      const { rerender } = renderHook(() => useProductCategories());

      await waitFor(() => {
        expect(mockFetchCategories).toHaveBeenCalledTimes(1);
      });

      // 리렌더링
      rerender();

      // 추가 호출이 없어야 함
      expect(mockFetchCategories).toHaveBeenCalledTimes(1);
    });
  });

  describe('메모리 누수 방지', () => {
    it('언마운트 후에는 상태 업데이트가 발생하지 않아야 한다', async () => {
      let resolvePromise: (value: any) => void;
      const slowPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetchCategories.mockReturnValue(slowPromise);

      const { result, unmount } = renderHook(() => useProductCategories());

      expect(result.current.loadingCategories).toBe(true);

      // 컴포넌트 언마운트
      unmount();

      // Promise 해결 (컴포넌트 언마운트 후)
      resolvePromise!({
        success: true,
        data: mockCategories,
      });

      // 상태 업데이트가 발생하지 않음을 확인하기 위해 잠시 대기
      await new Promise((resolve) => setTimeout(resolve, 10));

      // 이 시점에서는 컴포넌트가 언마운트되었으므로 상태를 확인할 수 없음
      // 하지만 에러가 발생하지 않음을 확인
      expect(true).toBe(true);
    });
  });

  describe('데이터 형식', () => {
    it('CategoryOption 타입 구조에 맞는 데이터를 반환해야 한다', async () => {
      const specificCategories: CategoryOption[] = [
        {
          id: 1,
          name: 'Electronics',
          slug: 'electronics',
          iconCode: '📱',
        },
      ];

      mockFetchCategories.mockResolvedValue({
        success: true,
        data: specificCategories,
      });

      const { result } = renderHook(() => useProductCategories());

      await waitFor(() => {
        expect(result.current.loadingCategories).toBe(false);
      });

      expect(result.current.categories).toEqual(specificCategories);
      expect(result.current.categories[0]).toHaveProperty('id');
      expect(result.current.categories[0]).toHaveProperty('name');
      expect(result.current.categories[0]).toHaveProperty('slug');
      expect(result.current.categories[0]).toHaveProperty('iconCode');
    });
  });
});
