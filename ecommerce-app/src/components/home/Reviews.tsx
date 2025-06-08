import React from 'react';
import Image from 'next/image';
import SectionTitle from '@/components/common/SectionTitle';
import Rating from '@/components/common/Rating';
import OptimizedImage from '@/components/common/OptimizedImage';
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

export default function Reviews({ title, reviews }: ReviewsProps) {
    if (!reviews || reviews.length === 0) {
        return null;
    }

    return (
        <section className={styles.reviewsSection}>
            {title && <SectionTitle title={title} />}
            <div className={styles.reviewsContainer}>
                {reviews.map(review => (
                    <div key={review.id} className={styles.reviewCard}>
                        <div className={styles.reviewHeader}>
                            {review.avatar ? (
                                <div className={styles.reviewerAvatarContainer}>
                                    <OptimizedImage
                                        src={review.avatar}
                                        alt={`${review.name} 프로필 이미지`}
                                        width={40}
                                        height={40}
                                        className={styles.reviewerAvatar}
                                    />
                                </div>
                            ) : (
                                <div className={styles.reviewerAvatar}>
                                    {review.initials}
                                </div>
                            )}
                            <div className={styles.reviewerInfo}>
                                <h4>{review.name}</h4>
                                <Rating rating={review.rating} />
                            </div>
                        </div>
                        <p className={styles.reviewText}>{review.text}</p>
                        <p className={styles.reviewProduct}>구매 상품: {review.product}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}