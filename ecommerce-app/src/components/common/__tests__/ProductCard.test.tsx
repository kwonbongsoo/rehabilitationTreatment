/**
 * ProductCard 컴포넌트 테스트
 *
 * 상품 카드의 렌더링, 상호작용, 접근성을 테스트합니다.
 * 사이드이펙트 방지를 위해 모든 의존성을 모킹합니다.
 */

import React, { ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCard from '../ProductCard';
import { Product } from '@/domains/product/types/product';

// Next.js Link 모킹
jest.mock('next/link', () => {
  return function MockLink({ children, href, className, prefetch, ...props }: any) {
    // 불리언 속성들을 적절히 처리
    const filteredProps = { ...props };
    if (typeof prefetch === 'boolean') {
      delete filteredProps.prefetch;
    }

    return (
      <a href={href} className={className} {...filteredProps}>
        {children}
      </a>
    );
  };
});

// OptimizedImageNext 모킹
jest.mock('../OptimizedImageNext', () => {
  return function MockOptimizedImage({
    src,
    alt,
    width,
    height,
    className,
    priority,
    lazy,
    ...props
  }: any): ReactElement {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        data-priority={priority}
        data-lazy={lazy}
        {...props}
      />
    );
  };
});

// 콘솔 경고 모킹 (CSS 모듈 관련)
const mockConsoleWarn = jest.fn();
global.console.warn = mockConsoleWarn;

describe('ProductCard', () => {
  const mockProduct: Product = {
    id: 1,
    name: '테스트 상품',
    description: '테스트 상품 설명',
    price: 50000,
    originalPrice: 60000,
    mainImage: '/images/test-product.jpg',
    images: ['/images/test-product.jpg'],
    categoryId: 1,
    stock: 10,
    rating: 4.5,
    sellerId: 'star12310',
    reviews: 25,
    isNew: false,
    isFeatured: false,
    tags: [
      { name: '신상품', color: '#FF6B6B' },
      { name: '할인', color: '#4ECDC4' },
    ],
  };

  const defaultProps = {
    product: mockProduct,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleWarn.mockClear();
  });

  describe('기본 렌더링', () => {
    it('상품 정보가 올바르게 렌더링되어야 한다', () => {
      render(<ProductCard {...defaultProps} />);

      expect(screen.getByText('테스트 상품')).toBeInTheDocument();
      expect(screen.getByText('테스트 상품 설명')).toBeInTheDocument();
      expect(screen.getByText('50,000원')).toBeInTheDocument();
      expect(screen.getByText('60,000원')).toBeInTheDocument();
    });

    it('상품 이미지가 올바르게 렌더링되어야 한다', () => {
      render(<ProductCard {...defaultProps} />);

      const image = screen.getByRole('img', { name: '테스트 상품' });
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/images/test-product.jpg');
      expect(image).toHaveAttribute('alt', '테스트 상품');
    });

    it('상품 링크가 올바르게 설정되어야 한다', () => {
      render(<ProductCard {...defaultProps} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/product/1');
    });
  });

  describe('가격 표시', () => {
    it('정가와 할인가가 모두 표시되어야 한다', () => {
      render(<ProductCard {...defaultProps} />);

      expect(screen.getByText('50,000원')).toBeInTheDocument();
      expect(screen.getByText('60,000원')).toBeInTheDocument();
    });

    it('할인가만 있을 때 정가가 표시되지 않아야 한다', () => {
      const productWithoutOriginalPrice: Product = {
        ...mockProduct,
      };
      delete (productWithoutOriginalPrice as any).originalPrice;

      render(<ProductCard product={productWithoutOriginalPrice} />);

      expect(screen.getByText('50,000원')).toBeInTheDocument();
      expect(screen.queryByText('60,000원')).not.toBeInTheDocument();
    });

    it('가격 포맷팅이 올바르게 적용되어야 한다', () => {
      const expensiveProduct = {
        ...mockProduct,
        price: 1234567,
        originalPrice: 2345678,
      };

      render(<ProductCard product={expensiveProduct} />);

      expect(screen.getByText('1,234,567원')).toBeInTheDocument();
      expect(screen.getByText('2,345,678원')).toBeInTheDocument();
    });
  });

  describe('평점 표시', () => {
    it('평점이 있을 때 별점이 표시되어야 한다', () => {
      render(<ProductCard {...defaultProps} />);

      expect(screen.getByText('4.5')).toBeInTheDocument();
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // SVG 별
    });

    it('평점이 없을 때 별점이 표시되지 않아야 한다', () => {
      const productWithoutRating: Product = {
        ...mockProduct,
        rating: 0,
      };

      render(<ProductCard product={productWithoutRating} />);

      expect(screen.queryByText('4.5')).not.toBeInTheDocument();
    });

    it('평점이 0일 때 별점이 표시되지 않아야 한다', () => {
      const productWithZeroRating = {
        ...mockProduct,
        rating: 0,
      };

      render(<ProductCard product={productWithZeroRating} />);

      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  describe('태그 표시', () => {
    it('상품 태그들이 올바르게 렌더링되어야 한다', () => {
      render(<ProductCard {...defaultProps} />);

      expect(screen.getByText('신상품')).toBeInTheDocument();
      expect(screen.getByText('할인')).toBeInTheDocument();
    });

    it('태그에 올바른 배경색이 적용되어야 한다', () => {
      render(<ProductCard {...defaultProps} />);

      const newTag = screen.getByText('신상품');
      const discountTag = screen.getByText('할인');

      expect(newTag).toHaveStyle({ backgroundColor: '#FF6B6B' });
      expect(discountTag).toHaveStyle({ backgroundColor: '#4ECDC4' });
    });

    it('태그가 없을 때 태그 영역이 표시되지 않아야 한다', () => {
      const productWithoutTags: Product = {
        ...mockProduct,
      };
      delete (productWithoutTags as any).tags;

      render(<ProductCard product={productWithoutTags} />);

      expect(screen.queryByText('신상품')).not.toBeInTheDocument();
      expect(screen.queryByText('할인')).not.toBeInTheDocument();
    });

    it('빈 태그 배열일 때 태그가 렌더링되지 않아야 한다', () => {
      const productWithEmptyTags = {
        ...mockProduct,
        tags: [],
      };

      render(<ProductCard product={productWithEmptyTags} />);

      expect(screen.queryByText('신상품')).not.toBeInTheDocument();
      expect(screen.queryByText('할인')).not.toBeInTheDocument();
    });
  });

  describe('설명 표시', () => {
    it('상품 설명이 표시되어야 한다', () => {
      render(<ProductCard {...defaultProps} />);

      expect(screen.getByText('테스트 상품 설명')).toBeInTheDocument();
    });

    it('설명이 없을 때 설명 영역이 표시되지 않아야 한다', () => {
      const productWithoutDescription: Product = {
        ...mockProduct,
        description: '',
      };

      render(<ProductCard product={productWithoutDescription} />);

      expect(screen.queryByText('테스트 상품 설명')).not.toBeInTheDocument();
    });

    it('빈 설명일 때 설명 영역이 표시되지 않아야 한다', () => {
      const productWithEmptyDescription = {
        ...mockProduct,
        description: '',
      };

      render(<ProductCard product={productWithEmptyDescription} />);

      expect(screen.queryByText('테스트 상품 설명')).not.toBeInTheDocument();
    });
  });

  describe('찜하기 기능', () => {
    it('기본적으로 빈 하트 아이콘이 표시되어야 한다', () => {
      render(
        <ProductCard {...defaultProps} isWishlisted={false} data-testid="wishlist-button-empty" />,
      );

      const emptyIcon = screen.getByTestId('wishlist-button-empty');
      expect(emptyIcon).toBeInTheDocument();
      expect(emptyIcon).toHaveAttribute('fill', 'none');
      expect(emptyIcon).toHaveAttribute('stroke', 'currentColor');
    });

    it('찜한 상태일 때 채워진 하트 아이콘이 표시되어야 한다', () => {
      render(
        <ProductCard {...defaultProps} isWishlisted={true} data-testid="wishlist-button-filled" />,
      );

      const filledIcon = screen.getByTestId('wishlist-button-filled');
      expect(filledIcon).toBeInTheDocument();
      expect(filledIcon).toHaveAttribute('fill', '#FF4757');
    });

    it('찜하기 버튼 클릭 시 onWishlistToggle이 호출되어야 한다', async () => {
      const user = userEvent.setup();
      const mockOnWishlistToggle = jest.fn();

      render(<ProductCard {...defaultProps} onWishlistToggle={mockOnWishlistToggle} />);

      const wishlistButton = screen.getByRole('button', { name: '찜하기' });
      await user.click(wishlistButton);

      expect(mockOnWishlistToggle).toHaveBeenCalledWith(1);
      expect(mockOnWishlistToggle).toHaveBeenCalledTimes(1);
    });

    it('onWishlistToggle이 없을 때 에러가 발생하지 않아야 한다', async () => {
      const user = userEvent.setup();

      render(<ProductCard {...defaultProps} />);

      const wishlistButton = screen.getByRole('button', { name: '찜하기' });

      // 에러 없이 클릭이 가능해야 함
      await expect(user.click(wishlistButton)).resolves.not.toThrow();
    });

    it('찜하기 버튼 클릭 시 링크 이동이 방지되어야 한다', () => {
      const mockOnWishlistToggle = jest.fn();
      render(<ProductCard {...defaultProps} onWishlistToggle={mockOnWishlistToggle} />);

      const wishlistButton = screen.getByRole('button', { name: '찜하기' });
      const clickEvent = new MouseEvent('click', { bubbles: true });

      // 이벤트 전파 방지 확인을 위한 스파이
      const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');
      const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');

      fireEvent(wishlistButton, clickEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  describe('이미지 최적화', () => {
    it('priority prop이 이미지에 전달되어야 한다', () => {
      render(<ProductCard {...defaultProps} priority={true} />);

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('data-priority', 'true');
    });

    it('lazy prop이 이미지에 전달되어야 한다', () => {
      render(<ProductCard {...defaultProps} lazy={true} />);

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('data-lazy', 'true');
    });

    it('priority가 true일 때 lazy가 false가 되어야 한다', () => {
      render(<ProductCard {...defaultProps} priority={true} lazy={true} />);

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('data-priority', 'true');
      expect(image).toHaveAttribute('data-lazy', 'false');
    });

    it('priority가 false일 때 lazy 설정이 유지되어야 한다', () => {
      render(<ProductCard {...defaultProps} priority={false} lazy={true} />);

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('data-priority', 'false');
      expect(image).toHaveAttribute('data-lazy', 'true');
    });
  });

  describe('접근성', () => {
    it('상품명이 제목으로 적절히 마크업되어야 한다', () => {
      render(<ProductCard {...defaultProps} />);

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('테스트 상품');
    });

    it('찜하기 버튼에 적절한 aria-label이 설정되어야 한다', () => {
      render(<ProductCard {...defaultProps} />);

      expect(screen.getByRole('button', { name: '찜하기' })).toBeInTheDocument();
    });

    it('이미지에 적절한 alt 텍스트가 설정되어야 한다', () => {
      render(<ProductCard {...defaultProps} />);

      expect(screen.getByRole('img', { name: '테스트 상품' })).toBeInTheDocument();
    });

    it('키보드 내비게이션이 가능해야 한다', async () => {
      const user = userEvent.setup();
      const mockOnWishlistToggle = jest.fn();

      render(<ProductCard {...defaultProps} onWishlistToggle={mockOnWishlistToggle} />);

      // Tab으로 링크에 먼저 포커스 (DOM 순서상 첫 번째)
      await user.tab();
      expect(screen.getByRole('link')).toHaveFocus();

      // 다시 Tab으로 찜하기 버튼에 포커스
      await user.tab();
      expect(screen.getByRole('button', { name: '찜하기' })).toHaveFocus();

      // Enter 키로 찜하기 실행
      await user.keyboard('{Enter}');
      expect(mockOnWishlistToggle).toHaveBeenCalledWith(1);
    });
  });

  describe('다양한 상품 데이터', () => {
    it('최소한의 데이터만 있는 상품이 렌더링되어야 한다', () => {
      const minimalProduct: Product = {
        id: 2,
        name: '최소 상품',
        description: '',
        price: 10000,
        mainImage: '/images/minimal.jpg',
        images: ['/images/minimal.jpg'],
        categoryId: 2,
        stock: 1,
        rating: 0,
        reviews: 0,
        sellerId: 'star12310',
        isNew: false,
        isFeatured: false,
      };

      render(<ProductCard product={minimalProduct} />);

      expect(screen.getByText('최소 상품')).toBeInTheDocument();
      expect(screen.getByText('10,000원')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: '최소 상품' })).toBeInTheDocument();

      // 선택적 요소들이 표시되지 않음
      expect(screen.queryByText('0')).not.toBeInTheDocument(); // 평점
      expect(screen.queryByRole('paragraph')).not.toBeInTheDocument(); // 설명
    });

    it('긴 상품명이 적절히 처리되어야 한다', () => {
      const longNameProduct = {
        ...mockProduct,
        name: '매우 긴 상품명을 가진 테스트 상품입니다. 이 상품명은 정말로 길어서 카드 레이아웃에서 어떻게 표시되는지 테스트하기 위한 것입니다.',
      };

      render(<ProductCard product={longNameProduct} />);

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(longNameProduct.name);
    });

    it('높은 가격이 올바르게 포맷팅되어야 한다', () => {
      const expensiveProduct = {
        ...mockProduct,
        price: 999999999,
        originalPrice: 1000000000,
      };

      render(<ProductCard product={expensiveProduct} />);

      expect(screen.getByText('999,999,999원')).toBeInTheDocument();
      expect(screen.getByText('1,000,000,000원')).toBeInTheDocument();
    });
  });

  describe('이벤트 처리', () => {
    it('상품 카드 클릭 시 상품 페이지로 이동해야 한다', () => {
      render(<ProductCard {...defaultProps} />);

      const link = screen.getByTestId('product-link');
      expect(link).toHaveAttribute('href', '/product/1');
    });

    it('찜하기 버튼 외 영역 클릭 시 상품 페이지로 이동해야 한다', () => {
      render(<ProductCard {...defaultProps} />);

      const link = screen.getByTestId('product-link');
      expect(link).toHaveAttribute('href', '/product/1');
    });

    it('여러 번 빠르게 찜하기 클릭해도 안전해야 한다', async () => {
      const user = userEvent.setup();
      const mockOnWishlistToggle = jest.fn();

      render(<ProductCard {...defaultProps} onWishlistToggle={mockOnWishlistToggle} />);

      const wishlistButton = screen.getByRole('button', { name: '찜하기' });

      // 빠르게 여러 번 클릭
      await user.click(wishlistButton);
      await user.click(wishlistButton);
      await user.click(wishlistButton);

      expect(mockOnWishlistToggle).toHaveBeenCalledTimes(3);
      expect(mockOnWishlistToggle).toHaveBeenCalledWith(1);
    });
  });

  describe('메모리 효율성', () => {
    it('컴포넌트가 여러 번 렌더링되어도 메모리 누수가 없어야 한다', () => {
      const { rerender } = render(<ProductCard {...defaultProps} />);

      // 다른 props로 여러 번 리렌더링
      for (let i = 0; i < 10; i++) {
        rerender(
          <ProductCard
            {...defaultProps}
            product={{ ...mockProduct, id: i }}
            isWishlisted={i % 2 === 0}
          />,
        );
      }

      // 에러 없이 렌더링이 가능해야 함
      expect(screen.getByRole('heading')).toBeInTheDocument();
    });
  });
});
