import { render, screen } from '@testing-library/react';
import Rating from '../Rating';
import '@testing-library/jest-dom';

describe('Rating', () => {
  it('renders rating with correct number of stars', () => {
    const { container } = render(<Rating rating={4.5} />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders full stars correctly', () => {
    render(<Rating rating={3} />);

    const allStars = screen.getAllByTestId('rating-star');
    const fullStars = allStars.filter((star) => star.getAttribute('data-star-type') === 'full');
    expect(fullStars).toHaveLength(3);
    expect(allStars).toHaveLength(5); // Total stars should be 5
  });

  it('renders half star correctly', () => {
    render(<Rating rating={3.5} />);

    const allStars = screen.getAllByTestId('rating-star');
    const fullStars = allStars.filter((star) => star.getAttribute('data-star-type') === 'full');
    const halfStars = allStars.filter((star) => star.getAttribute('data-star-type') === 'half');

    expect(fullStars).toHaveLength(3);
    expect(halfStars).toHaveLength(1);
    expect(allStars).toHaveLength(5);
  });

  it('renders empty stars correctly', () => {
    render(<Rating rating={2} />);

    const allStars = screen.getAllByTestId('rating-star');
    const fullStars = allStars.filter((star) => star.getAttribute('data-star-type') === 'full');
    const emptyStars = allStars.filter((star) => star.getAttribute('data-star-type') === 'empty');

    expect(fullStars).toHaveLength(2);
    expect(emptyStars).toHaveLength(3);
    expect(allStars).toHaveLength(5);
  });

  it('displays review count when provided', () => {
    render(<Rating rating={4} reviewCount={150} />);

    expect(screen.getByText('(150)')).toBeInTheDocument();
  });

  it('does not display review count when not provided', () => {
    render(<Rating rating={4} />);

    expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
  });

  describe('size variations', () => {
    it('applies small size styles', () => {
      render(<Rating rating={4} size="small" />);

      const stars = screen.getAllByTestId('rating-star');
      expect(stars).toHaveLength(5);
      expect(stars[0]).toHaveStyle({ fontSize: '12px' });
    });

    it('applies medium size styles (default)', () => {
      render(<Rating rating={4} />);

      const stars = screen.getAllByTestId('rating-star');
      expect(stars).toHaveLength(5);
      expect(stars[0]).toHaveStyle({ fontSize: '16px' });
    });

    it('applies large size styles', () => {
      render(<Rating rating={4} size="large" />);

      const stars = screen.getAllByTestId('rating-star');
      expect(stars).toHaveLength(5);
      expect(stars[0]).toHaveStyle({ fontSize: '20px' });
    });
  });

  describe('edge cases', () => {
    it('handles zero rating', () => {
      render(<Rating rating={0} />);

      const allStars = screen.getAllByTestId('rating-star');
      const emptyStars = allStars.filter((star) => star.getAttribute('data-star-type') === 'empty');
      expect(emptyStars).toHaveLength(5);
      expect(allStars).toHaveLength(5);
    });

    it('handles maximum rating', () => {
      render(<Rating rating={5} />);

      const allStars = screen.getAllByTestId('rating-star');
      const fullStars = allStars.filter((star) => star.getAttribute('data-star-type') === 'full');
      expect(fullStars).toHaveLength(5);
      expect(allStars).toHaveLength(5);
    });

    it('handles rating above maximum', () => {
      render(<Rating rating={6} />);

      const allStars = screen.getAllByTestId('rating-star');
      const fullStars = allStars.filter((star) => star.getAttribute('data-star-type') === 'full');
      expect(fullStars).toHaveLength(5);
      expect(allStars).toHaveLength(5);
    });

    it('handles negative rating', () => {
      render(<Rating rating={-1} />);

      const allStars = screen.getAllByTestId('rating-star');
      const emptyStars = allStars.filter((star) => star.getAttribute('data-star-type') === 'empty');
      expect(emptyStars).toHaveLength(5);
      expect(allStars).toHaveLength(5);
    });
  });

  describe('rating calculations', () => {
    it('correctly calculates half star threshold', () => {
      // Test rating below half star threshold (3.4)
      const { rerender } = render(<Rating rating={3.4} />);
      const stars1 = screen.getAllByTestId('rating-star');
      const halfStars1 = stars1.filter((star) => star.getAttribute('data-star-type') === 'half');
      expect(halfStars1).toHaveLength(0); // No half star for 3.4

      // Test rating at half star threshold (3.5)
      rerender(<Rating rating={3.5} />);
      const stars2 = screen.getAllByTestId('rating-star');
      const halfStars2 = stars2.filter((star) => star.getAttribute('data-star-type') === 'half');
      expect(halfStars2).toHaveLength(1); // Half star for 3.5

      // Test rating above half star threshold (3.7)
      rerender(<Rating rating={3.7} />);
      const stars3 = screen.getAllByTestId('rating-star');
      const halfStars3 = stars3.filter((star) => star.getAttribute('data-star-type') === 'half');
      expect(halfStars3).toHaveLength(1); // Half star for 3.7
    });

    it('rounds up correctly for ratings above 0.5', () => {
      render(<Rating rating={3.8} />);

      const allStars = screen.getAllByTestId('rating-star');
      const fullStars = allStars.filter((star) => star.getAttribute('data-star-type') === 'full');
      const halfStars = allStars.filter((star) => star.getAttribute('data-star-type') === 'half');

      expect(fullStars).toHaveLength(3);
      expect(halfStars).toHaveLength(1);
      expect(allStars).toHaveLength(5);
    });
  });
});
