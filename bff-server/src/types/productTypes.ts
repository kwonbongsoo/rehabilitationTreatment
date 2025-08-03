export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  categoryId: number;
  sellerId: string;
  mainImage?: string;
  rating?: number;
  averageRating?: number;
  reviewCount?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  discount?: number;
  discountPercentage?: number;
  stock?: number;
  sku?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  specifications?: Record<string, any>;
  options?: CreateProductOptionRequest[];
  images?: File[];
}

export interface CreateProductOptionRequest {
  optionType: string;
  optionName: string;
  optionValue: string;
  additionalPrice?: number;
  stock?: number;
  sku?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ProductOptionResponse {
  id: number;
  productId: number;
  optionType: string;
  optionName: string;
  optionValue: string;
  additionalPrice: number;
  stock: number;
  sku?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRegistrationResponse {
  productId: number;
  imageUrls: string[];
  message: string;
}

export interface ImageUploadResult {
  imageId: number;
  imageUrl: string;
  isMainImage: boolean;
}