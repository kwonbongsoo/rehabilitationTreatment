import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  totalItems: number;

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clear: () => void;

  // Selectors
  getItem: (itemId: string) => CartItem | undefined;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  totalItems: 0,

  addItem: (newItem) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.id === newItem.id);

      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item,
          ),
          totalItems: state.totalItems + 1,
        };
      }

      return {
        items: [...state.items, { ...newItem, quantity: 1 }],
        totalItems: state.totalItems + 1,
      };
    });
  },

  removeItem: (itemId) => {
    set((state) => {
      const item = state.items.find((item) => item.id === itemId);
      if (!item) return state;

      return {
        items: state.items.filter((item) => item.id !== itemId),
        totalItems: state.totalItems - item.quantity,
      };
    });
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }

    set((state) => {
      const item = state.items.find((item) => item.id === itemId);
      if (!item) return state;

      const quantityDiff = quantity - item.quantity;

      return {
        items: state.items.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
        totalItems: state.totalItems + quantityDiff,
      };
    });
  },

  clear: () => set({ items: [], totalItems: 0 }),

  getItem: (itemId) => {
    return get().items.find((item) => item.id === itemId);
  },

  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));
