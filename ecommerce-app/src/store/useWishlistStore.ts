import { create } from 'zustand';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image?: string;
}

interface WishlistState {
  items: WishlistItem[];
  totalItems: number;

  // Actions
  addItem: (item: WishlistItem) => void;
  removeItem: (itemId: string) => void;
  clear: () => void;

  // Selectors
  hasItem: (itemId: string) => boolean;
  getItem: (itemId: string) => WishlistItem | undefined;
}

export const useWishlistStore = create<WishlistState>()((set, get) => ({
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
