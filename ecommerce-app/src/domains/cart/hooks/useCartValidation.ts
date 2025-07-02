/**
 * 장바구니 검증 훅
 *
 * 장바구니 아이템들의 유효성을 검증합니다.
 */
import { useCallback, useEffect } from 'react';
import { useCartStore } from '../stores/useCartStore';
import { NotificationManager } from '@/utils/notifications';
import type { CartItem } from '../types/cart';

interface ValidationResult {
  isValid: boolean;
  invalidItems: CartItem[];
  errors: string[];
}

interface UseCartValidationOptions {
  autoFix?: boolean; // 자동으로 문제 수정
  showNotifications?: boolean;
}

export interface UseCartValidationReturn {
  validateCart: () => ValidationResult;
  validateItem: (item: CartItem) => boolean;
  fixInvalidItems: () => Promise<void>;
  isCartValid: boolean;
}

export function useCartValidation(options: UseCartValidationOptions = {}): UseCartValidationReturn {
  const { autoFix = false, showNotifications = true } = options;

  // Zustand selector를 사용하여 필요한 상태와 액션만 선택
  const items = useCartStore((state) => state.items);
  const validateItem = useCartStore((state) => state.validateItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateItem = useCartStore((state) => state.updateItem);
  const setError = useCartStore((state) => state.setError);

  // === 전체 장바구니 검증 ===
  const validateCart = useCallback((): ValidationResult => {
    const invalidItems: CartItem[] = [];
    const errors: string[] = [];

    items.forEach((item) => {
      if (!validateItem(item)) {
        invalidItems.push(item);

        // 구체적인 에러 메시지 생성
        if (!item.inStock) {
          errors.push(`${item.name}이(가) 품절되었습니다.`);
        }

        if (item.maxQuantity && item.quantity > item.maxQuantity) {
          errors.push(
            `${item.name}의 수량이 최대 구매 가능 수량(${item.maxQuantity}개)을 초과했습니다.`,
          );
        }

        if (item.price < 0) {
          errors.push(`${item.name}의 가격 정보가 올바르지 않습니다.`);
        }
      }
    });

    return {
      isValid: invalidItems.length === 0,
      invalidItems,
      errors,
    };
  }, [items, validateItem]);

  // === 유효하지 않은 아이템 수정 ===
  const fixInvalidItems = useCallback(async (): Promise<void> => {
    const validation = validateCart();

    if (validation.isValid) return;

    const fixPromises = validation.invalidItems.map(async (item) => {
      try {
        // 재고 부족 아이템 제거
        if (!item.inStock) {
          removeItem(item.id);
          if (showNotifications) {
            NotificationManager.showWarning(
              `${item.name}이(가) 품절되어 장바구니에서 제거되었습니다.`,
            );
          }
          return;
        }

        // 수량 초과 아이템 수량 조정
        if (item.maxQuantity && item.quantity > item.maxQuantity) {
          updateItem(item.id, { quantity: item.maxQuantity });
          if (showNotifications) {
            NotificationManager.showInfo(
              `${item.name}의 수량이 최대 구매 가능 수량(${item.maxQuantity}개)으로 조정되었습니다.`,
            );
          }
          return;
        }

        // 기타 문제가 있는 아이템 제거
        removeItem(item.id);
        if (showNotifications) {
          NotificationManager.showError(`${item.name}에 문제가 있어 장바구니에서 제거되었습니다.`);
        }
      } catch (error) {
        console.error(`Failed to fix invalid item ${item.id}:`, error);
      }
    });

    await Promise.all(fixPromises);
  }, [validateCart, removeItem, updateItem, showNotifications]);

  // === 자동 검증 및 수정 ===
  useEffect(() => {
    if (!autoFix || items.length === 0) return;

    const validation = validateCart();

    if (!validation.isValid) {
      // 에러 설정
      setError(validation.errors.join(', '));

      // 자동 수정
      fixInvalidItems();
    } else {
      // 에러 클리어
      setError(undefined);
    }
  }, [items, autoFix, validateCart, fixInvalidItems, setError]);

  // === 실시간 장바구니 유효성 상태 ===
  const isCartValid = validateCart().isValid;

  return {
    validateCart,
    validateItem,
    fixInvalidItems,
    isCartValid,
  };
}
