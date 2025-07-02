export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  categoryId: string;
  stock: number;
  rating: number;
  reviews: number;
  createdAt: string;
  updatedAt: string;
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
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'rating' | 'newest';
  order?: 'asc' | 'desc';
}
