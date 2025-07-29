// 공통으로 사용되는 타입 정의

export interface RawProductData {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: number;
  category: string;
  image: string;
  imageUrl: string;
  rating: number;
  averageRating: number;
  reviewCount: number;
  isNew: boolean;
  isFeatured: boolean;
  discountPercentage: number;
  tags?: string[];
  createdAt: string;
}
