import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import OptimizedImage from '@/components/common/OptimizedImage';

interface CollectionPageProps {
  params: {
    collection: string;
  };
}

const VALID_COLLECTIONS = ['summer', 'winter', 'spring', 'fall'] as const;

export default function CollectionPage({ params }: CollectionPageProps) {
  const { collection } = params;

  const getCollectionTitle = (collection: string) => {
    switch (collection) {
      case 'summer':
        return '여름 컬렉션';
      case 'winter':
        return '겨울 컬렉션';
      case 'spring':
        return '봄 컬렉션';
      case 'fall':
        return '가을 컬렉션';
      default:
        return '컬렉션';
    }
  };

  const mockProducts = [
    {
      id: 1,
      name: `${getCollectionTitle(collection)} 상품 1`,
      price: 69900,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
    },
    {
      id: 2,
      name: `${getCollectionTitle(collection)} 상품 2`,
      price: 89900,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
    },
    {
      id: 3,
      name: `${getCollectionTitle(collection)} 상품 3`,
      price: 79900,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
    },
    {
      id: 4,
      name: `${getCollectionTitle(collection)} 상품 4`,
      price: 99900,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{getCollectionTitle(collection)}</h1>
        <p className={styles.description}>
          {collection === 'summer' && '시원하고 스타일리시한 여름 아이템을 만나보세요'}
          {collection === 'winter' && '따뜻하고 세련된 겨울 패션을 제안합니다'}
          {collection === 'spring' && '상큼하고 경쾌한 봄의 분위기를 담았습니다'}
          {collection === 'fall' && '차분하고 우아한 가을 룩을 선보입니다'}
        </p>
      </div>

      <div className={styles.productGrid}>
        {mockProducts.map((product) => (
          <Link href={`/products/${product.id}`} key={product.id} className={styles.productCard}>
            <div className={styles.productImage}>
              <OptimizedImage
                src={product.image}
                alt={product.name}
                width={500}
                height={500}
                className={styles.image}
              />
            </div>
            <div className={styles.productInfo}>
              <h3 className={styles.productName}>{product.name}</h3>
              <p className={styles.productPrice}>{product.price.toLocaleString()}원</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// 정적 경로 생성
export async function generateStaticParams() {
  return VALID_COLLECTIONS.map((collection) => ({
    collection,
  }));
}

// 메타데이터 생성
export async function generateMetadata({ params }: CollectionPageProps) {
  const { collection } = params;

  const getCollectionTitle = (collection: string) => {
    switch (collection) {
      case 'summer':
        return '여름 컬렉션';
      case 'winter':
        return '겨울 컬렉션';
      case 'spring':
        return '봄 컬렉션';
      case 'fall':
        return '가을 컬렉션';
      default:
        return '컬렉션';
    }
  };

  return {
    title: `${getCollectionTitle(collection)} | 쇼핑몰`,
    description: `${getCollectionTitle(collection)} 상품을 확인해보세요.`,
  };
}
