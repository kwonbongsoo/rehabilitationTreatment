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

// Zustand 스토어 타입 (내부 구현 + 퍼블릭 인터페이스)
export type WishlistStoreState = WishlistState & WishlistActions;

export const useWishlistStore = create<WishlistStoreState>()((set, get) => ({
  items: [],
  get totalItems() {
    return this.items.length;
  },

  addItem: (item) => {
    set((state) => {
      if (state.items.some((existingItem) => existingItem.id === item.id)) {
        return state; // 이미 존재하면 추가하지 않음
      }

      return {
        items: [...state.items, item],
        totalItems: state.totalItems + 1,
      };
    });
  },

  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
      totalItems: Math.max(0, state.totalItems - 1),
    }));
  },

  clear: () => set({ items: [], totalItems: 0 }),

  hasItem: (itemId) => {
    return get().items.some((item) => item.id === itemId);
  },

  getItem: (itemId) => {
    return get().items.find((item) => item.id === itemId);
  },
}));

// === 헬퍼 훅들 ===

/**
 * 위시리스트 요약 정보 계산 훅
 */
export const useWishlistSummary = (): WishlistSummary => {
  // Zustand selector를 사용하여 필요한 상태만 선택
  const items = useWishlistStore((state) => state.items);

  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => sum + item.price, 0);

  return {
    totalItems,
    totalValue,
    currency: 'KRW',
  };
};
