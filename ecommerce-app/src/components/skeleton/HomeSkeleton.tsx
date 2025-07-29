import Skeleton, { ImageSkeleton } from '../common/Skeleton';
import styles from './HomeSkeleton.module.css';

// 배너 스켈레톤
export function BannerSkeleton() {
  return (
    <div className={styles.bannerSkeleton}>
      <ImageSkeleton width="100%" height="400px" />
    </div>
  );
}

// 카테고리 스켈레톤
export function CategoriesSkeleton() {
  return (
    <div className={styles.categoriesSkeleton}>
      <div className={styles.sectionTitle}>
        <Skeleton width="120px" height="32px" />
      </div>
      <div className={styles.categoriesWrapper}>
        <div className={styles.categoriesContainer}>
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className={styles.categoryItem}>
              <div className={styles.categoryIcon}>
                <Skeleton width="40px" height="40px" />
              </div>
              <Skeleton width="60px" height="14px" className={styles.categoryName} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 상품 그리드 스켈레톤 (추천상품용)
export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={styles.productGrid}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={styles.productCard}>
          <div className={styles.productImageContainer}>
            <ImageSkeleton width="100%" height="250px" />
          </div>
          <div className={styles.productInfo}>
            <Skeleton width="90%" height="18px" className={styles.productName} />
            <Skeleton width="70%" height="16px" />
            <div className={styles.productMeta}>
              <Skeleton width="80px" height="22px" />
              <Skeleton width="60px" height="14px" />
            </div>
            <Skeleton
              width="100%"
              height="40px"
              borderRadius="8px"
              className={styles.addToCartButton}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// 추천 상품 스켈레톤
export function FeaturedProductsSkeleton() {
  return (
    <div className={styles.featuredProducts}>
      <div className={styles.sectionTitle}>
        <Skeleton width="150px" height="32px" />
      </div>
      <ProductGridSkeleton count={4} />
    </div>
  );
}

// 신상품 스켈레톤
export function NewArrivalsSkeleton() {
  return (
    <div className={styles.newArrivals}>
      <div className={styles.sectionTitle}>
        <Skeleton width="100px" height="32px" />
      </div>
      <div className={styles.newArrivalsGrid}>
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className={styles.newArrivalCard}>
            <div className={styles.newArrivalImageContainer}>
              <ImageSkeleton width="100%" height="300px" />
              {/* NEW 뱃지 위치 */}
              <div className={styles.newBadgeSkeleton}>
                <Skeleton width="35px" height="20px" borderRadius="4px" />
              </div>
            </div>
            <div className={styles.newArrivalInfo}>
              <Skeleton width="85%" height="16px" />
              <Skeleton width="60px" height="18px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 프로모션 스켈레톤
export function PromotionSkeleton() {
  return (
    <div className={styles.promotionSkeleton}>
      <div className={styles.promotionCard}>
        <div className={styles.promotionContent}>
          <Skeleton width="250px" height="28px" />
          <Skeleton width="350px" height="16px" className={styles.promotionDescription} />
          <Skeleton width="100px" height="36px" borderRadius="6px" />
        </div>
      </div>
    </div>
  );
}

// 리뷰 스켈레톤
export function ReviewsSkeleton() {
  return (
    <div className={styles.reviewsSkeleton}>
      <div className={styles.sectionTitle}>
        <Skeleton width="120px" height="32px" />
      </div>
      <div className={styles.reviewsContainer}>
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <div className={styles.reviewerAvatar}>
                <Skeleton variant="circular" width="40px" height="40px" />
              </div>
              <div className={styles.reviewerInfo}>
                <Skeleton width="80px" height="16px" />
                <Skeleton width="90px" height="16px" />
              </div>
            </div>
            <div className={styles.reviewContent}>
              <Skeleton width="100%" height="14px" />
              <Skeleton width="90%" height="14px" />
              <Skeleton width="80%" height="14px" />
            </div>
            <Skeleton width="120px" height="12px" className={styles.reviewProduct} />
          </div>
        ))}
      </div>
    </div>
  );
}

// 전체 홈 스켈레톤
export default function HomeSkeleton() {
  return (
    <div className={styles.homeSkeleton}>
      <BannerSkeleton />
      <CategoriesSkeleton />
      <FeaturedProductsSkeleton />
      <PromotionSkeleton />
      <NewArrivalsSkeleton />
      <ReviewsSkeleton />
    </div>
  );
}
