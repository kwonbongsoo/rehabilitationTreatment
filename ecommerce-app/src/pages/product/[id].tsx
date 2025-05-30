import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { fetchProductById } from '../../utils/api';
import { Product } from '../../types';

const ProductPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            const getProduct = async () => {
                try {
                    const data = await fetchProductById(id as string);
                    setProduct(data);
                } catch (err) {
                    setError('Failed to fetch product');
                } finally {
                    setLoading(false);
                }
            };
            getProduct();
        }
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!product) return <div>Product not found</div>;

    return (
        <div>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
            <img src={product.imageUrl} alt={product.name} />
        </div>
    );
};

export default ProductPage;