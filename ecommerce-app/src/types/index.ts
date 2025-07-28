export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

// 도메인 타입들 re-export
export * from '../domains/home/types';
export * from '../domains/category/types';
