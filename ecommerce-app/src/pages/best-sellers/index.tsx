import Head from 'next/head';
import ProductGrid from '@/components/common/ProductGrid';
import styles from './BestSellers.module.css';

const BestSellers: React.FC = () => {
  const bestSellerProducts = [
    {
      id: 1,
      name: '베스트셀러 원피스',
      price: 89900,
      originalPrice: 129900,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
      sales: 1250,
      rating: 4.8,
      reviews: 324,
      category: 'dress',
      badge: '1위',
    },
    {
      id: 2,
      name: '인기 스니커즈',
      price: 129900,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
      sales: 980,
      rating: 4.7,
      reviews: 256,
      category: 'shoes',
      badge: '2위',
    },
    {
      id: 3,
      name: '클래식 블레이저',
      price: 159900,
      originalPrice: 199900,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
      sales: 850,
      rating: 4.6,
      reviews: 189,
      category: 'jacket',
      badge: '3위',
    },
    {
      id: 4,
      name: '데님 청바지',
      price: 79900,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
      sales: 750,
      rating: 4.5,
      reviews: 234,
      category: 'pants',
    },
    {
      id: 5,
      name: '캐시미어 스웨터',
      price: 189900,
      originalPrice: 259900,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
      sales: 680,
      rating: 4.9,
      reviews: 145,
      category: 'top',
    },
    {
      id: 6,
      name: '실크 블라우스',
      price: 119900,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
      sales: 620,
      rating: 4.4,
      reviews: 178,
      category: 'top',
    },
    {
      id: 7,
      name: '레더 핸드백',
      price: 249900,
      originalPrice: 329900,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
      sales: 580,
      rating: 4.8,
      reviews: 92,
      category: 'bag',
    },
    {
      id: 8,
      name: '트렌치 코트',
      price: 299900,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
      sales: 520,
      rating: 4.7,
      reviews: 156,
      category: 'jacket',
    },
  ];

  const handleAddToCart = (productId: number) => {
    console.log('장바구니에 상품 추가:', productId);
    // 실제 장바구니 추가 로직 구현
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>베스트셀러 - StyleShop</title>
        <meta name="description" content="가장 많이 판매되는 인기 상품들을 만나보세요." />
      </Head>

      <div className={styles.header}>
        <h1>베스트셀러</h1>
        <p>가장 인기 있는 상품들을 만나보세요</p>
      </div>

      <ProductGrid
        products={bestSellerProducts}
        variant="featured"
        gridType="bestseller"
        initialSort="sales"
        onAddToCart={handleAddToCart}
        className={styles.productGridCustom}
      />

      <div className={styles.infoSection}>
        <h3>베스트셀러 선정 기준</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h4>📊 판매량</h4>
            <p>최근 30일간 판매량을 기준으로 선정</p>
          </div>
          <div className={styles.infoCard}>
            <h4>⭐ 고객만족도</h4>
            <p>평점 4.0 이상 상품만 선별</p>
          </div>
          <div className={styles.infoCard}>
            <h4>🔄 재구매율</h4>
            <p>높은 재구매율을 보이는 상품</p>
          </div>
          <div className={styles.infoCard}>
            <h4>📈 트렌드</h4>
            <p>현재 트렌드를 반영한 인기 상품</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestSellers;
