/**
 * Wishlist 도메인 상태 관리 (기존 코드 기반)
 */
import { create } from 'zustand';
import type {
  WishlistItem,
  WishlistState,
  WishlistActions,
  WishlistSummary,
} from '../types/wishlist';

// Mock wishlist data
const mockWishlistItems: WishlistItem[] = [
  {
    id: 1,
    name: '스타일리시 원피스',
    price: 89900,
    image:
      'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
    inStock: true,
    size: 'M',
    color: '블랙',
  },
  {
    id: 2,
    name: '클래식 셔츠',
    price: 59900,
    image:
      'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
    inStock: true,
    size: 'L',
    color: '블루',
  },
  {
    id: 3,
    name: '레더 핸드백',
    price: 199900,
    image:
      'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
    inStock: false,
    size: 'L',
    color: '블루',
  },
  {
    id: 4,
    name: '캐주얼 스니커즈',
    price: 129900,
    image:
      'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
    inStock: true,
    size: '250',
    color: '블랙',
  },
];

// Zustand 스토어 타입 (내부 구현 + 퍼블릭 인터페이스)
export type WishlistStoreState = WishlistState & WishlistActions;

export const useWishlistStore = create<WishlistStoreState>()((set, get) => ({
  // Initialize with mock data
  wishlistItems: mockWishlistItems,
  get totalItems() {
    return this.wishlistItems.length;
  },

  addItem: (item) => {
    set((state) => {
      if (state.wishlistItems.some((existingItem) => existingItem.id === item.id)) {
        return state; // 이미 존재하면 추가하지 않음
      }

      return {
        wishlistItems: [...state.wishlistItems, item],
        totalItems: state.totalItems + 1,
      };
    });
  },

  removeItem: (itemId) => {
    set((state) => ({
      wishlistItems: state.wishlistItems.filter((item) => item.id !== itemId),
      totalItems: Math.max(0, state.totalItems - 1),
    }));
  },

  clear: () => set({ wishlistItems: [], totalItems: 0 }),

  hasItem: (itemId) => {
    return get().wishlistItems.some((item) => item.id === itemId);
  },

  getItem: (itemId) => {
    return get().wishlistItems.find((item) => item.id === itemId);
  },
}));

// === 헬퍼 훅들 ===

/**
 * 위시리스트 요약 정보 계산 훅
 */
export const useWishlistSummary = (): WishlistSummary => {
  // Zustand selector를 사용하여 필요한 상태만 선택
  const wishlistItems = useWishlistStore((state) => state.wishlistItems);

  const totalItems = wishlistItems.length;
  const totalValue = wishlistItems.reduce((sum, item) => sum + item.price, 0);

  return {
    totalItems,
    totalValue,
    currency: 'KRW',
  };
};
