interface RatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'small' | 'medium' | 'large';
}

export default function Rating({ rating, reviewCount, size = 'medium' }: RatingProps) {
  // 크기별 스타일 설정
  const getSizeStyles = (size: string) => {
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
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`star-${i}`} style={{ color: '#ffc107', fontSize: sizeStyles.fontSize }}>
          ★
        </span>,
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span
          key="half-star"
          style={{ color: '#ffc107', opacity: '0.5', fontSize: sizeStyles.fontSize }}
        >
          ★
        </span>,
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} style={{ color: '#ddd', fontSize: sizeStyles.fontSize }}>
          ☆
        </span>,
      );
    }

    return stars;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: sizeStyles.gap }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>{renderStars(rating)}</div>
      {reviewCount !== undefined && (
        <span style={{ fontSize: sizeStyles.textSize, color: '#666' }}>({reviewCount})</span>
      )}
    </div>
  );
}
