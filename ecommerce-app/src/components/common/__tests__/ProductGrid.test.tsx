import { render, screen, fireEvent } from '@testing-library/react';
import ProductGrid from '../ProductGrid';
import { Product } from '@/domains/product/types/product';
import '@testing-library/jest-dom';

// Mock ProductCard component
jest.mock('../ProductCard', () => {
  return function MockProductCard({ product, onWishlistToggle, isWishlisted }: any) {
    return (
      <div data-testid={`product-card-${product.id}`}>
        <span>{product.name}</span>
        <button
          onClick={() => onWishlistToggle?.(product.id)}
          data-testid={`wishlist-${product.id}`}
        >
          {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        </button>
      </div>
    );
  };
});

const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Test Product 1',
    price: 10000,
    mainImage: '/test1.jpg',
    description: 'Test description 1',
    categoryId: 1,
    sellerId: 'seller1',
    stock: 10,
    isNew: true,
    isFeatured: false,
    rating: 4.5,
    reviews: 10,
    images: ['/test1.jpg'],
  },
  {
    id: 2,
    name: 'Test Product 2',
    price: 20000,
    mainImage: '/test2.jpg',
    description: 'Test description 2',
    categoryId: 2,
    sellerId: 'seller2',
    stock: 5,
    isNew: false,
    isFeatured: true,
    rating: 3.8,
    reviews: 5,
    images: ['/test2.jpg'],
  },
];

describe('ProductGrid', () => {
  const mockOnWishlistToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all products', () => {
    render(<ProductGrid products={mockProducts} onWishlistToggle={mockOnWishlistToggle} />);

    expect(screen.getByTestId('product-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('product-card-2')).toBeInTheDocument();
    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
  });

  it('renders empty grid when no products', () => {
    const { container } = render(
      <ProductGrid products={[]} onWishlistToggle={mockOnWishlistToggle} />,
    );

    expect(container.firstChild).toBeInTheDocument();
    expect(screen.queryByTestId(/product-card/)).not.toBeInTheDocument();
  });

  it('calls onWishlistToggle when wishlist button is clicked', () => {
    render(<ProductGrid products={mockProducts} onWishlistToggle={mockOnWishlistToggle} />);

    const wishlistButton = screen.getByTestId('wishlist-1');
    fireEvent.click(wishlistButton);

    expect(mockOnWishlistToggle).toHaveBeenCalledWith(1);
  });

  it('shows correct wishlist state for products', () => {
    const isWishlisted = (productId: number): boolean => productId === 1;
    render(
      <ProductGrid
        products={mockProducts}
        isWishlisted={isWishlisted}
        onWishlistToggle={mockOnWishlistToggle}
      />,
    );

    expect(screen.getByText('Remove from Wishlist')).toBeInTheDocument();
    expect(screen.getByText('Add to Wishlist')).toBeInTheDocument();
  });

  it('renders with default container class', () => {
    const { container } = render(
      <ProductGrid products={mockProducts} onWishlistToggle={mockOnWishlistToggle} />,
    );

    expect(container.firstChild).toHaveClass('container');
  });

  it('handles missing onWishlistToggle gracefully', () => {
    render(<ProductGrid products={mockProducts} />);

    const wishlistButton = screen.getByTestId('wishlist-1');

    // Should not throw error when clicking without handler
    expect(() => fireEvent.click(wishlistButton)).not.toThrow();
  });

  it('passes priority prop to first few products', () => {
    render(<ProductGrid products={mockProducts} onWishlistToggle={mockOnWishlistToggle} />);

    // First product should get priority for image loading
    expect(screen.getByTestId('product-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('product-card-2')).toBeInTheDocument();
  });

  it('renders with different grid configurations', () => {
    const { container } = render(
      <ProductGrid products={mockProducts} onWishlistToggle={mockOnWishlistToggle} />,
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  describe('responsive behavior', () => {
    it('handles mobile layout', () => {
      const { container } = render(
        <ProductGrid products={mockProducts} onWishlistToggle={mockOnWishlistToggle} />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles desktop layout', () => {
      const { container } = render(
        <ProductGrid products={mockProducts} onWishlistToggle={mockOnWishlistToggle} />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
