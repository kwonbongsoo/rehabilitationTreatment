import styles from '@/styles/common/Rating.module.css';

interface RatingProps {
  rating: number;
  reviewCount?: number;
}

export default function Rating({ rating, reviewCount }: RatingProps) {
  // 별점 렌더링 함수
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`star-${i}`} className={styles.star}>
          ★
        </span>,
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half-star" className={styles.halfStar}>
          ★
        </span>,
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className={styles.emptyStar}>
          ☆
        </span>,
      );
    }

    return stars;
  };

  return (
    <div className={styles.rating}>
      <div className={styles.stars}>{renderStars(rating)}</div>
      {reviewCount !== undefined && <span className={styles.reviewCount}>({reviewCount})</span>}
    </div>
  );
}
