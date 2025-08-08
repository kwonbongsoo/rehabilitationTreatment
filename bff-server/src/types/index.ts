export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface MemberResponse {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
}

export interface ServiceEndpoints {
  auth: ApiConfig;
  member: ApiConfig;
  product: ApiConfig;
}

// Product Domain Types
export interface ProductDomainCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  iconCode?: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductDomainProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  mainImage: string;
  averageRating: number;
  reviewCount: number;
  isNew: boolean;
  isFeatured: boolean;
  discountPercentage: number;
  createdAt?: string;
  updatedAt?: string;
  originalPrice?: number;
  images: string[];
}

// Product Registration Types
export * from './productTypes';
