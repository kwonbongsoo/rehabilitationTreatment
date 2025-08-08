/**
 * CartApiService 테스트
 * 
 * 장바구니 API 통신 로직을 테스트합니다.
 * 사이드이펙트 방지를 위해 fetch를 모킹합니다.
 */

import { CartApiService } from '../CartApiService';
import type { CartItem } from '../../types/cart';
import type { CheckoutRequest, CheckoutResponse } from '../../types/checkout';

// fetch API 모킹
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe('CartApiService', () => {
  const mockCartItems: CartItem[] = [
    {
      id: '1',
      name: '테스트 상품 1',
      price: 10000,
      quantity: 2,
      inStock: true,
      maxQuantity: 10,
      discount: 10,
      image: 'test1.jpg',
    },
    {
      id: '2',
      name: '테스트 상품 2',
      price: 20000,
      quantity: 1,
      inStock: true,
      maxQuantity: 5,
      discount: 0,
      image: 'test2.jpg',
    },
  ];

  const mockCheckoutRequest: CheckoutRequest = {
    cartItems: mockCartItems,
    checkoutData: {
      shippingAddress: {
        recipientName: '홍길동',
        phoneNumber: '010-1234-5678',
        line1: '서울시 강남구',
        city: '서울시',
        postalCode: '12345',
        country: '한국',
      },
      billingAddress: {
        recipientName: '홍길동',
        phoneNumber: '010-1234-5678',
        line1: '서울시 강남구',
        city: '서울시',
        postalCode: '12345',
        country: '한국',
      },
      shippingMethod: {
        id: 'standard',
        name: '일반 배송',
        description: '2-3일 내 배송',
        price: 3000,
        estimatedDays: 3,
        isDefault: true,
        isAvailable: true,
      },
      paymentMethod: {
        id: 'card',
        type: 'card' as const,
        name: '신용카드',
        description: '신용카드 결제',
        isDefault: true,
        isAvailable: true,
      },
      marketingConsent: false,
      termsAgreed: true,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProductInfo', () => {
    it('상품 정보를 성공적으로 조회해야 한다', async () => {
      const mockProductInfo = {
        id: '123',
        name: '테스트 상품',
        price: 15000,
        stock: 10,
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockProductInfo),
      } as any;

      mockFetch.mockResolvedValue(mockResponse);

      const result = await CartApiService.getProductInfo('123');

      expect(mockFetch).toHaveBeenCalledWith('/api/products/123');
      expect(mockResponse.json).toHaveBeenCalled();
      expect(result).toEqual(mockProductInfo);
    });

    it('상품 정보 API 호출 실패시 에러를 던져야 한다', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
      } as any;

      mockFetch.mockResolvedValue(mockResponse);

      await expect(CartApiService.getProductInfo('nonexistent')).rejects.toThrow(
        '상품 정보를 가져올 수 없습니다.'
      );

      expect(mockFetch).toHaveBeenCalledWith('/api/products/nonexistent');
    });

    it('네트워크 에러 발생시 에러를 던져야 한다', async () => {
      const networkError = new Error('Network error');
      mockFetch.mockRejectedValue(networkError);

      await expect(CartApiService.getProductInfo('123')).rejects.toThrow('Network error');
    });
  });

  describe('syncCart', () => {
    it('장바구니 동기화를 성공적으로 수행해야 한다', async () => {
      const syncedItems = [...mockCartItems];
      if (syncedItems[0]) {
        syncedItems[0].inStock = false; // 서버에서 재고 상태 업데이트
      }

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(syncedItems),
      } as any;

      mockFetch.mockResolvedValue(mockResponse);

      const result = await CartApiService.syncCart(mockCartItems);

      expect(mockFetch).toHaveBeenCalledWith('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: mockCartItems }),
      });
      expect(mockResponse.json).toHaveBeenCalled();
      expect(result).toEqual(syncedItems);
    });

    it('빈 장바구니 동기화도 처리할 수 있어야 한다', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      } as any;

      mockFetch.mockResolvedValue(mockResponse);

      const result = await CartApiService.syncCart([]);

      expect(mockFetch).toHaveBeenCalledWith('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [] }),
      });
      expect(result).toEqual([]);
    });

    it('동기화 API 호출 실패시 에러를 던져야 한다', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      } as any;

      mockFetch.mockResolvedValue(mockResponse);

      await expect(CartApiService.syncCart(mockCartItems)).rejects.toThrow(
        '장바구니 동기화에 실패했습니다.'
      );
    });

    it('JSON 파싱 실패시 에러를 던져야 한다', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('JSON parse error')),
      } as any;

      mockFetch.mockResolvedValue(mockResponse);

      await expect(CartApiService.syncCart(mockCartItems)).rejects.toThrow('JSON parse error');
    });
  });

  describe('processCheckout', () => {
    it('체크아웃을 성공적으로 처리해야 한다', async () => {
      const mockCheckoutResponse: CheckoutResponse = {
        success: true,
        orderId: 'ORDER-123',
        message: '주문이 성공적으로 처리되었습니다.',
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockCheckoutResponse),
      } as any;

      mockFetch.mockResolvedValue(mockResponse);

      const result = await CartApiService.processCheckout(mockCheckoutRequest);

      expect(mockFetch).toHaveBeenCalledWith('/api/cart/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCheckoutRequest),
      });
      expect(mockResponse.json).toHaveBeenCalled();
      expect(result).toEqual(mockCheckoutResponse);
    });

    it('체크아웃 API 호출 실패시 에러를 던져야 한다', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
      } as any;

      mockFetch.mockResolvedValue(mockResponse);

      await expect(CartApiService.processCheckout(mockCheckoutRequest)).rejects.toThrow(
        '주문 처리에 실패했습니다.'
      );
    });

    it('서버 에러 발생시 에러를 던져야 한다', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      } as any;

      mockFetch.mockResolvedValue(mockResponse);

      await expect(CartApiService.processCheckout(mockCheckoutRequest)).rejects.toThrow(
        '주문 처리에 실패했습니다.'
      );
    });

    it('체크아웃 요청 데이터가 올바르게 전송되어야 한다', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      } as any;

      mockFetch.mockResolvedValue(mockResponse);

      await CartApiService.processCheckout(mockCheckoutRequest);

      const fetchCall = mockFetch.mock.calls[0];
      const requestBody = fetchCall?.[1] ? JSON.parse(fetchCall[1].body as string) : null;

      expect(requestBody).toEqual(mockCheckoutRequest);
      expect(requestBody?.cartItems).toHaveLength(2);
      expect(requestBody?.checkoutData.shippingAddress.recipientName).toBe('홍길동');
    });
  });

  describe('applyCoupon', () => {
    it('쿠폰을 성공적으로 적용해야 한다', async () => {
      const mockCouponResponse = {
        discount: 5000,
        message: '5,000원 할인이 적용되었습니다.',
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockCouponResponse),
      } as any;

      mockFetch.mockResolvedValue(mockResponse);

      const result = await CartApiService.applyCoupon('DISCOUNT5000', mockCartItems);

      expect(mockFetch).toHaveBeenCalledWith('/api/cart/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'DISCOUNT5000',
          items: mockCartItems,
        }),
      });
      expect(mockResponse.json).toHaveBeenCalled();
      expect(result).toEqual(mockCouponResponse);
    });

    it('유효하지 않은 쿠폰 코드에 대해 에러를 던져야 한다', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
      } as any;

      mockFetch.mockResolvedValue(mockResponse);

      await expect(CartApiService.applyCoupon('INVALID', mockCartItems)).rejects.toThrow(
        '쿠폰 적용에 실패했습니다.'
      );
    });

    it('만료된 쿠폰에 대해 에러를 던져야 한다', async () => {
      const mockResponse = {
        ok: false,
        status: 410,
      } as any;

      mockFetch.mockResolvedValue(mockResponse);

      await expect(CartApiService.applyCoupon('EXPIRED', mockCartItems)).rejects.toThrow(
        '쿠폰 적용에 실패했습니다.'
      );
    });

    it('빈 쿠폰 코드도 처리할 수 있어야 한다', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
      } as any;

      mockFetch.mockResolvedValue(mockResponse);

      await expect(CartApiService.applyCoupon('', mockCartItems)).rejects.toThrow(
        '쿠폰 적용에 실패했습니다.'
      );

      expect(mockFetch).toHaveBeenCalledWith('/api/cart/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: '',
          items: mockCartItems,
        }),
      });
    });

    it('할인 금액이 0인 경우도 처리할 수 있어야 한다', async () => {
      const mockCouponResponse = {
        discount: 0,
        message: '이미 최대 할인이 적용되었습니다.',
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockCouponResponse),
      } as any;

      mockFetch.mockResolvedValue(mockResponse);

      const result = await CartApiService.applyCoupon('ALREADYMAX', mockCartItems);

      expect(result.discount).toBe(0);
      expect(result.message).toBe('이미 최대 할인이 적용되었습니다.');
    });
  });

  describe('에러 처리', () => {
    it('모든 메서드에서 fetch 호출 실패시 원본 에러를 던져야 한다', async () => {
      const networkError = new Error('Connection refused');
      mockFetch.mockRejectedValue(networkError);

      await expect(CartApiService.getProductInfo('123')).rejects.toThrow('Connection refused');
      await expect(CartApiService.syncCart(mockCartItems)).rejects.toThrow('Connection refused');
      await expect(CartApiService.processCheckout(mockCheckoutRequest)).rejects.toThrow('Connection refused');
      await expect(CartApiService.applyCoupon('TEST', mockCartItems)).rejects.toThrow('Connection refused');
    });

    it('응답 JSON 파싱 실패시 원본 에러를 던져야 한다', async () => {
      const jsonError = new Error('Invalid JSON');
      const mockResponse = {
        ok: true,
        json: jest.fn().mockRejectedValue(jsonError),
      } as any;

      mockFetch.mockResolvedValue(mockResponse);

      await expect(CartApiService.getProductInfo('123')).rejects.toThrow('Invalid JSON');
      await expect(CartApiService.syncCart(mockCartItems)).rejects.toThrow('Invalid JSON');
      await expect(CartApiService.processCheckout(mockCheckoutRequest)).rejects.toThrow('Invalid JSON');
      await expect(CartApiService.applyCoupon('TEST', mockCartItems)).rejects.toThrow('Invalid JSON');
    });
  });

  describe('API 엔드포인트', () => {
    it('올바른 API 엔드포인트를 호출해야 한다', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      } as any;

      mockFetch.mockResolvedValue(mockResponse);

      // 각 메서드 호출
      await CartApiService.getProductInfo('123').catch(() => {});
      await CartApiService.syncCart([]).catch(() => {});
      await CartApiService.processCheckout(mockCheckoutRequest).catch(() => {});
      await CartApiService.applyCoupon('TEST', []).catch(() => {});

      const calls = mockFetch.mock.calls;
      expect(calls[0]?.[0]).toBe('/api/products/123');
      expect(calls[1]?.[0]).toBe('/api/cart/sync');
      expect(calls[2]?.[0]).toBe('/api/cart/checkout');
      expect(calls[3]?.[0]).toBe('/api/cart/coupon');
    });

    it('모든 POST 요청에서 올바른 헤더가 설정되어야 한다', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      } as any;

      mockFetch.mockResolvedValue(mockResponse);

      await CartApiService.syncCart([]).catch(() => {});
      await CartApiService.processCheckout(mockCheckoutRequest).catch(() => {});
      await CartApiService.applyCoupon('TEST', []).catch(() => {});

      const calls = mockFetch.mock.calls;
      
      // syncCart 호출
      expect(calls[0]?.[1]?.headers).toEqual({ 'Content-Type': 'application/json' });
      expect(calls[0]?.[1]?.method).toBe('POST');
      
      // processCheckout 호출
      expect(calls[1]?.[1]?.headers).toEqual({ 'Content-Type': 'application/json' });
      expect(calls[1]?.[1]?.method).toBe('POST');
      
      // applyCoupon 호출
      expect(calls[2]?.[1]?.headers).toEqual({ 'Content-Type': 'application/json' });
      expect(calls[2]?.[1]?.method).toBe('POST');
    });
  });
});