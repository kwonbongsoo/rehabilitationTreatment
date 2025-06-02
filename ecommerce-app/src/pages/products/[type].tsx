import React from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import styles from './ProductType.module.css';

interface ProductTypePageProps {
    productType: string;
}

const ProductTypePage: React.FC<ProductTypePageProps> = ({ productType }) => {
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
            image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
            rating: 4.5,
            isNew: productType === 'new',
            onSale: productType === 'sale',
        },
        {
            id: 2,
            name: `${getTypeTitle(productType)} 2`,
            price: 79900,
            originalPrice: productType === 'sale' ? 119900 : undefined,
            image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
            rating: 4.3,
            isNew: productType === 'new',
            onSale: productType === 'sale',
        },
        {
            id: 3,
            name: `${getTypeTitle(productType)} 3`,
            price: 99900,
            originalPrice: productType === 'sale' ? 149900 : undefined,
            image: 'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
            rating: 4.7,
            isNew: productType === 'new',
            onSale: productType === 'sale',
        },
    ]; return (
        <div className={styles.container}>
            <h1 className={styles.title}>{getTypeTitle(productType)}</h1>

            {productType === 'sale' && (
                <div className={styles.saleNotice}>
                    <p>🔥 특별 할인가로 만나보세요!</p>
                </div>
            )}

            {productType === 'new' && (
                <div className={styles.newNotice}>
                    <p>✨ 최신 트렌드 상품들을 확인해보세요!</p>
                </div>
            )}

            <div className={styles.productsGrid}>
                {mockProducts.map((product) => (
                    <Link href={`/product/${product.id}`} key={product.id} className={styles.productCard}>
                        <div className={styles.productImage}>
                            <img src={product.image} alt={product.name} />
                            {product.isNew && <span className={styles.newBadge}>NEW</span>}
                            {product.onSale && <span className={styles.saleBadge}>SALE</span>}
                        </div>
                        <div className={styles.productInfo}>
                            <h3 className={styles.productName}>{product.name}</h3>
                            <div className={styles.priceSection}>
                                <p className={styles.productPrice}>
                                    {product.price.toLocaleString()}원
                                </p>
                                {product.originalPrice && (
                                    <p className={styles.originalPrice}>
                                        {product.originalPrice.toLocaleString()}원
                                    </p>
                                )}
                            </div>
                            <div className={styles.productRating}>
                                ⭐ {product.rating}
                            </div>
                        </div>                        </Link>
                ))}
            </div>
        </div>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const productType = params?.type as string;

    // Validate product type
    const validTypes = ['seasonal', 'new', 'sale'];
    if (!validTypes.includes(productType)) {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            productType,
        },
    };
};

export default ProductTypePage;
