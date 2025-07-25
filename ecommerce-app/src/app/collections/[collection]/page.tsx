import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
// import styles from './page.module.css';
import OptimizedImage from '@/components/common/OptimizedImage';

interface CollectionPageProps {
  params: {
    collection: string;
  };
}

const VALID_COLLECTIONS = ['summer', 'winter', 'spring', 'fall'] as const;

export default function CollectionPage({ params }: CollectionPageProps) {
  const { collection } = params;

  // Validate collection
  if (!VALID_COLLECTIONS.includes(collection as (typeof VALID_COLLECTIONS)[number])) {
    notFound();
  }

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
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#333', margin: '0 0 16px 0' }}>
          {getCollectionTitle(collection)}
        </h1>
        <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.6', margin: '0' }}>
          {collection === 'summer' && '시원하고 스타일리시한 여름 아이템을 만나보세요'}
          {collection === 'winter' && '따뜻하고 세련된 겨울 패션을 제안합니다'}
          {collection === 'spring' && '상큼하고 경쾌한 봄의 분위기를 담았습니다'}
          {collection === 'fall' && '차분하고 우아한 가을 룩을 선보입니다'}
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
        }}
      >
        {mockProducts.map((product) => (
          <Link
            href={`/product/2`}
            key={product.id}
            style={{
              display: 'block',
              background: 'white',
              borderRadius: '16px',
              overflow: 'hidden',
              textDecoration: 'none',
              color: 'inherit',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s',
            }}
          >
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1' }}>
              <OptimizedImage
                src={product.image}
                alt={product.name}
                width={500}
                height={500}
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '20px' }}>
              <h3
                style={{ fontSize: '16px', fontWeight: '600', color: '#333', margin: '0 0 8px 0' }}
              >
                {product.name}
              </h3>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#007bff', margin: '0' }}>
                {product.price.toLocaleString()}원
              </p>
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
