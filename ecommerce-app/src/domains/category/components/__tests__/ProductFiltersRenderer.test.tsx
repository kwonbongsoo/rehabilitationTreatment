/**
 * ProductFiltersRenderer 테스트
 * 
 * 상품 필터 렌더러의 필터/정렬 옵션 표시, 상태 관리, 이벤트 처리를 테스트합니다.
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSearchParams } from 'next/navigation';
import ProductFiltersRenderer from '../ProductFiltersRenderer';
import { CategoryProvider } from '@/domains/category/context/CategoryContext';

// Next.js navigation 모킹
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

// ProductFilters 컴포넌트 모킹
jest.mock('@/components/common/ProductFilters', () => {
  return function MockProductFilters({
    filterOptions,
    sortOptions,
    onFilterChange,
    onSortChange,
    onViewModeChange,
    defaultFilter,
    defaultSort,
    defaultViewMode,
  }: {
    filterOptions: Array<{ value: string; label: string }>;
    sortOptions: Array<{ value: string; label: string }>;
    onFilterChange: (filter: string) => void;
    onSortChange: (sort: string) => void;
    onViewModeChange: (viewMode: 'grid' | 'list') => void;
    defaultFilter: string;
    defaultSort: string;
    defaultViewMode: 'grid' | 'list';
  }) {
    return (
      <div data-testid="product-filters">
        <div data-testid="default-filter">{defaultFilter}</div>
        <div data-testid="default-sort">{defaultSort}</div>
        <div data-testid="default-view-mode">{defaultViewMode}</div>
        
        {/* Filter Options */}
        <div data-testid="filter-options">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              data-testid={`filter-${option.value}`}
              onClick={() => onFilterChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div data-testid="sort-options">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              data-testid={`sort-${option.value}`}
              onClick={() => onSortChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div data-testid="view-mode-controls">
          <button
            data-testid="view-mode-grid"
            onClick={() => onViewModeChange('grid')}
          >
            Grid View
          </button>
          <button
            data-testid="view-mode-list"
            onClick={() => onViewModeChange('list')}
          >
            List View
          </button>
        </div>
      </div>
    );
  };
});

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

// 테스트용 필터/정렬 옵션
const mockFilterOptions = [
  { value: '전체', label: '전체' },
  { value: '할인상품', label: '할인상품' },
  { value: '신상품', label: '신상품' },
  { value: '인기상품', label: '인기상품' },
];

const mockSortOptions = [
  { value: 'popular', label: '인기순' },
  { value: 'price-low', label: '낮은 가격순' },
  { value: 'price-high', label: '높은 가격순' },
  { value: 'rating', label: '평점순' },
];

describe('ProductFiltersRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSearchParams.mockReturnValue(createMockSearchParams());
  });

  const renderWithProvider = (
    filterOptions = mockFilterOptions,
    sortOptions = mockSortOptions,
    initialParams: Record<string, string> = {}
  ) => {
    if (Object.keys(initialParams).length > 0) {
      mockUseSearchParams.mockReturnValue(createMockSearchParams(initialParams));
    }

    return render(
      <CategoryProvider>
        <ProductFiltersRenderer
          filterOptions={filterOptions}
          sortOptions={sortOptions}
        />
      </CategoryProvider>
    );
  };

  describe('기본 렌더링', () => {
    it('ProductFilters 컴포넌트를 렌더링해야 한다', () => {
      renderWithProvider();

      expect(screen.getByTestId('product-filters')).toBeInTheDocument();
    });

    it('필터 옵션들을 표시해야 한다', () => {
      renderWithProvider();

      expect(screen.getByTestId('filter-전체')).toHaveTextContent('전체');
      expect(screen.getByTestId('filter-할인상품')).toHaveTextContent('할인상품');
      expect(screen.getByTestId('filter-신상품')).toHaveTextContent('신상품');
      expect(screen.getByTestId('filter-인기상품')).toHaveTextContent('인기상품');
    });

    it('정렬 옵션들을 표시해야 한다', () => {
      renderWithProvider();

      expect(screen.getByTestId('sort-popular')).toHaveTextContent('인기순');
      expect(screen.getByTestId('sort-price-low')).toHaveTextContent('낮은 가격순');
      expect(screen.getByTestId('sort-price-high')).toHaveTextContent('높은 가격순');
      expect(screen.getByTestId('sort-rating')).toHaveTextContent('평점순');
    });

    it('뷰 모드 컨트롤을 표시해야 한다', () => {
      renderWithProvider();

      expect(screen.getByTestId('view-mode-grid')).toHaveTextContent('Grid View');
      expect(screen.getByTestId('view-mode-list')).toHaveTextContent('List View');
    });
  });

  describe('기본값 설정', () => {
    it('컨텍스트의 기본값을 ProductFilters에 전달해야 한다', () => {
      renderWithProvider();

      expect(screen.getByTestId('default-filter')).toHaveTextContent('전체');
      expect(screen.getByTestId('default-sort')).toHaveTextContent('popular');
      expect(screen.getByTestId('default-view-mode')).toHaveTextContent('grid');
    });

    it('URL 파라미터의 값을 기본값으로 설정해야 한다', () => {
      renderWithProvider(
        mockFilterOptions,
        mockSortOptions,
        {
          filter: '할인상품',
          sort: 'price-high',
          view: 'list'
        }
      );

      expect(screen.getByTestId('default-filter')).toHaveTextContent('할인상품');
      expect(screen.getByTestId('default-sort')).toHaveTextContent('price-high');
      expect(screen.getByTestId('default-view-mode')).toHaveTextContent('list');
    });
  });

  describe('필터 변경 이벤트', () => {
    it('필터를 클릭하면 상태가 변경되어야 한다', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      expect(screen.getByTestId('default-filter')).toHaveTextContent('전체');

      await act(async () => {
        await user.click(screen.getByTestId('filter-할인상품'));
      });

      expect(screen.getByTestId('default-filter')).toHaveTextContent('할인상품');
    });

    it('여러 필터를 순차적으로 선택할 수 있어야 한다', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      // 할인상품 선택
      await act(async () => {
        await user.click(screen.getByTestId('filter-할인상품'));
      });
      expect(screen.getByTestId('default-filter')).toHaveTextContent('할인상품');

      // 신상품 선택
      await act(async () => {
        await user.click(screen.getByTestId('filter-신상품'));
      });
      expect(screen.getByTestId('default-filter')).toHaveTextContent('신상품');
    });

    it('같은 필터를 다시 클릭해도 상태가 유지되어야 한다', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await act(async () => {
        await user.click(screen.getByTestId('filter-인기상품'));
      });
      expect(screen.getByTestId('default-filter')).toHaveTextContent('인기상품');

      await act(async () => {
        await user.click(screen.getByTestId('filter-인기상품'));
      });
      expect(screen.getByTestId('default-filter')).toHaveTextContent('인기상품');
    });
  });

  describe('정렬 변경 이벤트', () => {
    it('정렬을 클릭하면 상태가 변경되어야 한다', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      expect(screen.getByTestId('default-sort')).toHaveTextContent('popular');

      await act(async () => {
        await user.click(screen.getByTestId('sort-price-low'));
      });

      expect(screen.getByTestId('default-sort')).toHaveTextContent('price-low');
    });

    it('여러 정렬 옵션을 순차적으로 선택할 수 있어야 한다', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      // 높은 가격순 선택
      await act(async () => {
        await user.click(screen.getByTestId('sort-price-high'));
      });
      expect(screen.getByTestId('default-sort')).toHaveTextContent('price-high');

      // 평점순 선택
      await act(async () => {
        await user.click(screen.getByTestId('sort-rating'));
      });
      expect(screen.getByTestId('default-sort')).toHaveTextContent('rating');
    });
  });

  describe('뷰 모드 변경 이벤트', () => {
    it('그리드 뷰를 클릭하면 상태가 변경되어야 한다', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        mockFilterOptions,
        mockSortOptions,
        { view: 'list' }
      );

      expect(screen.getByTestId('default-view-mode')).toHaveTextContent('list');

      await act(async () => {
        await user.click(screen.getByTestId('view-mode-grid'));
      });

      expect(screen.getByTestId('default-view-mode')).toHaveTextContent('grid');
    });

    it('리스트 뷰를 클릭하면 상태가 변경되어야 한다', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      expect(screen.getByTestId('default-view-mode')).toHaveTextContent('grid');

      await act(async () => {
        await user.click(screen.getByTestId('view-mode-list'));
      });

      expect(screen.getByTestId('default-view-mode')).toHaveTextContent('list');
    });
  });

  describe('복합 상태 변경', () => {
    it('필터, 정렬, 뷰 모드를 동시에 변경할 수 있어야 한다', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      // 초기 상태 확인
      expect(screen.getByTestId('default-filter')).toHaveTextContent('전체');
      expect(screen.getByTestId('default-sort')).toHaveTextContent('popular');
      expect(screen.getByTestId('default-view-mode')).toHaveTextContent('grid');

      // 모든 상태 변경
      await act(async () => {
        await user.click(screen.getByTestId('filter-할인상품'));
        await user.click(screen.getByTestId('sort-price-low'));
        await user.click(screen.getByTestId('view-mode-list'));
      });

      expect(screen.getByTestId('default-filter')).toHaveTextContent('할인상품');
      expect(screen.getByTestId('default-sort')).toHaveTextContent('price-low');
      expect(screen.getByTestId('default-view-mode')).toHaveTextContent('list');
    });
  });

  describe('props 검증', () => {
    it('빈 필터 옵션 배열을 처리해야 한다', () => {
      renderWithProvider([], mockSortOptions);

      expect(screen.getByTestId('product-filters')).toBeInTheDocument();
      expect(screen.queryByTestId('filter-전체')).not.toBeInTheDocument();
    });

    it('빈 정렬 옵션 배열을 처리해야 한다', () => {
      renderWithProvider(mockFilterOptions, []);

      expect(screen.getByTestId('product-filters')).toBeInTheDocument();
      expect(screen.queryByTestId('sort-popular')).not.toBeInTheDocument();
    });

    it('사용자 정의 옵션을 올바르게 표시해야 한다', () => {
      const customFilterOptions = [
        { value: 'custom1', label: '커스텀 필터 1' },
        { value: 'custom2', label: '커스텀 필터 2' },
      ];

      const customSortOptions = [
        { value: 'custom-sort1', label: '커스텀 정렬 1' },
        { value: 'custom-sort2', label: '커스텀 정렬 2' },
      ];

      renderWithProvider(customFilterOptions, customSortOptions);

      expect(screen.getByTestId('filter-custom1')).toHaveTextContent('커스텀 필터 1');
      expect(screen.getByTestId('filter-custom2')).toHaveTextContent('커스텀 필터 2');
      expect(screen.getByTestId('sort-custom-sort1')).toHaveTextContent('커스텀 정렬 1');
      expect(screen.getByTestId('sort-custom-sort2')).toHaveTextContent('커스텀 정렬 2');
    });
  });

  describe('컨텍스트 통합', () => {
    it('CategoryProvider 없이는 에러가 발생해야 한다', () => {
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(
          <ProductFiltersRenderer
            filterOptions={mockFilterOptions}
            sortOptions={mockSortOptions}
          />
        );
      }).toThrow('useCategoryContext must be used within a CategoryProvider');

      console.error = originalError;
    });

    it('컨텍스트 상태가 컴포넌트에 반영되어야 한다', () => {
      renderWithProvider(
        mockFilterOptions,
        mockSortOptions,
        {
          filter: '신상품',
          sort: 'rating',
          view: 'list'
        }
      );

      expect(screen.getByTestId('default-filter')).toHaveTextContent('신상품');
      expect(screen.getByTestId('default-sort')).toHaveTextContent('rating');
      expect(screen.getByTestId('default-view-mode')).toHaveTextContent('list');
    });
  });

  describe('edge cases', () => {
    it('중복된 값을 가진 옵션을 처리해야 한다', () => {
      const duplicateOptions = [
        { value: 'duplicate', label: '중복 옵션 1' },
        { value: 'duplicate', label: '중복 옵션 2' },
      ];

      renderWithProvider(duplicateOptions, mockSortOptions);

      // React key warning이 발생하지만 렌더링은 성공해야 함
      expect(screen.getByTestId('product-filters')).toBeInTheDocument();
    });

    it('특수 문자가 포함된 옵션 값을 처리해야 한다', () => {
      const specialOptions = [
        { value: 'special-chars!@#', label: '특수문자 옵션' },
        { value: 'space option', label: '공백 포함 옵션' },
      ];

      renderWithProvider(specialOptions, mockSortOptions);

      expect(screen.getByTestId('filter-special-chars!@#')).toHaveTextContent('특수문자 옵션');
      expect(screen.getByTestId('filter-space option')).toHaveTextContent('공백 포함 옵션');
    });

    it('매우 긴 레이블을 가진 옵션을 처리해야 한다', () => {
      const longLabelOption = {
        value: 'long',
        label: '매우 긴 레이블을 가진 옵션입니다. 이것은 UI에서 어떻게 표시될까요?'
      };

      renderWithProvider([longLabelOption], mockSortOptions);

      expect(screen.getByTestId('filter-long')).toHaveTextContent(longLabelOption.label);
    });
  });
});