/**
 * 장바구니 추가 훅
 *
 * 장바구니에 아이템을 추가하는 비즈니스 로직을 관리합니다.
 */
import { useCallback } from 'react';
import { useCartStore } from '../stores/useCartStore';
import { NotificationManager } from '@/utils/notifications';
import type { AddToCartRequest, CartItem } from '../types/cart';

interface UseAddToCartOptions {
  showNotification?: boolean;
  onSuccess?: (item: CartItem) => void;
  onError?: (error: Error) => void;
}

export interface UseAddToCartReturn {
  addToCart: (request: AddToCartRequest) => Promise<boolean>;
  isLoading: boolean;
}

export function useAddToCart(options: UseAddToCartOptions = {}): UseAddToCartReturn {
  const { showNotification = true, onSuccess, onError } = options;

  // Zustand selector를 사용하여 필요한 상태와 액션만 선택
  const addItem = useCartStore((state) => state.addItem);
  const getItem = useCartStore((state) => state.getItem);
  const isItemInCart = useCartStore((state) => state.isItemInCart);
  const validateItem = useCartStore((state) => state.validateItem);
  const isLoading = useCartStore((state) => state.isLoading);
  const setLoading = useCartStore((state) => state.setLoading);
  const setError = useCartStore((state) => state.setError);

  const addToCart = useCallback(
    async (request: AddToCartRequest): Promise<boolean> => {
      try {
        setLoading(true);
        setError(undefined);

        // 1. 상품 정보 검증 (실제로는 API에서 가져와야 함)
        // TODO: 실제 프로덕트 API 연동
        const productInfo = await mockFetchProductInfo(request.productId);

        if (!productInfo) {
          throw new Error('상품 정보를 찾을 수 없습니다.');
        }

        if (!productInfo.inStock) {
          throw new Error('품절된 상품입니다.');
        }

        // 2. 장바구니 아이템 생성
        const cartItem: Omit<CartItem, 'quantity'> = {
          id: `${request.productId}_${request.size || 'default'}_${request.color || 'default'}`,
          name: productInfo.name,
          price: productInfo.price,
          inStock: productInfo.inStock,
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
        if (showNotification) {
          const itemName = cartItem.name;
          const itemCount = isItemInCart(cartItem.id) ? getItem(cartItem.id)?.quantity || 1 : 1;

          NotificationManager.showSuccess(
            `${itemName}이(가) 장바구니에 추가되었습니다. (${itemCount}개)`,
          );
        }

        onSuccess?.(tempItem);
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '장바구니 추가 중 오류가 발생했습니다.';

        setError(errorMessage);

        if (showNotification) {
          NotificationManager.showError(errorMessage);
        }

        onError?.(error instanceof Error ? error : new Error(errorMessage));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [
      addItem,
      getItem,
      isItemInCart,
      validateItem,
      setLoading,
      setError,
      showNotification,
      onSuccess,
      onError,
    ],
  );

  return {
    addToCart,
    isLoading,
  };
}

// === 모킹 함수 (실제로는 API 서비스로 대체) ===

interface MockProductInfo {
  id: string;
  name: string;
  price: number;
  image?: string;
  inStock: boolean;
  discount?: number;
  originalPrice?: number;
  maxQuantity?: number;
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
