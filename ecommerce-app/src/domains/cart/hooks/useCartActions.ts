/**
 * 장바구니 액션 훅
 *
 * 장바구니의 모든 액션들을 사용하기 쉽게 래핑합니다.
 */
import { useCallback } from 'react';
import { useCartStore, useCartSummary } from '../stores/useCartStore';
import { NotificationManager } from '@/utils/notifications';
import type { CartItem, UpdateCartItemRequest, AddToCartRequest } from '../types/cart';

export interface UseCartActionsReturn {
  // 기본 액션들
  addToCart: (request: AddToCartRequest) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string, options?: { showNotification?: boolean; reason?: string }) => void;
  clearCart: (options?: { showNotification?: boolean; confirm?: boolean }) => Promise<boolean>;

  // 편의 액션들
  incrementQuantity: (itemId: string) => void;
  decrementQuantity: (itemId: string) => void;
  updateItemOptions: (request: UpdateCartItemRequest) => void;

  // 상태
  isLoading: boolean;

  // 계산 값들
  summary: ReturnType<typeof useCartSummary>;
  itemCount: number;
  isEmpty: boolean;
}

export function useCartActions(): UseCartActionsReturn {
  // Zustand selector를 사용하여 필요한 상태와 액션만 선택
  const items = useCartStore((state) => state.cartItems);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateItem = useCartStore((state) => state.updateItem);
  const clear = useCartStore((state) => state.clear);
  const getItem = useCartStore((state) => state.getItem);
  const getItemCount = useCartStore((state) => state.getItemCount);
  const isItemInCart = useCartStore((state) => state.isItemInCart);
  const validateItem = useCartStore((state) => state.validateItem);
  const isLoading = useCartStore((state) => state.isLoading);
  const setLoading = useCartStore((state) => state.setLoading);
  const setError = useCartStore((state) => state.setError);

  const summary = useCartSummary();

  // === 장바구니 추가 ===
  const handleAddToCart = useCallback(
    async (request: AddToCartRequest): Promise<boolean> => {
      try {
        setLoading(true);
        setError(undefined);

        // 1. 상품 정보 검증 (실제로는 API에서 가져와야 함)
        // TODO: 실제 프로덕트 API 연동
        const productInfo = await mockFetchProductInfo(request.id);

        if (!productInfo) {
          throw new Error('상품 정보를 찾을 수 없습니다.');
        }

        if (!productInfo.inStock) {
          throw new Error('품절된 상품입니다.');
        }

        // 2. 장바구니 아이템 생성
        const cartItem: Omit<CartItem, 'quantity'> = {
          id: `${request.id}_${request.size || 'default'}_${request.color || 'default'}`,
          name: productInfo.name,
          price: productInfo.price,
          inStock: productInfo.inStock,
          image: productInfo.image,
          ...(productInfo.image && { image: productInfo.image }),
          ...(request.size && { size: request.size }),
          ...(request.color && { color: request.color }),
          ...(productInfo.discount && { discount: productInfo.discount }),
          ...(productInfo.originalPrice && { originalPrice: productInfo.originalPrice }),
          ...(productInfo.maxQuantity && { maxQuantity: productInfo.maxQuantity }),
        };

        // 3. 아이템 검증
        const tempItem = { ...cartItem, quantity: request.quantity || 1 };
        if (!validateItem(tempItem)) {
          throw new Error('유효하지 않은 상품입니다.');
        }

        // 4. 장바구니에 추가
        if (request.quantity && request.quantity > 1) {
          // 여러 개 추가하는 경우
          for (let i = 0; i < request.quantity; i++) {
            addItem(cartItem);
          }
        } else {
          addItem(cartItem);
        }

        // 5. 성공 처리
        const itemName = cartItem.name;
        const itemCount = isItemInCart(cartItem.id) ? getItem(cartItem.id)?.quantity || 1 : 1;

        NotificationManager.showSuccess(
          `${itemName}이(가) 장바구니에 추가되었습니다. (${itemCount}개)`,
        );

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '장바구니 추가 중 오류가 발생했습니다.';

        setError(errorMessage);
        NotificationManager.showError(errorMessage);

        return false;
      } finally {
        setLoading(false);
      }
    },
    [addItem, getItem, isItemInCart, validateItem, setLoading, setError],
  );

  // === 수량 업데이트 ===
  const handleUpdateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      const item = getItem(itemId);
      if (!item) return;

      const oldQuantity = item.quantity;
      updateQuantity(itemId, quantity);

      // 수량 변경 알림
      if (quantity > oldQuantity) {
        NotificationManager.showInfo(`${item.name} 수량이 증가했습니다. (${quantity}개)`);
      } else if (quantity < oldQuantity) {
        NotificationManager.showInfo(`${item.name} 수량이 감소했습니다. (${quantity}개)`);
      }
    },
    [updateQuantity, getItem],
  );

  // === 아이템 제거 ===
  const handleRemoveItem = useCallback(
    (itemId: string, options: { showNotification?: boolean; reason?: string } = {}) => {
      const { showNotification = true, reason } = options;
      const item = getItem(itemId);

      if (!item) return;

      removeItem(itemId);

      if (showNotification) {
        const message =
          reason === 'out_of_stock'
            ? `${item.name}이(가) 품절되어 장바구니에서 제거되었습니다.`
            : `${item.name}이(가) 장바구니에서 제거되었습니다.`;

        NotificationManager.showWarning(message);
      }
    },
    [removeItem, getItem],
  );

  // === 장바구니 비우기 ===
  const clearCart = useCallback(
    async (options: { showNotification?: boolean; confirm?: boolean } = {}): Promise<boolean> => {
      const { showNotification = true, confirm = true } = options;

      if (confirm) {
        // 실제로는 모달 확인 대화상자를 사용해야 함
        const confirmed = window.confirm('장바구니를 비우시겠습니까?');
        if (!confirmed) return false;
      }

      const itemCount = getItemCount();
      clear();

      if (showNotification && itemCount > 0) {
        NotificationManager.showSuccess('장바구니가 비워졌습니다.');
      }

      return true;
    },
    [clear, getItemCount],
  );

  // === 편의 함수들 ===
  const incrementQuantity = useCallback(
    (itemId: string) => {
      const item = getItem(itemId);
      if (!item) return;

      const newQuantity = item.quantity + 1;

      // 최대 수량 제한 확인
      if (item.maxQuantity && newQuantity > item.maxQuantity) {
        NotificationManager.showWarning(`최대 ${item.maxQuantity}개까지만 구매 가능합니다.`);
        return;
      }

      handleUpdateQuantity(itemId, newQuantity);
    },
    [getItem, handleUpdateQuantity],
  );

  const decrementQuantity = useCallback(
    (itemId: string) => {
      const item = getItem(itemId);
      if (!item) return;

      const newQuantity = item.quantity - 1;

      if (newQuantity <= 0) {
        handleRemoveItem(itemId);
      } else {
        handleUpdateQuantity(itemId, newQuantity);
      }
    },
    [getItem, handleUpdateQuantity, handleRemoveItem],
  );

  const updateItemOptions = useCallback(
    (request: UpdateCartItemRequest) => {
      const { itemId, quantity, size, color, options } = request;

      const updates: Partial<CartItem> = {};

      if (quantity !== undefined) updates.quantity = quantity;
      if (size !== undefined) updates.size = size;
      if (color !== undefined) updates.color = color;

      // 기타 옵션들 병합
      if (options) {
        Object.assign(updates, options);
      }

      updateItem(itemId, updates);

      const item = getItem(itemId);
      if (item) {
        NotificationManager.showInfo(`${item.name} 옵션이 변경되었습니다.`);
      }
    },
    [updateItem, getItem],
  );

  return {
    // 기본 액션들
    addToCart: handleAddToCart,
    updateQuantity: handleUpdateQuantity,
    removeItem: handleRemoveItem,
    clearCart,

    // 편의 액션들
    incrementQuantity,
    decrementQuantity,
    updateItemOptions,

    // 상태
    isLoading,

    // 계산 값들
    summary,
    itemCount: getItemCount(),
    isEmpty: items.length === 0,
  };
}

// === 모킹 함수 (실제로는 API 서비스로 대체) ===

interface MockProductInfo {
  id: string;
  name: string;
  price: number;
  image: string;
  inStock: boolean;
  discount: number;
  originalPrice: number;
  maxQuantity: number;
}

async function mockFetchProductInfo(productId: string): Promise<MockProductInfo | null> {
  // 실제로는 API 호출
  await new Promise((resolve) => setTimeout(resolve, 500)); // 네트워크 지연 시뮬레이션

  // 모킹 데이터
  const mockProducts: Record<string, MockProductInfo> = {
    'product-1': {
      id: 'product-1',
      name: '스마트폰 케이스',
      price: 25000,
      image: '/images/products/case.jpg',
      inStock: true,
      maxQuantity: 10,
      discount: 10,
      originalPrice: 25000,
    },
    'product-2': {
      id: 'product-2',
      name: '무선 이어폰',
      price: 89000,
      originalPrice: 99000,
      discount: 10,
      image: '/images/products/earphone.jpg',
      inStock: true,
      maxQuantity: 5,
    },
  };

  return mockProducts[productId] || null;
}
