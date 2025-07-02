/**
 * Cart 검증 서비스
 *
 * 장바구니 관련 비즈니스 규칙 검증을 담당합니다.
 */
import type { CartItem } from '../types/cart';

export class CartValidationService {
  /**
   * 아이템 기본 검증
   */
  static validateItem(item: CartItem): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 필수 필드 검증
    if (!item.id) errors.push('상품 ID가 없습니다.');
    if (!item.name) errors.push('상품명이 없습니다.');
    if (item.price < 0) errors.push('가격은 0 이상이어야 합니다.');
    if (item.quantity <= 0) errors.push('수량은 1 이상이어야 합니다.');

    // 재고 검증
    if (!item.inStock) errors.push('품절된 상품입니다.');

    // 수량 제한 검증
    if (item.maxQuantity && item.quantity > item.maxQuantity) {
      errors.push(`최대 ${item.maxQuantity}개까지만 구매 가능합니다.`);
    }

    // 할인율 검증
    if (item.discount && (item.discount < 0 || item.discount > 100)) {
      errors.push('할인율이 올바르지 않습니다.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 장바구니 전체 검증
   */
  static validateCart(items: CartItem[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (items.length === 0) {
      errors.push('장바구니가 비어있습니다.');
      return { isValid: false, errors };
    }

    // 각 아이템 검증
    items.forEach((item, index) => {
      const itemValidation = this.validateItem(item);
      if (!itemValidation.isValid) {
        errors.push(`상품 ${index + 1}: ${itemValidation.errors.join(', ')}`);
      }
    });

    // 중복 아이템 검증
    const itemIds = items.map((item) => item.id);
    const duplicates = itemIds.filter((id, index) => itemIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      errors.push('중복된 상품이 있습니다.');
    }

    // 총 금액 검증
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (totalAmount <= 0) {
      errors.push('총 주문 금액이 올바르지 않습니다.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 체크아웃 가능 여부 검증
   */
  static canCheckout(items: CartItem[]): { canCheckout: boolean; errors: string[] } {
    const cartValidation = this.validateCart(items);

    if (!cartValidation.isValid) {
      return {
        canCheckout: false,
        errors: cartValidation.errors,
      };
    }

    const errors: string[] = [];

    // 최소 주문 금액 검증 (예: 10,000원)
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const MIN_ORDER_AMOUNT = 10000;

    if (totalAmount < MIN_ORDER_AMOUNT) {
      errors.push(`최소 주문 금액은 ${MIN_ORDER_AMOUNT.toLocaleString()}원입니다.`);
    }

    // 재고 실시간 검증 (실제로는 API 호출 필요)
    const outOfStockItems = items.filter((item) => !item.inStock);
    if (outOfStockItems.length > 0) {
      errors.push('품절된 상품이 포함되어 있습니다.');
    }

    return {
      canCheckout: errors.length === 0,
      errors,
    };
  }

  /**
   * 상품 추가 가능 여부 검증
   */
  static canAddToCart(
    existingItems: CartItem[],
    newItem: Omit<CartItem, 'quantity'>,
    quantity: number = 1,
  ): { canAdd: boolean; errors: string[] } {
    const errors: string[] = [];

    // 기존 아이템과의 중복 검사
    const existingItem = existingItems.find((item) => item.id === newItem.id);

    if (existingItem) {
      const totalQuantity = existingItem.quantity + quantity;

      // 최대 수량 제한 검사
      if (newItem.maxQuantity && totalQuantity > newItem.maxQuantity) {
        errors.push(
          `최대 ${newItem.maxQuantity}개까지만 구매 가능합니다. (현재: ${existingItem.quantity}개)`,
        );
      }
    }

    // 재고 검증
    if (!newItem.inStock) {
      errors.push('품절된 상품입니다.');
    }

    // 수량 검증
    if (quantity <= 0) {
      errors.push('수량은 1 이상이어야 합니다.');
    }

    return {
      canAdd: errors.length === 0,
      errors,
    };
  }
}
