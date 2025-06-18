import ProductGrid from '@/components/common/ProductGrid';
import styles from './Products.module.css';

const ProductsPage: React.FC = () => {
  // Mock products data
  const mockProducts = [
    {
      id: 1,
      name: '스타일리시 원피스',
      price: 89900,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
      rating: 4.5,
      category: 'dress',
    },
    {
      id: 2,
      name: '클래식 셔츠',
      price: 59900,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
      rating: 4.3,
      category: 'top',
    },
    {
      id: 3,
      name: '캐주얼 스니커즈',
      price: 129900,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
      rating: 4.7,
      category: 'shoes',
    },
    {
      id: 4,
      name: '레더 핸드백',
      price: 199900,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
      rating: 4.6,
      category: 'bag',
    },
    {
      id: 5,
      name: '무선 이어폰',
      price: 79900,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
      rating: 4.4,
      category: 'accessories',
    },
    {
      id: 6,
      name: '스포츠 티셔츠',
      price: 39900,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
      rating: 4.2,
      category: 'top',
    },
  ];

  const handleAddToCart = (productId: number) => {
    console.log('장바구니에 상품 추가:', productId);
    // 실제 장바구니 추가 로직 구현
  };

  return (
    <div className={styles.container}>
      <ProductGrid
        products={mockProducts}
        title="모든 상품"
        showCategory={true}
        onAddToCart={handleAddToCart}
        className={styles.productsGrid}
      />
    </div>
  );
};

export default ProductsPage;
