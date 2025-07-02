/**
 * 체크아웃 훅
 *
 * 장바구니에서 주문까지의 체크아웃 프로세스를 관리합니다.
 */
import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../stores/useCartStore';
import { useCartValidation } from './useCartValidation';
import { useCartActions } from './useCartActions';
import { NotificationManager } from '@/utils/notifications';
import type {
  CheckoutData,
  CheckoutRequest,
  CheckoutResponse,
  ShippingMethod,
  PaymentMethod,
} from '../types/checkout';

interface UseCheckoutOptions {
  onSuccess?: (response: CheckoutResponse) => void;
  onError?: (error: Error) => void;
}

export interface UseCheckoutReturn {
  // 상태
  isProcessing: boolean;
  checkoutData: Partial<CheckoutData>;
  availableShippingMethods: ShippingMethod[];
  availablePaymentMethods: PaymentMethod[];

  // 액션
  updateCheckoutData: (data: Partial<CheckoutData>) => void;
  processCheckout: () => Promise<boolean>;

  // 검증
  canCheckout: boolean;
  validationErrors: string[];
}

export function useCheckout(options: UseCheckoutOptions = {}): UseCheckoutReturn {
  const { onSuccess, onError } = options;
  const router = useRouter();

  const items = useCartStore((state) => state.items);
  const { validateCart, isCartValid } = useCartValidation();
  const { clearCart } = useCartActions();

  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutData, setCheckoutData] = useState<Partial<CheckoutData>>({});

  // === 배송 방법 옵션 ===
  const availableShippingMethods: ShippingMethod[] = useMemo(
    () => [
      {
        id: 'standard',
        name: '일반 배송',
        description: '2-3일 소요',
        price: 3000,
        estimatedDays: 3,
        isDefault: true,
        isAvailable: true,
      },
      {
        id: 'express',
        name: '당일 배송',
        description: '당일 배송 (오후 6시 이전 주문시)',
        price: 8000,
        estimatedDays: 0,
        isDefault: false,
        isAvailable: true,
      },
      {
        id: 'free',
        name: '무료 배송',
        description: '5-7일 소요',
        price: 0,
        estimatedDays: 7,
        isDefault: false,
        isAvailable: items.reduce((total, item) => total + item.price * item.quantity, 0) >= 50000,
      },
    ],
    [items],
  );

  // === 결제 방법 옵션 ===
  const availablePaymentMethods: PaymentMethod[] = useMemo(
    () => [
      {
        id: 'card',
        type: 'card',
        name: '신용카드/체크카드',
        description: '모든 카드사 지원',
        isDefault: true,
        isAvailable: true,
      },
      {
        id: 'bank_transfer',
        type: 'bank_transfer',
        name: '계좌이체',
        description: '실시간 계좌이체',
        isDefault: false,
        isAvailable: true,
      },
      {
        id: 'digital_wallet',
        type: 'digital_wallet',
        name: '간편결제',
        description: '카카오페이, 네이버페이 등',
        isDefault: false,
        isAvailable: true,
      },
    ],
    [],
  );

  // === 체크아웃 데이터 업데이트 ===
  const updateCheckoutData = useCallback((data: Partial<CheckoutData>) => {
    setCheckoutData((prev) => ({ ...prev, ...data }));
  }, []);

  // === 체크아웃 검증 ===
  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    // 장바구니 검증
    if (items.length === 0) {
      errors.push('장바구니가 비어있습니다.');
      return errors;
    }

    if (!isCartValid) {
      const cartValidation = validateCart();
      errors.push(...cartValidation.errors);
    }

    // 배송 주소 검증
    if (!checkoutData.shippingAddress) {
      errors.push('배송 주소를 입력해주세요.');
    } else {
      const addr = checkoutData.shippingAddress;
      if (!addr.recipientName) errors.push('받는 분 이름을 입력해주세요.');
      if (!addr.phoneNumber) errors.push('받는 분 전화번호를 입력해주세요.');
      if (!addr.line1) errors.push('상세 주소를 입력해주세요.');
      if (!addr.city) errors.push('도시를 입력해주세요.');
      if (!addr.postalCode) errors.push('우편번호를 입력해주세요.');
    }

    // 결제 방법 검증
    if (!checkoutData.paymentMethod) {
      errors.push('결제 방법을 선택해주세요.');
    }

    // 약관 동의 검증
    if (!checkoutData.termsAgreed) {
      errors.push('이용약관에 동의해주세요.');
    }

    return errors;
  }, [items, isCartValid, validateCart, checkoutData]);

  const canCheckout = validationErrors.length === 0 && !isProcessing;

  // === 체크아웃 처리 ===
  const processCheckout = useCallback(async (): Promise<boolean> => {
    if (!canCheckout) {
      NotificationManager.showError(validationErrors[0] || '체크아웃을 진행할 수 없습니다.');
      return false;
    }

    try {
      setIsProcessing(true);

      // 체크아웃 요청 데이터 구성
      const request: CheckoutRequest = {
        cartItems: items,
        checkoutData: checkoutData as CheckoutData,
      };

      // 실제로는 API 호출
      const response = await mockProcessCheckout(request);

      if (response.success) {
        // 성공 처리
        await clearCart({ showNotification: false, confirm: false });

        NotificationManager.showSuccess(`주문이 완료되었습니다! 주문번호: ${response.orderId}`);

        onSuccess?.(response);

        // 주문 완료 페이지로 이동
        if (response.orderId) {
          router.push(`/orders/${response.orderId}/complete`);
        }

        return true;
      } else {
        throw new Error(response.message || '주문 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '주문 처리 중 오류가 발생했습니다.';

      NotificationManager.showError(errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));

      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [canCheckout, validationErrors, items, checkoutData, clearCart, onSuccess, onError, router]);

  return {
    // 상태
    isProcessing,
    checkoutData,
    availableShippingMethods,
    availablePaymentMethods,

    // 액션
    updateCheckoutData,
    processCheckout,

    // 검증
    canCheckout,
    validationErrors,
  };
}

// === 모킹 함수 (실제로는 API 서비스로 대체) ===

async function mockProcessCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
  // 네트워크 지연 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 간단한 검증
  if (!request.cartItems.length) {
    return {
      success: false,
      message: '장바구니가 비어있습니다.',
    };
  }

  // 성공 응답 모킹
  const orderId = `ORDER-${Date.now()}`;
  const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  return {
    success: true,
    orderId,
    message: '주문이 성공적으로 완료되었습니다.',
    ...(estimatedDelivery && { estimatedDelivery }),
  };
}
