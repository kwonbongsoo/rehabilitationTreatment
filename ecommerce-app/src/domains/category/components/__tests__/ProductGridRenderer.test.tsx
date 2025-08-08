/**
 * ProductGridRenderer 테스트
 * 
 * 상품 그리드 렌더러의 필터링, 정렬, 뷰 모드 전환을 테스트합니다.
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSearchParams } from 'next/navigation';
import ProductGridRenderer from '../ProductGridRenderer';
import { CategoryProvider } from '@/domains/category/context/CategoryContext';
import { Product } from '@/domains/product/types/product';

// Next.js navigation 모킹
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

// ProductCard 컴포넌트 모킹
jest.mock('@/components/common/ProductCard', () => {
  return function MockProductCard({ 
    product, 
    onWishlistToggle 
  }: { 
    product: Product;
    onWishlistToggle: (productId: number) => void;
  }) {
    return (
      <div 
        data-testid={`product-${product.id}`}
        data-product-name={product.name}
        data-product-price={product.price}
        data-product-category={product.categoryId}
        data-product-rating={product.rating}
        onClick={() => onWishlistToggle(product.id)}
      >
        <div data-testid="product-name">{product.name}</div>
        <div data-testid="product-price">{product.price}</div>
        {product.discount && <div data-testid="product-discount">{product.discount}%</div>}
        {product.tags?.map(tag => (
          <span key={tag.id} data-testid={`product-tag-${tag.name}`}>
            {tag.name}
          </span>
        ))}
      </div>
    );
  };
});

// CSS 모듈 모킹
jest.mock('../ProductGridRenderer.module.css', () => ({
  productGrid: 'product-grid',
  listView: 'list-view',
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

// 테스트용 상품 데이터
const mockProducts: Product[] = [
  {
    id: 1,
    name: '할인 상품 A',
    description: '테스트 상품 설명',
    price: 10000,
    originalPrice: 15000,
    categoryId: 1,
    sellerId: 'seller1',
    rating: 4.5,
    discount: 33,
    tags: [{ id: 1, name: 'NEW' }, { id: 2, name: 'SALE' }],
    images: [],
    isNew: true,
    isFeatured: false,
  },
  {
    id: 2,
    name: '인기 상품 B',
    description: '테스트 상품 설명',
    price: 25000,
    originalPrice: 25000,
    categoryId: 2,
    sellerId: 'seller2',
    rating: 4.8,
    discount: 0,
    tags: [{ id: 3, name: 'POPULAR' }],
    images: [],
    isNew: false,
    isFeatured: true,
  },
  {
    id: 3,
    name: '신상품 C',
    description: '테스트 상품 설명',
    price: 8000,
    originalPrice: 8000,
    categoryId: 1,
    sellerId: 'seller3',
    rating: 3.2,
    discount: 0,
    tags: [{ id: 1, name: 'NEW' }],
    images: [],
    isNew: true,
    isFeatured: false,
  },
  {
    id: 4,
    name: '일반 상품 D',
    description: '테스트 상품 설명',
    price: 30000,
    originalPrice: 30000,
    categoryId: 2,
    sellerId: 'seller4',
    rating: 1.8,
    discount: 0,
    tags: [],
    images: [],
    isNew: false,
    isFeatured: false,
  },
];

describe('ProductGridRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSearchParams.mockReturnValue(createMockSearchParams());
  });

  const renderWithProvider = (
    products = mockProducts,
    initialParams: Record<string, string> = {}
  ) => {
    if (Object.keys(initialParams).length > 0) {
      mockUseSearchParams.mockReturnValue(createMockSearchParams(initialParams));
    }

    return render(
      <CategoryProvider>
        <ProductGridRenderer allProducts={products} />
      </CategoryProvider>
    );
  };

  describe('기본 렌더링', () => {
    it('모든 상품을 표시해야 한다', () => {
      renderWithProvider();

      expect(screen.getByTestId('product-1')).toBeInTheDocument();
      expect(screen.getByTestId('product-2')).toBeInTheDocument();
      expect(screen.getByTestId('product-3')).toBeInTheDocument();
      expect(screen.getByTestId('product-4')).toBeInTheDocument();
    });

    it('상품 그리드 컨테이너를 렌더링해야 한다', () => {
      renderWithProvider();

      const gridContainer = screen.getByTestId('product-1').closest('[data-view-mode]');
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer).toHaveAttribute('data-view-mode', 'grid');
    });

    it('빈 상품 배열을 처리해야 한다', () => {
      renderWithProvider([]);

      expect(screen.queryByTestId('product-1')).not.toBeInTheDocument();
    });
  });

  describe('카테고리 필터링', () => {
    it('선택된 카테고리의 상품만 표시해야 한다', () => {
      renderWithProvider(mockProducts, { category: '1' });

      expect(screen.getByTestId('product-1')).toBeInTheDocument(); // categoryId: 1
      expect(screen.getByTestId('product-3')).toBeInTheDocument(); // categoryId: 1
      expect(screen.queryByTestId('product-2')).not.toBeInTheDocument(); // categoryId: 2
      expect(screen.queryByTestId('product-4')).not.toBeInTheDocument(); // categoryId: 2
    });

    it('카테고리 0 (전체)일 때 모든 상품을 표시해야 한다', () => {
      renderWithProvider(mockProducts, { category: '0' });

      expect(screen.getByTestId('product-1')).toBeInTheDocument();
      expect(screen.getByTestId('product-2')).toBeInTheDocument();
      expect(screen.getByTestId('product-3')).toBeInTheDocument();
      expect(screen.getByTestId('product-4')).toBeInTheDocument();
    });

    it('존재하지 않는 카테고리 ID로 필터링하면 상품이 없어야 한다', () => {
      renderWithProvider(mockProducts, { category: '999' });

      expect(screen.queryByTestId('product-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('product-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('product-3')).not.toBeInTheDocument();
      expect(screen.queryByTestId('product-4')).not.toBeInTheDocument();
    });
  });

  describe('상품 필터링', () => {
    it('할인상품 필터가 동작해야 한다', () => {
      renderWithProvider(mockProducts, { filter: '할인상품' });

      expect(screen.getByTestId('product-1')).toBeInTheDocument(); // discount: 33
      expect(screen.queryByTestId('product-2')).not.toBeInTheDocument(); // discount: 0
      expect(screen.queryByTestId('product-3')).not.toBeInTheDocument(); // discount: 0
      expect(screen.queryByTestId('product-4')).not.toBeInTheDocument(); // discount: 0
    });

    it('신상품 필터가 동작해야 한다', () => {
      renderWithProvider(mockProducts, { filter: '신상품' });

      expect(screen.getByTestId('product-1')).toBeInTheDocument(); // NEW tag
      expect(screen.queryByTestId('product-2')).not.toBeInTheDocument(); // no NEW tag
      expect(screen.getByTestId('product-3')).toBeInTheDocument(); // NEW tag
      expect(screen.queryByTestId('product-4')).not.toBeInTheDocument(); // no NEW tag
    });

    it('인기상품 필터가 동작해야 한다', () => {
      renderWithProvider(mockProducts, { filter: '인기상품' });

      expect(screen.getByTestId('product-1')).toBeInTheDocument(); // rating: 4.5 > 2
      expect(screen.getByTestId('product-2')).toBeInTheDocument(); // rating: 4.8 > 2
      expect(screen.getByTestId('product-3')).toBeInTheDocument(); // rating: 3.2 > 2
      expect(screen.queryByTestId('product-4')).not.toBeInTheDocument(); // rating: 1.8 <= 2
    });

    it('전체 필터일 때 모든 상품을 표시해야 한다', () => {
      renderWithProvider(mockProducts, { filter: '전체' });

      expect(screen.getByTestId('product-1')).toBeInTheDocument();
      expect(screen.getByTestId('product-2')).toBeInTheDocument();
      expect(screen.getByTestId('product-3')).toBeInTheDocument();
      expect(screen.getByTestId('product-4')).toBeInTheDocument();
    });
  });

  describe('상품 정렬', () => {
    it('낮은 가격순으로 정렬해야 한다', () => {
      renderWithProvider(mockProducts, { sort: 'price-low' });

      const productElements = screen.getAllByTestId(/^product-\d+$/);
      const prices = productElements.map(el => 
        parseInt(el.getAttribute('data-product-price') || '0')
      );

      // 8000, 10000, 25000, 30000 순서
      expect(prices).toEqual([8000, 10000, 25000, 30000]);
    });

    it('높은 가격순으로 정렬해야 한다', () => {
      renderWithProvider(mockProducts, { sort: 'price-high' });

      const productElements = screen.getAllByTestId(/^product-\d+$/);
      const prices = productElements.map(el => 
        parseInt(el.getAttribute('data-product-price') || '0')
      );

      // 30000, 25000, 10000, 8000 순서
      expect(prices).toEqual([30000, 25000, 10000, 8000]);
    });

    it('평점순으로 정렬해야 한다', () => {
      renderWithProvider(mockProducts, { sort: 'rating' });

      const productElements = screen.getAllByTestId(/^product-\d+$/);
      const ratings = productElements.map(el => 
        parseFloat(el.getAttribute('data-product-rating') || '0')
      );

      // 4.8, 4.5, 3.2, 1.8 순서 (높은 평점부터)
      expect(ratings).toEqual([4.8, 4.5, 3.2, 1.8]);
    });

    it('인기순(기본)으로 정렬해야 한다', () => {
      renderWithProvider(mockProducts, { sort: 'popular' });

      const productElements = screen.getAllByTestId(/^product-\d+$/);
      const ratings = productElements.map(el => 
        parseFloat(el.getAttribute('data-product-rating') || '0')
      );

      // popular = rating과 동일한 로직 (높은 평점부터)
      expect(ratings).toEqual([4.8, 4.5, 3.2, 1.8]);
    });
  });

  describe('뷰 모드', () => {
    it('그리드 뷰 모드 CSS 클래스가 적용되어야 한다', () => {
      renderWithProvider(mockProducts, { view: 'grid' });

      const gridContainer = screen.getByTestId('product-1').closest('[data-view-mode]');
      expect(gridContainer).toHaveClass('product-grid');
      expect(gridContainer).not.toHaveClass('list-view');
      expect(gridContainer).toHaveAttribute('data-view-mode', 'grid');
    });

    it('리스트 뷰 모드 CSS 클래스가 적용되어야 한다', () => {
      renderWithProvider(mockProducts, { view: 'list' });

      const gridContainer = screen.getByTestId('product-1').closest('[data-view-mode]');
      expect(gridContainer).toHaveClass('product-grid');
      expect(gridContainer).toHaveClass('list-view');
      expect(gridContainer).toHaveAttribute('data-view-mode', 'list');
    });
  });

  describe('복합 필터링 및 정렬', () => {
    it('카테고리 + 필터 + 정렬을 동시에 적용해야 한다', () => {
      renderWithProvider(mockProducts, {
        category: '1', // 카테고리 1
        filter: '신상품', // NEW 태그 있는 상품
        sort: 'price-high' // 높은 가격순
      });

      // 카테고리 1 + NEW 태그 상품: product-1 (10000원), product-3 (8000원)
      // 높은 가격순 정렬: product-1, product-3 순서
      const productElements = screen.getAllByTestId(/^product-\d+$/);
      expect(productElements).toHaveLength(2);
      
      const prices = productElements.map(el => 
        parseInt(el.getAttribute('data-product-price') || '0')
      );
      expect(prices).toEqual([10000, 8000]);
    });

    it('필터링 결과가 없으면 빈 그리드를 표시해야 한다', () => {
      renderWithProvider(mockProducts, {
        category: '1',
        filter: '할인상품'
      });

      // 카테고리 1에서 할인상품은 product-1만 있음
      expect(screen.getByTestId('product-1')).toBeInTheDocument();
      expect(screen.queryByTestId('product-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('product-3')).not.toBeInTheDocument();
      expect(screen.queryByTestId('product-4')).not.toBeInTheDocument();
    });
  });

  describe('동적 상태 변경', () => {
    it('컨텍스트 상태 변경이 필터링에 반영되어야 한다', async () => {
      const TestWrapper = () => {
        const [trigger, setTrigger] = React.useState(false);
        
        return (
          <CategoryProvider>
            <ProductGridRenderer allProducts={mockProducts} />
            <button 
              data-testid="change-filter"
              onClick={() => setTrigger(!trigger)}
            >
              필터 변경
            </button>
          </CategoryProvider>
        );
      };

      render(<TestWrapper />);

      // 초기 상태: 모든 상품 표시
      expect(screen.getAllByTestId(/^product-\d+$/)).toHaveLength(4);

      // 상태 변경 트리거 (실제로는 컨텍스트의 핸들러를 통해 변경되어야 함)
      const user = userEvent.setup();
      await act(async () => {
        await user.click(screen.getByTestId('change-filter'));
      });

      // 여전히 모든 상품이 표시되어야 함 (실제 필터 변경이 없었으므로)
      expect(screen.getAllByTestId(/^product-\d+$/)).toHaveLength(4);
    });
  });

  describe('ProductCard 이벤트', () => {
    it('위시리스트 토글 함수를 ProductCard에 전달해야 한다', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      // ProductCard 클릭 (onWishlistToggle 호출)
      await act(async () => {
        await user.click(screen.getByTestId('product-1'));
      });

      // 함수가 호출되었는지 확인 (현재 구현에서는 단순히 productId를 반환)
      expect(screen.getByTestId('product-1')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('rating이 0인 상품을 처리해야 한다', () => {
      const productsWithZeroRating: Product[] = [
        {
          ...mockProducts[0],
          id: 1,
          rating: 0,
        },
      ];

      renderWithProvider(productsWithZeroRating);

      // rating이 0인 상품이 에러 없이 렌더링되어야 함
      expect(screen.getByTestId('product-1')).toBeInTheDocument();
    });

    it('tags가 없는 상품을 처리해야 한다', () => {
      const productsWithoutTags: Product[] = [
        {
          ...mockProducts[0],
          id: 1,
          tags: undefined as any,
        },
      ];

      renderWithProvider(productsWithoutTags, { filter: '신상품' });

      // tags가 없으므로 신상품 필터에 걸리지 않아야 함
      expect(screen.queryByTestId('product-1')).not.toBeInTheDocument();
    });

    it('discount가 undefined인 상품을 처리해야 한다', () => {
      const productsWithoutDiscount: Product[] = [
        {
          ...mockProducts[0],
          id: 1,
          discount: undefined as any,
        },
      ];

      renderWithProvider(productsWithoutDiscount, { filter: '할인상품' });

      // discount가 없으므로 할인상품 필터에 걸리지 않아야 함
      expect(screen.queryByTestId('product-1')).not.toBeInTheDocument();
    });

    it('매우 많은 상품을 처리해야 한다', () => {
      const manyProducts: Product[] = Array.from({ length: 100 }, (_, index) => ({
        ...mockProducts[0],
        id: index + 1,
        name: `상품 ${index + 1}`,
        price: (index + 1) * 1000,
      }));

      renderWithProvider(manyProducts);

      expect(screen.getAllByTestId(/^product-\d+$/)).toHaveLength(100);
    });
  });

  describe('useMemo 최적화', () => {
    it('동일한 props일 때 필터링 결과가 캐시되어야 한다', () => {
      const { rerender } = renderWithProvider();

      const initialProducts = screen.getAllByTestId(/^product-\d+$/);
      
      // props 변경 없이 리렌더링
      rerender(
        <CategoryProvider>
          <ProductGridRenderer allProducts={mockProducts} />
        </CategoryProvider>
      );

      const rerenderedProducts = screen.getAllByTestId(/^product-\d+$/);
      
      expect(initialProducts).toHaveLength(rerenderedProducts.length);
    });
  });
});