import OptimizedImage from '@/components/common/OptimizedImage';
import React from 'react';
import styles from './NewArrivals.module.css';

const NewArrivalsPage: React.FC = () => {
  return (
    <>
      <div className={styles.container}>
        <div className={styles.filters}>
          <select className={styles.filterSelect}>
            <option value="">카테고리</option>
            <option value="tops">상의</option>
            <option value="bottoms">하의</option>
            <option value="dresses">원피스</option>
            <option value="accessories">액세서리</option>
          </select>
          <select className={styles.filterSelect}>
            <option value="">브랜드</option>
            <option value="brand1">브랜드 A</option>
            <option value="brand2">브랜드 B</option>
            <option value="brand3">브랜드 C</option>
            <option value="brand4">브랜드 D</option>
          </select>
          <select className={styles.filterSelect}>
            <option value="">상황</option>
            <option value="casual">캐주얼</option>
            <option value="business">비즈니스</option>
            <option value="party">파티</option>
            <option value="sport">스포츠</option>
          </select>
          <select className={styles.filterSelect}>
            <option value="">가격대</option>
            <option value="under50">5만원 이하</option>
            <option value="50to100">5-10만원</option>
            <option value="100to200">10-20만원</option>
            <option value="over200">20만원 이상</option>
          </select>
          <select className={styles.filterSelect}>
            <option value="">사이즈</option>
            <option value="xs">XS</option>
            <option value="s">S</option>
            <option value="m">M</option>
            <option value="l">L</option>
            <option value="xl">XL</option>
          </select>
          <select className={styles.filterSelect}>
            <option value="">배송</option>
            <option value="free">무료배송</option>
            <option value="fast">당일배송</option>
            <option value="premium">프리미엄</option>
          </select>
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
