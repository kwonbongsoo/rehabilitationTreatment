/**
 * 배송 방법 인터페이스
 */
export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: number;
  isDefault: boolean;
  isAvailable: boolean;
}

/**
 * 결제 방법 인터페이스
 */
export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer' | 'digital_wallet' | 'cash_on_delivery';
  name: string;
  description: string;
  isDefault: boolean;
  isAvailable: boolean;
  processingFee?: number;
}

/**
 * 체크아웃 데이터 인터페이스
 */
export interface CheckoutData {
  // 배송 정보
  shippingAddress: {
    recipientName: string;
    phoneNumber: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    instructions?: string;
  };

  // 청구 정보
  billingAddress: {
    recipientName: string;
    phoneNumber: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };

  // 배송/결제 선택
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;

  // 추가 옵션
  giftMessage?: string;
  marketingConsent: boolean;
  termsAgreed: boolean;
}

/**
 * 체크아웃 요청 인터페이스
 */
export interface CheckoutRequest {
  cartItems: import('./cart').CartItem[];
  checkoutData: CheckoutData;
  couponCode?: string;
  loyaltyPoints?: number;
}

/**
 * 체크아웃 응답 인터페이스
 */
export interface CheckoutResponse {
  success: boolean;
  orderId?: string;
  paymentUrl?: string;
  message: string;
  estimatedDelivery?: string;
}
