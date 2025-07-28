import Skeleton, { ImageSkeleton, TextSkeleton } from '../common/Skeleton';
import styles from './PageSkeleton.module.css';

// 기본 페이지 스켈레톤
export default function PageSkeleton() {
  return (
    <div className={styles.pageSkeleton}>
      <div className={styles.header}>
        <Skeleton width="200px" height="32px" />
        <TextSkeleton lines={2} className={styles.description} />
      </div>
      <div className={styles.content}>
        <div className={styles.contentGrid}>
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className={styles.contentCard}>
              <ImageSkeleton width="100%" height="160px" />
              <div className={styles.cardContent}>
                <TextSkeleton lines={2} />
                <Skeleton width="80px" height="20px" className={styles.price} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 상품 리스트 스켈레톤
// Add this above the component definition
interface ProductListSkeletonProps {
  count?: number;
}

export function ProductListSkeleton({ count = 8 }: ProductListSkeletonProps) {
  return (
    <div className={styles.productListSkeleton}>
      <div className={styles.listHeader}>
        <Skeleton width="180px" height="28px" />
        <div className={styles.filters}>
          <Skeleton width="100px" height="36px" />
          <Skeleton width="120px" height="36px" />
          <Skeleton width="80px" height="36px" />
        </div>
      </div>
      <div className={styles.productGrid}>
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className={styles.productCard}>
            <ImageSkeleton width="100%" height="220px" />
            <div className={styles.productInfo}>
              <TextSkeleton lines={2} />
              <div className={styles.productMeta}>
                <Skeleton width="90px" height="24px" />
                <Skeleton width="70px" height="20px" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 상품 상세 스켈레톤
export function ProductDetailSkeleton() {
  return (
    <div className={styles.productDetailSkeleton}>
      <div className={styles.productDetailGrid}>
        <div className={styles.productImages}>
          <ImageSkeleton width="100%" height="500px" />
          <div className={styles.thumbnails}>
            {Array.from({ length: 4 }, (_, index) => (
              <ImageSkeleton key={index} width="80px" height="80px" />
            ))}
          </div>
        </div>
        <div className={styles.productDetails}>
          <Skeleton width="300px" height="36px" />
          <TextSkeleton lines={3} className={styles.productDescription} />
          <div className={styles.priceSection}>
            <Skeleton width="120px" height="32px" />
            <Skeleton width="80px" height="24px" />
          </div>
          <div className={styles.options}>
            <Skeleton width="100px" height="20px" />
            <div className={styles.optionButtons}>
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} width="60px" height="40px" />
              ))}
            </div>
          </div>
          <div className={styles.actions}>
            <Skeleton width="150px" height="48px" />
            <Skeleton width="120px" height="48px" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 카트 페이지 스켈레톤
export function CartSkeleton() {
  return (
    <div className={styles.cartSkeleton}>
      <div className={styles.cartHeader}>
        <Skeleton width="120px" height="32px" />
      </div>
      <div className={styles.cartContent}>
        <div className={styles.cartItems}>
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className={styles.cartItem}>
              <ImageSkeleton width="80px" height="80px" />
              <div className={styles.itemDetails}>
                <TextSkeleton lines={2} />
                <div className={styles.itemMeta}>
                  <Skeleton width="60px" height="20px" />
                  <Skeleton width="80px" height="24px" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.cartSummary}>
          <Skeleton width="200px" height="28px" />
          <div className={styles.summaryItems}>
            <div className={styles.summaryRow}>
              <Skeleton width="80px" height="20px" />
              <Skeleton width="100px" height="20px" />
            </div>
            <div className={styles.summaryRow}>
              <Skeleton width="60px" height="20px" />
              <Skeleton width="80px" height="20px" />
            </div>
            <div className={styles.summaryRow}>
              <Skeleton width="100px" height="24px" />
              <Skeleton width="120px" height="24px" />
            </div>
          </div>
          <Skeleton width="100%" height="48px" />
        </div>
      </div>
    </div>
  );
}
