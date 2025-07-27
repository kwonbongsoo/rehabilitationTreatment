import React from 'react';
import { notFound } from 'next/navigation';
import CollectionProductGrid from '@/components/collections/CollectionProductGrid';
import type { Product } from '@/components/common/ProductCard';

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

  const mockProducts: Product[] = [
    {
      id: 1,
      name: `${getCollectionTitle(collection)} 상품 1`,
      price: 69900,
      originalPrice: 79900,
      image: 'https://www.kbs-cdn.shop/image/product-default.jpg',
      rating: 4.5,
      isNew: true,
      discount: 13,
      description: '편안하고 스타일리시한 디자인',
    },
    {
      id: 2,
      name: `${getCollectionTitle(collection)} 상품 2`,
      price: 89900,
      originalPrice: 99900,
      image: 'https://www.kbs-cdn.shop/image/product-default.jpg',
      rating: 4.2,
      discount: 10,
      description: '고급스러운 소재와 마감',
    },
    {
      id: 3,
      name: `${getCollectionTitle(collection)} 상품 3`,
      price: 79900,
      image: 'https://www.kbs-cdn.shop/image/product-default.jpg',
      rating: 4.8,
      description: '베스트셀러 아이템',
    },
    {
      id: 4,
      name: `${getCollectionTitle(collection)} 상품 4`,
      price: 99900,
      image: 'https://www.kbs-cdn.shop/image/product-default.jpg',
      rating: 4.3,
      isNew: true,
      description: '신제품 출시 기념',
    },
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      <main
        style={{ background: '#f8f9fa', padding: '40px 20px', minHeight: 'calc(100vh - 200px)' }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* 컬렉션 헤더 */}
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1
              style={{ fontSize: '36px', fontWeight: '700', color: '#333', margin: '0 0 16px 0' }}
            >
              {getCollectionTitle(collection)}
            </h1>
            <p style={{ fontSize: '18px', color: '#666', lineHeight: '1.6', margin: '0' }}>
              {collection === 'summer' && '시원하고 스타일리시한 여름 아이템을 만나보세요'}
              {collection === 'winter' && '따뜻하고 세련된 겨울 패션을 제안합니다'}
              {collection === 'spring' && '상큼하고 경쾌한 봄의 분위기를 담았습니다'}
              {collection === 'fall' && '차분하고 우아한 가을 룩을 선보입니다'}
            </p>
          </div>

          {/* 상품 그리드 */}
          <CollectionProductGrid products={mockProducts} />
        </div>
      </main>
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
