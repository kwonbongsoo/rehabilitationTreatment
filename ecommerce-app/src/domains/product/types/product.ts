export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  mainImage: string;
  images: string[];
  categoryId: number;
  stock: number;
  rating: number;
  reviews: number;
  size?: string;
  color?: string;
  tags?: Tag[];
  sellerId: string;
  isNew: boolean;
  isFeatured: boolean;
}

interface Tag {
  name: string;
  color: string;
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

// 상품 옵션 타입
export interface ProductOption {
  id?: number;
  optionType: string; // 'color', 'size', 'material' 등
  optionName: string; // '색상', '사이즈', '소재' 등
  optionValue: string; // '빨강', 'XL', '면' 등
  additionalPrice: number; // 추가 가격
  stock: number; // 옵션별 재고
  sku?: string; // 옵션별 SKU
  isActive: boolean;
  sortOrder: number;
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
  options?: ProductOption[]; // 상품 옵션 추가
  images?: File[];
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

export interface ProductSubmissionData extends ProductFormData {
  images: File[];
  options: ProductOption[];
  specifications: Record<string, string>;
}
