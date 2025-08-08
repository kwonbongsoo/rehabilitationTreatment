/**
 * 장바구니 액션 훅
 *
 * 장바구니의 모든 액션들을 사용하기 쉽게 래핑합니다.
 */
import { useCallback } from 'react';
import { useCartState, useCartSummaryHook } from './useCartState';
import { NotificationManager } from '@/utils/notifications';
import type { CartItem, UpdateCartItemRequest, AddToCartRequest } from '../types/cart';
import { fetchProductInfo } from '../services/productInfoService';

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
  summary: ReturnType<typeof useCartSummaryHook>;
  itemCount: number;
  isEmpty: boolean;
}

export function useCartActions(): UseCartActionsReturn {
  // 새로운 cart hooks 사용
  const cartState = useCartState();
  const {
    addItem,
    updateQuantity,
    removeItem,
    updateItem,
    clear,
    getItem,
    getItemCount,
    isItemInCart,
    validateItem,
    isLoading,
    setLoading,
    setError,
  } = cartState;

  const summary = useCartSummaryHook();

  // === 장바구니 추가 ===
  const handleAddToCart = useCallback(
    async (request: AddToCartRequest): Promise<boolean> => {
      try {
        setLoading(true);
        setError(undefined);

        // 1. 상품 정보 검증 (실제로는 API에서 가져와야 함)
        // TODO: 실제 프로덕트 API 연동
        const productInfo = await fetchProductInfo(request.id);

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

      removeItem(itemId);

      if (showNotification && item) {
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
      await clear();

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
    (request: UpdateCartItemRequest | { id: string; [key: string]: unknown }) => {
      // id 또는 itemId 둘 다 지원 (타입 가드 사용)
      let itemId: string;
      if ('itemId' in request && typeof request.itemId === 'string') {
        itemId = request.itemId;
      } else if ('id' in request && typeof request.id === 'string') {
        itemId = request.id;
      } else {
        console.warn('updateItemOptions: itemId를 찾을 수 없습니다.');
        return;
      }

      const updates: Partial<CartItem> = {};

      // 안전한 속성 추출 및 타입 검증
      if ('quantity' in request && typeof request.quantity === 'number') {
        updates.quantity = request.quantity;
      }
      if ('size' in request && typeof request.size === 'string') {
        updates.size = request.size;
      }
      if ('color' in request && typeof request.color === 'string') {
        updates.color = request.color;
      }

      // 기타 옵션들 병합
      if ('options' in request && request.options && typeof request.options === 'object') {
        Object.assign(updates, request.options);
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
    isEmpty: summary.itemCount === 0,
  };
}
