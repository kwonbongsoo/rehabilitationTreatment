/**
 * CategoryContext 테스트
 * 
 * 카테고리 컨텍스트의 상태 관리, URL 파라미터 파싱, 이벤트 핸들러를 테스트합니다.
 */

import React from 'react';
import { render, screen, act, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSearchParams } from 'next/navigation';
import { CategoryProvider, useCategoryContext } from '../CategoryContext';

// Next.js navigation 모킹
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;

// Mock search params 헬퍼
const createMockSearchParams = (params: Record<string, string> = {}) => ({
  get: (key: string) => params[key] || null,
  has: (key: string) => key in params,
  keys: () => Object.keys(params)[Symbol.iterator](),
  values: () => Object.values(params)[Symbol.iterator](),
  entries: () => Object.entries(params)[Symbol.iterator](),
  forEach: (fn: (value: string, key: string) => void) => {
    Object.entries(params).forEach(([key, value]) => fn(value, key));
  },
  toString: () => new URLSearchParams(params).toString(),
});

describe('CategoryContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSearchParams.mockReturnValue(createMockSearchParams());
  });

  describe('CategoryProvider 초기 상태', () => {
    it('기본값으로 올바르게 초기화해야 한다', () => {
      const TestComponent = () => {
        const context = useCategoryContext();
        return (
          <div>
            <div data-testid="categoryId">{context.selectedCategoryId}</div>
            <div data-testid="filter">{context.currentFilter}</div>
            <div data-testid="sort">{context.currentSort}</div>
            <div data-testid="viewMode">{context.viewMode}</div>
          </div>
        );
      };

      render(
        <CategoryProvider>
          <TestComponent />
        </CategoryProvider>
      );

      expect(screen.getByTestId('categoryId')).toHaveTextContent('0');
      expect(screen.getByTestId('filter')).toHaveTextContent('전체');
      expect(screen.getByTestId('sort')).toHaveTextContent('popular');
      expect(screen.getByTestId('viewMode')).toHaveTextContent('grid');
    });

    it('URL 파라미터에서 초기값을 설정해야 한다', () => {
      mockUseSearchParams.mockReturnValue(
        createMockSearchParams({
          category: '5',
          filter: '할인상품',
          sort: 'price-low',
          view: 'list',
        })
      );

      const TestComponent = () => {
        const context = useCategoryContext();
        return (
          <div>
            <div data-testid="categoryId">{context.selectedCategoryId}</div>
            <div data-testid="filter">{context.currentFilter}</div>
            <div data-testid="sort">{context.currentSort}</div>
            <div data-testid="viewMode">{context.viewMode}</div>
          </div>
        );
      };

      render(
        <CategoryProvider>
          <TestComponent />
        </CategoryProvider>
      );

      expect(screen.getByTestId('categoryId')).toHaveTextContent('5');
      expect(screen.getByTestId('filter')).toHaveTextContent('할인상품');
      expect(screen.getByTestId('sort')).toHaveTextContent('price-low');
      expect(screen.getByTestId('viewMode')).toHaveTextContent('list');
    });

    it('initialCategoryFilter props를 우선적으로 사용해야 한다', () => {
      mockUseSearchParams.mockReturnValue(
        createMockSearchParams({
          category: '10',
        })
      );

      const TestComponent = () => {
        const context = useCategoryContext();
        return <div data-testid="categoryId">{context.selectedCategoryId}</div>;
      };

      render(
        <CategoryProvider initialCategoryFilter="7">
          <TestComponent />
        </CategoryProvider>
      );

      expect(screen.getByTestId('categoryId')).toHaveTextContent('7');
    });
  });

  describe('CategoryProvider 액션 핸들러', () => {
    it('handleCategoryClick이 카테고리 ID를 올바르게 업데이트해야 한다', async () => {
      const user = userEvent.setup();
      
      const TestComponent = () => {
        const context = useCategoryContext();
        return (
          <div>
            <div data-testid="categoryId">{context.selectedCategoryId}</div>
            <button 
              onClick={() => context.handleCategoryClick(3)}
              data-testid="categoryButton"
            >
              카테고리 3 선택
            </button>
          </div>
        );
      };

      render(
        <CategoryProvider>
          <TestComponent />
        </CategoryProvider>
      );

      expect(screen.getByTestId('categoryId')).toHaveTextContent('0');

      await act(async () => {
        await user.click(screen.getByTestId('categoryButton'));
      });

      expect(screen.getByTestId('categoryId')).toHaveTextContent('3');
    });

    it('handleFilterChange가 필터를 올바르게 업데이트해야 한다', async () => {
      const user = userEvent.setup();
      
      const TestComponent = () => {
        const context = useCategoryContext();
        return (
          <div>
            <div data-testid="filter">{context.currentFilter}</div>
            <button 
              onClick={() => context.handleFilterChange('신상품')}
              data-testid="filterButton"
            >
              신상품 필터
            </button>
          </div>
        );
      };

      render(
        <CategoryProvider>
          <TestComponent />
        </CategoryProvider>
      );

      expect(screen.getByTestId('filter')).toHaveTextContent('전체');

      await act(async () => {
        await user.click(screen.getByTestId('filterButton'));
      });

      expect(screen.getByTestId('filter')).toHaveTextContent('신상품');
    });

    it('handleSortChange가 정렬을 올바르게 업데이트해야 한다', async () => {
      const user = userEvent.setup();
      
      const TestComponent = () => {
        const context = useCategoryContext();
        return (
          <div>
            <div data-testid="sort">{context.currentSort}</div>
            <button 
              onClick={() => context.handleSortChange('price-high')}
              data-testid="sortButton"
            >
              높은 가격순
            </button>
          </div>
        );
      };

      render(
        <CategoryProvider>
          <TestComponent />
        </CategoryProvider>
      );

      expect(screen.getByTestId('sort')).toHaveTextContent('popular');

      await act(async () => {
        await user.click(screen.getByTestId('sortButton'));
      });

      expect(screen.getByTestId('sort')).toHaveTextContent('price-high');
    });

    it('handleViewModeChange가 뷰 모드를 올바르게 업데이트해야 한다', async () => {
      const user = userEvent.setup();
      
      const TestComponent = () => {
        const context = useCategoryContext();
        return (
          <div>
            <div data-testid="viewMode">{context.viewMode}</div>
            <button 
              onClick={() => context.handleViewModeChange('list')}
              data-testid="viewModeButton"
            >
              리스트 뷰
            </button>
          </div>
        );
      };

      render(
        <CategoryProvider>
          <TestComponent />
        </CategoryProvider>
      );

      expect(screen.getByTestId('viewMode')).toHaveTextContent('grid');

      await act(async () => {
        await user.click(screen.getByTestId('viewModeButton'));
      });

      expect(screen.getByTestId('viewMode')).toHaveTextContent('list');
    });
  });

  describe('useCategoryContext 훅', () => {
    it('Provider 외부에서 사용시 에러를 던져야 한다', () => {
      const { result } = renderHook(() => {
        try {
          return useCategoryContext();
        } catch (error) {
          return error;
        }
      });

      expect(result.current).toBeInstanceOf(Error);
      expect((result.current as Error).message).toBe(
        'useCategoryContext must be used within a CategoryProvider'
      );
    });

    it('Provider 내부에서 정상적으로 컨텍스트를 반환해야 한다', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CategoryProvider>{children}</CategoryProvider>
      );

      const { result } = renderHook(() => useCategoryContext(), { wrapper });

      expect(result.current).toEqual({
        selectedCategoryId: 0,
        currentFilter: '전체',
        currentSort: 'popular',
        viewMode: 'grid',
        handleCategoryClick: expect.any(Function),
        handleFilterChange: expect.any(Function),
        handleSortChange: expect.any(Function),
        handleViewModeChange: expect.any(Function),
      });
    });
  });

  describe('useCallback 최적화', () => {
    it('핸들러 함수들이 리렌더링 시에도 같은 참조를 유지해야 한다', () => {
      let initialHandlers: any;
      let rerenderedHandlers: any;

      const TestComponent = ({ trigger }: { trigger: boolean }) => {
        const context = useCategoryContext();
        
        if (!trigger) {
          initialHandlers = {
            handleCategoryClick: context.handleCategoryClick,
            handleFilterChange: context.handleFilterChange,
            handleSortChange: context.handleSortChange,
            handleViewModeChange: context.handleViewModeChange,
          };
        } else {
          rerenderedHandlers = {
            handleCategoryClick: context.handleCategoryClick,
            handleFilterChange: context.handleFilterChange,
            handleSortChange: context.handleSortChange,
            handleViewModeChange: context.handleViewModeChange,
          };
        }

        return <div data-testid="trigger">{trigger.toString()}</div>;
      };

      const { rerender } = render(
        <CategoryProvider>
          <TestComponent trigger={false} />
        </CategoryProvider>
      );

      rerender(
        <CategoryProvider>
          <TestComponent trigger={true} />
        </CategoryProvider>
      );

      expect(initialHandlers.handleCategoryClick).toBe(rerenderedHandlers.handleCategoryClick);
      expect(initialHandlers.handleFilterChange).toBe(rerenderedHandlers.handleFilterChange);
      expect(initialHandlers.handleSortChange).toBe(rerenderedHandlers.handleSortChange);
      expect(initialHandlers.handleViewModeChange).toBe(rerenderedHandlers.handleViewModeChange);
    });
  });

  describe('edge cases', () => {
    it('잘못된 URL 파라미터 값을 처리해야 한다', () => {
      mockUseSearchParams.mockReturnValue(
        createMockSearchParams({
          category: 'invalid-number',
          view: 'invalid-view-mode' as any,
        })
      );

      const TestComponent = () => {
        const context = useCategoryContext();
        return (
          <div>
            <div data-testid="categoryId">{context.selectedCategoryId}</div>
            <div data-testid="viewMode">{context.viewMode}</div>
          </div>
        );
      };

      render(
        <CategoryProvider>
          <TestComponent />
        </CategoryProvider>
      );

      // parseInt('invalid-number')는 NaN을 반환
      expect(screen.getByTestId('categoryId')).toHaveTextContent('NaN');
      // 잘못된 view mode는 그대로 사용됨 (실제 구현에서는 fallback 없음)
      expect(screen.getByTestId('viewMode')).toHaveTextContent('invalid-view-mode');
    });

    it('빈 initialCategoryFilter를 처리해야 한다', () => {
      const TestComponent = () => {
        const context = useCategoryContext();
        return <div data-testid="categoryId">{context.selectedCategoryId}</div>;
      };

      render(
        <CategoryProvider initialCategoryFilter="">
          <TestComponent />
        </CategoryProvider>
      );

      expect(screen.getByTestId('categoryId')).toHaveTextContent('0');
    });
  });
});