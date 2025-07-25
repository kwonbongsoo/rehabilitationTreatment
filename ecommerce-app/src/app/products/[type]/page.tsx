import React from 'react';
import Link from 'next/link';
// import styles from './page.module.css';
import OptimizedImage from '@/components/common/OptimizedImage';
import { notFound } from 'next/navigation';

interface ProductTypePageProps {
  params: {
    type: string;
  };
}

const VALID_PRODUCT_TYPES = ['seasonal', 'new', 'sale'] as const;

export default function ProductTypePage({ params }: ProductTypePageProps) {
  const { type: productType } = params;

  // Validate product type
  if (!VALID_PRODUCT_TYPES.includes(productType as any)) {
    notFound();
  }

  const getTypeTitle = (type: string) => {
    switch (type) {
      case 'seasonal':
        return '시즌 상품';
      case 'new':
        return '신상품';
      case 'sale':
        return '세일 상품';
      default:
        return '상품';
    }
  };

  // Mock products for the specific type
  const mockProducts = [
    {
      id: 1,
      name: `${getTypeTitle(productType)} 1`,
      price: 59900,
      originalPrice: productType === 'sale' ? 89900 : undefined,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
      rating: 4.5,
      isNew: productType === 'new',
      onSale: productType === 'sale',
    },
    {
      id: 2,
      name: `${getTypeTitle(productType)} 2`,
      price: 79900,
      originalPrice: productType === 'sale' ? 119900 : undefined,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
      rating: 4.3,
      isNew: productType === 'new',
      onSale: productType === 'sale',
    },
    {
      id: 3,
      name: `${getTypeTitle(productType)} 3`,
      price: 99900,
      originalPrice: productType === 'sale' ? 149900 : undefined,
      image:
        'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
      rating: 4.7,
      isNew: productType === 'new',
      onSale: productType === 'sale',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '20px' }}>
      <h1
        style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#333',
          textAlign: 'center',
          margin: '0 0 20px 0',
        }}
      >
        {getTypeTitle(productType)}
      </h1>

      {productType === 'sale' && (
        <div
          style={{
            background: '#fff3cd',
            color: '#856404',
            padding: '12px 20px',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          <p style={{ margin: '0', fontSize: '16px', fontWeight: '600' }}>
            🔥 특별 할인가로 만나보세요!
          </p>
        </div>
      )}

      {productType === 'new' && (
        <div
          style={{
            background: '#d1ecf1',
            color: '#0c5460',
            padding: '12px 20px',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          <p style={{ margin: '0', fontSize: '16px', fontWeight: '600' }}>
            ✨ 최신 트렌드 상품들을 확인해보세요!
          </p>
        </div>
      )}

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
              position: 'relative',
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
              {product.isNew && (
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: '#28a745',
                    color: 'white',
                    fontSize: '10px',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontWeight: '600',
                  }}
                >
                  NEW
                </span>
              )}
              {product.onSale && (
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: '#dc3545',
                    color: 'white',
                    fontSize: '10px',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontWeight: '600',
                  }}
                >
                  SALE
                </span>
              )}
            </div>
            <div style={{ padding: '20px' }}>
              <h3
                style={{ fontSize: '16px', fontWeight: '600', color: '#333', margin: '0 0 8px 0' }}
              >
                {product.name}
              </h3>
              <div style={{ marginBottom: '8px' }}>
                <p
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#007bff',
                    margin: '0',
                    display: 'inline-block',
                  }}
                >
                  {product.price.toLocaleString()}원
                </p>
                {product.originalPrice && (
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#999',
                      textDecoration: 'line-through',
                      margin: '0 0 0 8px',
                      display: 'inline-block',
                    }}
                  >
                    {product.originalPrice.toLocaleString()}원
                  </p>
                )}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>⭐ {product.rating}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// 정적 경로 생성 (선택사항)
export async function generateStaticParams() {
  return VALID_PRODUCT_TYPES.map((type) => ({
    type,
  }));
}

// 메타데이터 생성
export async function generateMetadata({ params }: ProductTypePageProps) {
  const { type } = params;

  const getTypeTitle = (type: string) => {
    switch (type) {
      case 'seasonal':
        return '시즌 상품';
      case 'new':
        return '신상품';
      case 'sale':
        return '세일 상품';
      default:
        return '상품';
    }
  };

  return {
    title: `${getTypeTitle(type)} | 쇼핑몰`,
    description: `${getTypeTitle(type)} 상품을 확인해보세요.`,
  };
}
