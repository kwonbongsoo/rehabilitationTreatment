/**
 * Cart 도메인 상태 관리
 *
 * Zustand 기반 장바구니 상태 관리
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { CartItem, CartState, CartActions, CartSummary } from '../types/cart';
import cartData from '@/mocks/cart-items.json';

// Zustand 스토어 타입 (내부 구현 + 퍼블릭 인터페이스)
export type CartStoreState = CartState & CartActions;

// 초기 상태
const initialState: CartState = {
  cartItems: cartData.items || [],
  totalItems: (cartData.items || []).reduce((sum, item) => sum + item.quantity, 0),
  isLoading: false,
};

export const useCartStore = create<CartStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        // 초기 상태
        ...initialState,

        // === 기본 CRUD 액션 ===
        addItem: (newItem) => {
          set((state) => {
            const existingItem = state.cartItems.find((item) => item.id === newItem.id);

            if (existingItem) {
              // 기존 아이템의 수량 증가
              const updatedItems = state.cartItems.map((item) =>
                item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item,
              );

              const newState = {
                ...state,
                cartItems: updatedItems,
                totalItems: state.totalItems + 1,
              };
              delete newState.error;
              return newState;
            }

            // 새 아이템 추가
            const itemToAdd: CartItem = {
              ...newItem,
              quantity: 1,
              inStock: newItem.inStock ?? true,
            };

            const newState = {
              ...state,
              cartItems: [...state.cartItems, itemToAdd],
              totalItems: state.totalItems + 1,
            };
            delete newState.error;
            return newState;
          });
        },

        removeItem: (itemId) => {
          set((state) => {
            const item = state.cartItems.find((item) => item.id === itemId);
            if (!item) return state;

            const newState = {
              ...state,
              cartItems: state.cartItems.filter((item) => item.id !== itemId),
              totalItems: state.totalItems - item.quantity,
            };
            delete newState.error;
            return newState;
          });
        },

        updateQuantity: (itemId, quantity) => {
          if (quantity <= 0) {
            get().removeItem(itemId);
            return;
          }

          set((state) => {
            const item = state.cartItems.find((item) => item.id === itemId);
            if (!item) return state;

            // 최대 수량 제한 확인
            const finalQuantity = item.maxQuantity
              ? Math.min(quantity, item.maxQuantity)
              : quantity;

            const quantityDiff = finalQuantity - item.quantity;

            const newState = {
              ...state,
              cartItems: state.cartItems.map((item) =>
                item.id === itemId ? { ...item, quantity: finalQuantity } : item,
              ),
              totalItems: state.totalItems + quantityDiff,
            };
            delete newState.error;
            return newState;
          });
        },

        updateItem: (itemId, updates) => {
          set((state) => {
            const newState = {
              ...state,
              cartItems: state.cartItems.map((item) =>
                item.id === itemId ? { ...item, ...updates } : item,
              ),
            };
            delete newState.error;
            return newState;
          });
        },

        clear: () => set({ ...initialState }),

        // === 계산 함수들 ===
        getItem: (itemId) => {
          return get().cartItems.find((item) => item.id === itemId);
        },

        getTotalPrice: () => {
          return get().cartItems.reduce((total, item) => {
            const itemPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price;
            return total + itemPrice * item.quantity;
          }, 0);
        },

        getTotalDiscount: () => {
          return get().cartItems.reduce((total, item) => {
            if (!item.discount || !item.originalPrice) return total;
            const discountAmount = (item.originalPrice - item.price) * item.quantity;
            return total + discountAmount;
          }, 0);
        },

        getItemCount: () => {
          return get().totalItems;
        },

        // === 검증 함수들 ===
        validateItem: (item) => {
          // 기본 검증 로직
          if (!item.id || !item.name || item.price < 0) return false;
          if (item.maxQuantity && item.quantity > item.maxQuantity) return false;
          return item.inStock;
        },

        isItemInCart: (itemId) => {
          return get().cartItems.some((item) => item.id === itemId);
        },

        // === 로딩 상태 관리 ===
        setLoading: (loading) => {
          set((state) => ({ ...state, isLoading: loading }));
        },

        setError: (error) => {
          set((state) => {
            if (error === undefined) {
              const newState = { ...state };
              delete newState.error;
              return newState;
            }
            return { ...state, error };
          });
        },
      }),
      {
        name: 'cart-storage',
      },
    ),
  ),
);

/**
 * 장바구니 요약 정보 계산 훅
 */
export const useCartSummary = (): CartSummary => {
  // Zustand selector를 사용하여 필요한 상태만 선택
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const getTotalDiscount = useCartStore((state) => state.getTotalDiscount);
  const getItemCount = useCartStore((state) => state.getItemCount);

  const subtotal = getTotalPrice();
  const discount = getTotalDiscount();
  const shipping = subtotal > 50000 ? 0 : 3000; // 5만원 이상 무료배송
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + shipping + tax;

  return {
    itemCount: getItemCount(),
    subtotal,
    discount,
    shipping,
    tax,
    total,
    currency: 'KRW',
  };
};
