import { useState } from 'react';
import Link from 'next/link';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import styles from './Wishlist.module.css';
import OptimizedImage from '@/components/common/OptimizedImage';

const WishlistPage: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: 1,
      name: '스타일리시 원피스',
      price: 89900,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
      inStock: true,
    },
    {
      id: 2,
      name: '클래식 셔츠',
      price: 59900,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
      inStock: true,
    },
    {
      id: 3,
      name: '레더 핸드백',
      price: 199900,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
      inStock: false,
    },
  ]);

  const removeFromWishlist = (id: number) => {
    setWishlistItems((items) => items.filter((item) => item.id !== id));
  };

  const moveToCart = (id: number) => {
    // Mock function - in real app, this would add to cart
    removeFromWishlist(id);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <FiHeart className={styles.heartIcon} />
          나의 위시리스트
        </h1>
        <p className={styles.subtitle}>마음에 든 상품들을 저장해두고 나중에 구매하세요</p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className={styles.emptyState}>
          <FiHeart size={64} className={styles.emptyIcon} />
          <h2>위시리스트가 비어있습니다</h2>
          <p>마음에 드는 상품을 위시리스트에 추가해보세요</p>
          <Link href="/products" className={styles.shopButton}>
            쇼핑 계속하기
          </Link>
        </div>
      ) : (
        <div className={styles.wishlistGrid}>
          {wishlistItems.map((item) => (
            <div key={item.id} className={styles.wishlistItem}>
              <div className={styles.productImage}>
                <OptimizedImage
                  src={item.image}
                  alt={item.name}
                  width={500}
                  height={500}
                  className={styles.image}
                />
              </div>
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{item.name}</h3>
                <p className={styles.productPrice}>{item.price.toLocaleString()}원</p>

                <div className={styles.actions}>
                  {item.inStock ? (
                    <button className={styles.addToCartButton} onClick={() => moveToCart(item.id)}>
                      <FiShoppingCart size={16} />
                      장바구니 담기
                    </button>
                  ) : (
                    <button className={styles.notifyButton}>재입고 알림</button>
                  )}

                  <button
                    className={styles.removeButton}
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
