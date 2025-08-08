import React, { ReactElement } from 'react';
import Rating from '@/components/common/Rating';
import OptimizedImageNext from '@/components/common/OptimizedImageNext';
import styles from '@/styles/home/Reviews.module.css';

interface ReviewsProps {
  title?: string;
  reviews: {
    id: number;
    name: string;
    initials: string;
    rating: number;
    text: string;
    product: string;
    avatar?: string; // 리뷰어 아바타 이미지 URL (선택적)
  }[];
}

export default function Reviews({ title, reviews }: ReviewsProps): ReactElement {
  if (!reviews || reviews.length === 0) {
    return <></>;
  }

  return (
    <section className={styles.reviewsSection}>
      {title && (
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{title}</h2>
          <span className={styles.reviewCount}>{reviews.length}개 리뷰</span>
        </div>
      )}
      <div className={styles.reviewsContainer}>
        {reviews.map((review) => (
          <div key={review.id} className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <div className={styles.userInfo}>
                {review.avatar ? (
                  <div className={styles.avatarWrapper}>
                    <OptimizedImageNext
                      src={review.avatar}
                      alt={`${review.name} 프로필 이미지`}
                      width={36}
                      height={36}
                      className={styles.avatar}
                      lazy={true}
                    />
                  </div>
                ) : (
                  <div className={styles.avatarInitials}>{review.initials}</div>
                )}
                <div className={styles.userDetails}>
                  <h3 className={styles.userName}>{review.name}</h3>
                  <Rating rating={review.rating} size="small" />
                </div>
              </div>
            </div>
            <p className={styles.reviewText}>{review.text}</p>
            <div className={styles.reviewFooter}>
              <span className={styles.productName}>{review.product}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
