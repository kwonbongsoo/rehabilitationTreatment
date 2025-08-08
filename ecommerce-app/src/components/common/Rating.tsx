import { ReactElement } from 'react';

interface RatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'small' | 'medium' | 'large';
}

export default function Rating({
  rating,
  reviewCount,
  size = 'medium',
}: RatingProps): ReactElement {
  // 크기별 스타일 설정
  const getSizeStyles = (size: string): { fontSize: string; gap: string; textSize: string } => {
    switch (size) {
      case 'small':
        return { fontSize: '12px', gap: '6px', textSize: '12px' };
      case 'large':
        return { fontSize: '20px', gap: '10px', textSize: '16px' };
      default: // medium
        return { fontSize: '16px', gap: '8px', textSize: '14px' };
    }
  };

  const sizeStyles = getSizeStyles(size);

  // 별점 렌더링 함수
  const renderStars = (rating: number): ReactElement[] => {
    const stars = [];
    // 평점을 0-5 범위로 제한
    const clampedRating = Math.max(0, Math.min(5, rating));
    const fullStars = Math.floor(clampedRating);
    const hasHalfStar = clampedRating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span
          key={`star-${i}`}
          style={{ color: '#ffc107', fontSize: sizeStyles.fontSize }}
          data-testid="rating-star"
          data-star-type="full"
        >
          ★
        </span>,
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span
          key="half-star"
          style={{ color: '#ffc107', opacity: '0.5', fontSize: sizeStyles.fontSize }}
          data-testid="rating-star"
          data-star-type="half"
        >
          ★
        </span>,
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span
          key={`empty-${i}`}
          style={{ color: '#ddd', fontSize: sizeStyles.fontSize }}
          data-testid="rating-star"
          data-star-type="empty"
        >
          ☆
        </span>,
      );
    }

    return stars;
  };

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: sizeStyles.gap }}
      data-testid="rating-container"
    >
      <div style={{ display: 'flex', alignItems: 'center' }} data-testid="rating-stars">
        {renderStars(rating)}
      </div>
      {reviewCount !== undefined && (
        <span
          style={{ fontSize: sizeStyles.textSize, color: '#666' }}
          data-testid="rating-review-count"
        >
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
