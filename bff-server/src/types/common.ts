// 공통으로 사용되는 타입 정의

// API 응답용 변환된 타입
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  mainImage: string;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  tags?: Tag[];
  categoryId: number;
}

interface Tag {
  name: string;
  color: string;
}

export const TAGS_COLORS = {
  NEW: '#047857',
  RECOMMENDED: '#007bff',
  DISCOUNT: '#dc2626',
};
