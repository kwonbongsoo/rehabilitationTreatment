import React from 'react';
import Link from 'next/link';
import styles from './Collection.module.css';
import OptimizedImage from '@/components/common/OptimizedImage';
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
            image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
        },
        {
            id: 2,
            name: `${getCollectionTitle(collection)} 상품 2`,
            price: 89900,
            image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
        },
    ];

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{getCollectionTitle(collection)}</h1>
            <div className={styles.productGrid}>
                {mockProducts.map((product) => (
                    <Link href={`/product/${product.id}`} key={product.id} className={styles.productCard}>
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
                            <p className={styles.productPrice}>
                                {product.price.toLocaleString()}원
                            </p>
                        </div>
                    </Link>
                ))}
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
