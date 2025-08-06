/**
 * 장바구니 관련 Mock 데이터
 */

import { MOCK_PRODUCT_IMAGES } from './products';

export interface MockCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  productId?: string;
  options?: {
    size?: string;
    color?: string;
    [key: string]: any;
  };
}

export const MOCK_CART_ITEMS: MockCartItem[] = [
  {
    id: '1',
    name: 'Classic T-shirt',
    price: 169000,
    quantity: 1,
    image: MOCK_PRODUCT_IMAGES.DEFAULT,
    productId: '1',
    options: {
      size: 'M',
      color: 'Black',
    },
  },
  {
    id: '2',
    name: 'Skinny Jeans',
    price: 189000,
    quantity: 1,
    image: MOCK_PRODUCT_IMAGES.DEFAULT,
    productId: '2',
    options: {
      size: 'L',
      color: 'Blue',
    },
  },
  {
    id: '3',
    name: 'Slip Dresses',
    price: 159000,
    quantity: 1,
    image: MOCK_PRODUCT_IMAGES.DEFAULT,
    productId: '3',
    options: {
      size: 'S',
      color: 'Navy',
    },
  },
];

// 장바구니 유틸리티 함수들
export const getCartTotal = (items: MockCartItem[]): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

export const getCartItemCount = (items: MockCartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

export const addToCart = (items: MockCartItem[], newItem: MockCartItem): MockCartItem[] => {
  const existingItemIndex = items.findIndex((item) => item.id === newItem.id);
  
  if (existingItemIndex >= 0) {
    const updatedItems = [...items];
    const existingItem = updatedItems[existingItemIndex];
    if (existingItem) {
      existingItem.quantity += newItem.quantity;
    }
    return updatedItems;
  }
  
  return [...items, newItem];
};

export const removeFromCart = (items: MockCartItem[], itemId: string): MockCartItem[] => {
  return items.filter((item) => item.id !== itemId);
};

export const updateCartItemQuantity = (
  items: MockCartItem[],
  itemId: string,
  quantity: number
): MockCartItem[] => {
  return items.map((item) =>
    item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item
  ).filter((item) => item.quantity > 0);
};