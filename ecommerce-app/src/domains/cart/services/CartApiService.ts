/**
 * Cart API 서비스
 *
 * 장바구니 관련 API 통신을 담당합니다.
 */
import type { CartItem, AddToCartRequest } from '../types/cart';
import type { CheckoutRequest, CheckoutResponse } from '../types/checkout';

export class CartApiService {
  private static readonly BASE_URL = '/api/cart';

  /**
   * 상품 정보 조회
   */
  static async getProductInfo(productId: string): Promise<any> {
    const response = await fetch(`/api/products/${productId}`);
    if (!response.ok) {
      throw new Error('상품 정보를 가져올 수 없습니다.');
    }
    return response.json();
  }

  /**
   * 장바구니 동기화 (서버와 동기화)
   */
  static async syncCart(items: CartItem[]): Promise<CartItem[]> {
    const response = await fetch(`${this.BASE_URL}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      throw new Error('장바구니 동기화에 실패했습니다.');
    }

    return response.json();
  }

  /**
   * 체크아웃 처리
   */
  static async processCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
    const response = await fetch(`${this.BASE_URL}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('주문 처리에 실패했습니다.');
    }

    return response.json();
  }

  /**
   * 쿠폰 적용
   */
  static async applyCoupon(
    code: string,
    items: CartItem[],
  ): Promise<{ discount: number; message: string }> {
    const response = await fetch(`${this.BASE_URL}/coupon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, items }),
    });

    if (!response.ok) {
      throw new Error('쿠폰 적용에 실패했습니다.');
    }

    return response.json();
  }
}
