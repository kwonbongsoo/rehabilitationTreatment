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
import wishlistData from '@/mocks/wishlist-items.json';

// Zustand 스토어 타입 (내부 구현 + 퍼블릭 인터페이스)
export type WishlistStoreState = WishlistState & WishlistActions;

export const useWishlistStore = create<WishlistStoreState>()((set, get) => ({
  // Initialize with mock data
  wishlistItems: wishlistData.items,
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
      };
    });
  },

  removeItem: (itemId) => {
    set((state) => ({
      wishlistItems: state.wishlistItems.filter((item) => item.id !== itemId),
    }));
  },

  clear: () => set({ wishlistItems: [] }),

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
