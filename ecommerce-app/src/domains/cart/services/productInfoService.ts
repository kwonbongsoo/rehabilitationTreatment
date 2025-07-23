import productInfoData from '@/mocks/product-info.json';

interface ProductInfoData {
  products: Record<string, MockProductInfo>;
}

export interface MockProductInfo {
  id: string;
  name: string;
  price: number;
  image: string;
  inStock: boolean;
  discount: number;
  originalPrice: number;
  maxQuantity: number;
}

export async function fetchProductInfo(productId: string): Promise<MockProductInfo | null> {
  // 실제로는 API 호출
  await new Promise((resolve) => setTimeout(resolve, 300)); // 가짜 지연

  return (productInfoData as ProductInfoData).products[productId] || null;
}
