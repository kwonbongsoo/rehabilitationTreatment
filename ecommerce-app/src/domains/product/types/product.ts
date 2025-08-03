export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  rating: number;
  reviews: number;
  createdAt: string;
  updatedAt: string;
  size?: string;
  color?: string;
}

export interface ProductListItem {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviews?: number;
  category: string;
  size: string;
  color: string;
}

export interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'rating' | 'newest';
  order?: 'asc' | 'desc';
}

// 상품 등록 폼 데이터 타입
export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  categoryId: number;
  sellerId: string;
  stock: number;
  sku?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  isNew: boolean;
  isFeatured: boolean;
  discountPercentage: number;
  specifications?: { [key: string]: string };
}
// 상품 액션 결과 타입
export interface ProductActionResult {
  success: boolean;
  data?: {
    productId: number;
    imageUrls: string[];
    message: string;
  };
  message?: string;
  errors?: { [key: string]: string };
}
