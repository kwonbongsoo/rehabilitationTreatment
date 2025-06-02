import React from 'react';
import { GetServerSideProps } from 'next';

interface CollectionPageProps {
    collection: string;
}

const CollectionPage: React.FC<CollectionPageProps> = ({ collection }) => {
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
            image: '/images/product-placeholder.jpg',
        },
        {
            id: 2,
            name: `${getCollectionTitle(collection)} 상품 2`,
            price: 89900,
            image: '/images/product-placeholder.jpg',
        },
    ]; return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <h1>{getCollectionTitle(collection)}</h1>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '3rem' }}>
                시즌의 특별한 매력을 담은 컬렉션
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '2rem'
            }}>
                {mockProducts.map((product) => (
                    <div key={product.id} style={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: '100%',
                            height: '250px',
                            backgroundColor: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <img src={product.image} alt={product.name} style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }} />
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ marginBottom: '0.5rem' }}>{product.name}</h3>
                            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#e74c3c' }}>
                                {product.price.toLocaleString()}원
                            </p>
                        </div>
                    </div>))}
            </div>
        </div>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const collection = params?.collection as string;

    return {
        props: {
            collection: collection || 'unknown',
        },
    };
};

export default CollectionPage;
