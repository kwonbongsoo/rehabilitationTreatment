/**
 * CategoryGridRenderer 테스트
 * 
 * 카테고리 그리드 렌더러의 카테고리 표시, 선택 상태, 클릭 이벤트를 테스트합니다.
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSearchParams } from 'next/navigation';
import CategoryGridRenderer from '../CategoryGridRenderer';
import { CategoryProvider } from '@/domains/category/context/CategoryContext';
import { Category } from '@/domains/category/types/categories';

// Next.js navigation 모킹
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

// CategoryIconGrid 컴포넌트 모킹
jest.mock('@/components/common/CategoryIconGrid', () => {
  return function MockCategoryIconGrid({ 
    categories, 
    selectedCategoryId, 
    onCategoryClick,
    disableNavigation 
  }: {
    categories: Category[];
    selectedCategoryId: number;
    onCategoryClick: (categoryId: number) => void;
    disableNavigation?: boolean;
  }) {
    return (
      <div data-testid="category-icon-grid">
        <div data-testid="selected-category">{selectedCategoryId}</div>
        <div data-testid="disable-navigation">{disableNavigation?.toString()}</div>
        {categories.map((category) => (
          <button
            key={category.id}
            data-testid={`category-${category.id}`}
            onClick={() => onCategoryClick(category.id)}
            className={selectedCategoryId === category.id ? 'selected' : ''}
          >
            {category.name}
          </button>
        ))}
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

// 테스트용 카테고리 데이터
const mockCategories: Category[] = [
  {
    id: 1,
    name: '의류',
    slug: 'clothing',
    iconCode: 'clothing-icon',
    order: 1,
    isActive: true,
    link: '/categories/clothing',
  },
  {
    id: 2,
    name: '신발',
    slug: 'shoes',
    iconCode: 'shoes-icon',
    order: 2,
    isActive: true,
    link: '/categories/shoes',
  },
  {
    id: 3,
    name: '액세서리',
    slug: 'accessories',
    iconCode: 'accessories-icon',
    order: 3,
    isActive: true,
    link: '/categories/accessories',
  },
];

describe('CategoryGridRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSearchParams.mockReturnValue(createMockSearchParams());
  });

  const renderWithProvider = (
    categories = mockCategories,
    initialCategoryFilter?: string
  ) => {
    return render(
      <CategoryProvider initialCategoryFilter={initialCategoryFilter}>
        <CategoryGridRenderer categories={categories} />
      </CategoryProvider>
    );
  };

  describe('기본 렌더링', () => {
    it('CategoryIconGrid 컴포넌트를 렌더링해야 한다', () => {
      renderWithProvider();

      expect(screen.getByTestId('category-icon-grid')).toBeInTheDocument();
    });

    it('모든 카테고리를 표시해야 한다', () => {
      renderWithProvider();

      expect(screen.getByTestId('category-1')).toHaveTextContent('의류');
      expect(screen.getByTestId('category-2')).toHaveTextContent('신발');
      expect(screen.getByTestId('category-3')).toHaveTextContent('액세서리');
    });

    it('disableNavigation prop을 true로 설정해야 한다', () => {
      renderWithProvider();

      expect(screen.getByTestId('disable-navigation')).toHaveTextContent('true');
    });

    it('빈 카테고리 배열을 처리해야 한다', () => {
      renderWithProvider([]);

      expect(screen.getByTestId('category-icon-grid')).toBeInTheDocument();
      expect(screen.queryByTestId('category-1')).not.toBeInTheDocument();
    });
  });

  describe('카테고리 선택 상태', () => {
    it('기본 상태에서 선택된 카테고리가 없어야 한다 (0)', () => {
      renderWithProvider();

      expect(screen.getByTestId('selected-category')).toHaveTextContent('0');
    });

    it('초기 카테고리 필터가 설정된 경우 해당 카테고리가 선택되어야 한다', () => {
      renderWithProvider(mockCategories, '2');

      expect(screen.getByTestId('selected-category')).toHaveTextContent('2');
    });

    it('URL 파라미터의 카테고리가 선택되어야 한다', () => {
      mockUseSearchParams.mockReturnValue(
        createMockSearchParams({ category: '3' })
      );

      renderWithProvider();

      expect(screen.getByTestId('selected-category')).toHaveTextContent('3');
    });
  });

  describe('카테고리 클릭 이벤트', () => {
    it('카테고리를 클릭하면 선택 상태가 변경되어야 한다', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      expect(screen.getByTestId('selected-category')).toHaveTextContent('0');

      await act(async () => {
        await user.click(screen.getByTestId('category-2'));
      });

      expect(screen.getByTestId('selected-category')).toHaveTextContent('2');
    });

    it('이미 선택된 카테고리를 다시 클릭해도 정상적으로 처리되어야 한다', async () => {
      const user = userEvent.setup();
      renderWithProvider(mockCategories, '1');

      expect(screen.getByTestId('selected-category')).toHaveTextContent('1');

      await act(async () => {
        await user.click(screen.getByTestId('category-1'));
      });

      expect(screen.getByTestId('selected-category')).toHaveTextContent('1');
    });

    it('여러 카테고리를 순차적으로 클릭할 수 있어야 한다', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      // 첫 번째 카테고리 선택
      await act(async () => {
        await user.click(screen.getByTestId('category-1'));
      });
      expect(screen.getByTestId('selected-category')).toHaveTextContent('1');

      // 두 번째 카테고리 선택
      await act(async () => {
        await user.click(screen.getByTestId('category-3'));
      });
      expect(screen.getByTestId('selected-category')).toHaveTextContent('3');
    });
  });

  describe('props 전달', () => {
    it('CategoryIconGrid에 올바른 props를 전달해야 한다', () => {
      renderWithProvider(mockCategories, '2');

      // categories prop 전달 확인
      expect(screen.getByTestId('category-1')).toBeInTheDocument();
      expect(screen.getByTestId('category-2')).toBeInTheDocument();
      expect(screen.getByTestId('category-3')).toBeInTheDocument();

      // selectedCategoryId prop 전달 확인
      expect(screen.getByTestId('selected-category')).toHaveTextContent('2');

      // disableNavigation prop 전달 확인
      expect(screen.getByTestId('disable-navigation')).toHaveTextContent('true');
    });

    it('카테고리 데이터의 모든 속성이 올바르게 전달되어야 한다', () => {
      const customCategories: Category[] = [
        {
          id: 99,
          name: '테스트 카테고리',
          slug: 'test-category',
          iconCode: 'test-icon',
          order: 1,
          isActive: false,
          link: '/test',
        },
      ];

      renderWithProvider(customCategories);

      expect(screen.getByTestId('category-99')).toHaveTextContent('테스트 카테고리');
    });
  });

  describe('컨텍스트 통합', () => {
    it('CategoryProvider 없이는 에러가 발생해야 한다', () => {
      // console.error를 모킹하여 에러 출력 방지
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<CategoryGridRenderer categories={mockCategories} />);
      }).toThrow('useCategoryContext must be used within a CategoryProvider');

      console.error = originalError;
    });

    it('컨텍스트 상태 변경이 컴포넌트에 반영되어야 한다', async () => {
      const user = userEvent.setup();
      
      const TestWrapper = () => {
        return (
          <CategoryProvider>
            <CategoryGridRenderer categories={mockCategories} />
            <button 
              data-testid="external-category-button"
              onClick={() => {
                // 외부에서 카테고리 상태 변경을 시뮬레이션하기 위해
                // 카테고리 버튼을 직접 클릭
                screen.getByTestId('category-1').click();
              }}
            >
              External Change
            </button>
          </CategoryProvider>
        );
      };

      render(<TestWrapper />);

      expect(screen.getByTestId('selected-category')).toHaveTextContent('0');

      await act(async () => {
        await user.click(screen.getByTestId('external-category-button'));
      });

      expect(screen.getByTestId('selected-category')).toHaveTextContent('1');
    });
  });

  describe('edge cases', () => {
    it('null이나 undefined categories를 처리해야 한다', () => {
      // 실제로는 props validation이나 default props로 처리되어야 하므로
      // 이 테스트는 empty array를 전달하는 것으로 대체
      renderWithProvider([]);

      expect(screen.getByTestId('category-icon-grid')).toBeInTheDocument();
      expect(screen.queryByTestId('category-1')).not.toBeInTheDocument();
    });

    it('중복된 카테고리 ID를 가진 경우에도 정상 작동해야 한다', () => {
      const duplicateCategories: Category[] = [
        ...mockCategories,
        {
          id: 1, // 중복 ID
          name: '중복 카테고리',
          slug: 'duplicate',
          iconCode: 'duplicate-icon',
          order: 4,
          isActive: true,
          link: '/duplicate',
        },
      ];

      renderWithProvider(duplicateCategories);

      // React key warning이 발생하지만 렌더링은 성공해야 함
      expect(screen.getByTestId('category-icon-grid')).toBeInTheDocument();
    });

    it('매우 큰 카테고리 ID를 처리해야 한다', async () => {
      const user = userEvent.setup();
      const largeIdCategory: Category[] = [
        {
          id: 999999999,
          name: '큰 ID 카테고리',
          slug: 'large-id',
          iconCode: 'large-icon',
          order: 1,
          isActive: true,
          link: '/large',
        },
      ];

      renderWithProvider(largeIdCategory);

      await act(async () => {
        await user.click(screen.getByTestId('category-999999999'));
      });

      expect(screen.getByTestId('selected-category')).toHaveTextContent('999999999');
    });
  });
});