/**
 * 장바구니 액션 훅
 *
 * 장바구니의 모든 액션들을 사용하기 쉽게 래핑합니다.
 */
import { useCallback } from 'react';
import { useCartStore, useCartSummary } from '../stores/useCartStore';
import { NotificationManager } from '@/utils/notifications';
import type { CartItem, UpdateCartItemRequest, RemoveFromCartRequest } from '../types/cart';

export interface UseCartActionsReturn {
  // 기본 액션들
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string, options?: { showNotification?: boolean; reason?: string }) => void;
  clearCart: (options?: { showNotification?: boolean; confirm?: boolean }) => Promise<boolean>;

  // 편의 액션들
  incrementQuantity: (itemId: string) => void;
  decrementQuantity: (itemId: string) => void;
  updateItemOptions: (request: UpdateCartItemRequest) => void;

  // 계산 값들
  summary: ReturnType<typeof useCartSummary>;
  itemCount: number;
  isEmpty: boolean;
}

export function useCartActions(): UseCartActionsReturn {
  // Zustand selector를 사용하여 필요한 상태와 액션만 선택
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateItem = useCartStore((state) => state.updateItem);
  const clear = useCartStore((state) => state.clear);
  const getItem = useCartStore((state) => state.getItem);
  const getItemCount = useCartStore((state) => state.getItemCount);

  const summary = useCartSummary();

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
    updateQuantity: handleUpdateQuantity,
    removeItem: handleRemoveItem,
    clearCart,

    // 편의 액션들
    incrementQuantity,
    decrementQuantity,
    updateItemOptions,

    // 계산 값들
    summary,
    itemCount: getItemCount(),
    isEmpty: items.length === 0,
  };
}
