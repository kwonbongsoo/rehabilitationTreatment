/**
 * 장바구니 상태 관리 훅
 *
 * Zustand store를 useState 기반으로 마이그레이션
 * 기존 인터페이스를 완전히 유지하여 사이드 이펙트 방지
 */

import { useState, useCallback, useEffect } from 'react';
import type { CartItem, CartState, CartActions, CartSummary } from '../types/cart';
import cartData from '@/mocks/cart-items.json';

// 기존 CartStoreState와 동일한 인터페이스 유지
export type CartHookState = CartState & CartActions;

// localStorage 키
const CART_STORAGE_KEY = 'cart-storage';

// 초기 상태
const getInitialState = (): CartState => {
  if (typeof window === 'undefined') {
    return {
      cartItems: cartData.items || [],
      totalItems: (cartData.items || []).reduce((sum, item) => sum + item.quantity, 0),
      isLoading: false,
    };
  }

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return (
        parsed.state || {
          cartItems: cartData.items || [],
          totalItems: (cartData.items || []).reduce((sum, item) => sum + item.quantity, 0),
          isLoading: false,
        }
      );
    }
  } catch (error) {
    console.warn('Failed to load cart from localStorage:', error);
  }

  return {
    cartItems: cartData.items || [],
    totalItems: (cartData.items || []).reduce((sum, item) => sum + item.quantity, 0),
    isLoading: false,
  };
};

// 상태를 localStorage에 저장
const saveToStorage = (state: CartState): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ state }));
  } catch (error) {
    console.warn('Failed to save cart to localStorage:', error);
  }
};

/**
 * 장바구니 상태 훅
 * 기존 useCartStore와 동일한 인터페이스 제공
 */
export function useCartState(): CartHookState {
  const [state, setState] = useState<CartState>(getInitialState);

  // localStorage 동기화
  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  // === 기본 CRUD 액션 (기존 store와 동일) ===
  const addItem = useCallback((newItem: Omit<CartItem, 'quantity'>) => {
    setState((prevState) => {
      const existingItemIndex = prevState.cartItems.findIndex((item) => item.id === newItem.id);

      let updatedCart: CartItem[];

      if (existingItemIndex > -1) {
        // 기존 아이템 수량 증가
        updatedCart = prevState.cartItems.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: item.quantity + 1 } : item,
        );
      } else {
        // 새 아이템 추가
        const newCartItem: CartItem = {
          ...newItem,
          quantity: 1, // 기본 수량
        };
        updatedCart = [...prevState.cartItems, newCartItem];
      }

      const totalItems = updatedCart.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...prevState,
        cartItems: updatedCart,
        totalItems,
      };
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setState((prevState) => {
      const updatedCart = prevState.cartItems.filter((item) => item.id !== itemId);
      const totalItems = updatedCart.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...prevState,
        cartItems: updatedCart,
        totalItems,
      };
    });
  }, []);

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(itemId);
        return;
      }

      setState((prevState) => {
        const updatedCart = prevState.cartItems.map((item) =>
          item.id === itemId ? { ...item, quantity } : item,
        );
        const totalItems = updatedCart.reduce((sum, item) => sum + item.quantity, 0);

        return {
          ...prevState,
          cartItems: updatedCart,
          totalItems,
        };
      });
    },
    [removeItem],
  );

  const updateItem = useCallback((itemId: string, updates: Partial<CartItem>) => {
    setState((prevState) => {
      const updatedCart = prevState.cartItems.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item,
      );
      const totalItems = updatedCart.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...prevState,
        cartItems: updatedCart,
        totalItems,
      };
    });
  }, []);

  const clear = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      cartItems: [],
      totalItems: 0,
    }));
  }, []);

  // === 조회 함수들 ===
  const getItem = useCallback(
    (itemId: string): CartItem | undefined => {
      return state.cartItems.find((item) => item.id === itemId);
    },
    [state.cartItems],
  );

  const getItemCount = useCallback((): number => {
    return state.totalItems;
  }, [state.totalItems]);

  const isItemInCart = useCallback(
    (itemId: string): boolean => {
      return state.cartItems.some((item) => item.id === itemId);
    },
    [state.cartItems],
  );

  // === 검증 함수들 ===
  const validateItem = useCallback((item: CartItem): boolean => {
    if (!item.name?.trim()) return false;
    if (item.quantity <= 0) return false;
    if (item.price <= 0) return false;
    return true;
  }, []);

  // === 계산 함수들 ===
  const getTotalPrice = useCallback((): number => {
    return state.cartItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  }, [state.cartItems]);

  const getTotalDiscount = useCallback((): number => {
    return state.cartItems.reduce((total, item) => {
      if (item.originalPrice && item.originalPrice > item.price) {
        return total + (item.originalPrice - item.price) * item.quantity;
      }
      return total;
    }, 0);
  }, [state.cartItems]);

  // === 유틸리티 함수들 ===
  const setLoading = useCallback((loading: boolean) => {
    setState((prevState) => ({
      ...prevState,
      isLoading: loading,
    }));
  }, []);

  const setError = useCallback((error: string | undefined) => {
    setState((prevState: CartState): CartState => {
      const newState = { ...prevState };
      if (error !== undefined) {
        newState.error = error;
      } else {
        delete newState.error;
      }
      return newState;
    });
  }, []);

  return {
    // 상태
    ...state,

    // 액션들 (기존 store와 동일한 인터페이스)
    addItem,
    removeItem,
    updateQuantity,
    updateItem,
    clear,
    getItem,
    getItemCount,
    isItemInCart,
    validateItem,
    getTotalPrice,
    getTotalDiscount,
    setLoading,
    setError,
  };
}

/**
 * 장바구니 요약 정보 훅
 * 기존 useCartSummary와 동일한 인터페이스 제공
 */
export function useCartSummaryHook(): CartSummary {
  const { getTotalPrice, getTotalDiscount, getItemCount } = useCartState();

  const subtotal = getTotalPrice();
  const discount = getTotalDiscount();
  const shipping = 0; // 기본값
  const tax = 0; // 기본값
  const total = subtotal - discount + shipping + tax;
  const itemCount = getItemCount();

  return {
    itemCount,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    currency: 'KRW',
  };
}
