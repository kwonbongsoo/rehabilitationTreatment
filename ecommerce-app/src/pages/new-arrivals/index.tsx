import Link from 'next/link';
import styles from './NewArrivals.module.css';
import OptimizedImage from '@/components/common/OptimizedImage';

const NewArrivalsPage: React.FC = () => {
  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>신상품</h1>
          <p className={styles.subtitle}>최신 트렌드를 반영한 새로운 상품들을 만나보세요</p>
        </div>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label>카테고리:</label>
            <select>
              <option value="">전체</option>
              <option value="tops">상의</option>
              <option value="bottoms">하의</option>
              <option value="dresses">원피스</option>
              <option value="accessories">액세서리</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label>정렬:</label>
            <select>
              <option value="newest">최신순</option>
              <option value="price-low">가격 낮은순</option>
              <option value="price-high">가격 높은순</option>
              <option value="popular">인기순</option>
            </select>
          </div>
        </div>

        <div className={styles.productGrid}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className={styles.productCard}>
              <div className={styles.productImage}>
                <OptimizedImage
                  src="https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg"
                  alt={`신상품 ${item}`}
                  width={500}
                  height={500}
                  className={styles.image}
                />
                <div className={styles.newBadge}>NEW</div>
              </div>
              <div className={styles.productInfo}>
                <h3>{getProductName(item)}</h3>
                <p className={styles.price}>{getProductPrice(item).toLocaleString()}원</p>
                <div className={styles.colors}>
                  {getProductColors(item).map((color, index) => (
                    <span
                      key={index}
                      className={styles.colorOption}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.loadMore}>
          <button className={styles.loadMoreButton}>더 보기</button>
        </div>
      </div>
    </>
  );
};

// 상품 이름 반환 함수
const getProductName = (item: number): string => {
  const names = [
    '모던 블레이저',
    '실크 블라우스',
    '미니멀 원피스',
    '레더 백',
    '와이드 팬츠',
    '니트 카디건',
  ];
  return names[item - 1] || '';
};

// 상품 가격 반환 함수
const getProductPrice = (item: number): number => {
  const prices = [129000, 89000, 156000, 198000, 79000, 112000];
  return prices[item - 1] || 0;
};

// 상품 색상 반환 함수
const getProductColors = (item: number): string[] => {
  const colors = [
    ['#000', '#navy', '#beige'],
    ['#white', '#pink', '#mint'],
    ['#black', '#grey'],
    ['#brown', '#black', '#red'],
    ['#khaki', '#navy', '#charcoal'],
    ['#cream', '#lavender', '#sage'],
  ];
  return colors[item - 1] || [];
};

export default NewArrivalsPage;
