import { renderHook, act } from '@testing-library/react';
import { useCartActions } from '../useCartActions';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';

// Create mock functions first
const mockUseCartStore = jest.fn();
const mockUseCartSummary = jest.fn();
const mockFetchProductInfo = jest.fn() as jest.MockedFunction<any>;

// Mock dependencies with immediate return values
jest.mock('../../stores/useCartStore', () => ({
  useCartStore: mockUseCartStore,
  useCartSummary: mockUseCartSummary,
}));

jest.mock('../../../../utils/notifications', () => ({
  NotificationManager: {
    showSuccess: jest.fn(),
    showError: jest.fn(),
    showWarning: jest.fn(),
    showInfo: jest.fn(),
  },
}));

jest.mock('../../services/productInfoService', () => ({
  fetchProductInfo: mockFetchProductInfo,
}));

// Mock NotificationManager
const mockNotificationManager = {
  showSuccess: jest.fn(),
  showError: jest.fn(),
  showWarning: jest.fn(),
  showInfo: jest.fn(),
};
require('../../../../utils/notifications').NotificationManager = mockNotificationManager;

describe('useCartActions', () => {
  // Mock store functions
  const mockAddItem = jest.fn();
  const mockUpdateQuantity = jest.fn();
  const mockRemoveItem = jest.fn();
  const mockUpdateItem = jest.fn();
  const mockClear = jest.fn();
  const mockGetItem = jest.fn();
  const mockGetItemCount = jest.fn();
  const mockIsItemInCart = jest.fn();
  const mockValidateItem = jest.fn();
  const mockSetLoading = jest.fn();
  const mockSetError = jest.fn();

  const mockStoreState = {
    cartItems: [],
    totalItems: 0,
    addItem: mockAddItem,
    updateQuantity: mockUpdateQuantity,
    removeItem: mockRemoveItem,
    updateItem: mockUpdateItem,
    clear: mockClear,
    getItem: mockGetItem,
    getItemCount: mockGetItemCount,
    isItemInCart: mockIsItemInCart,
    validateItem: mockValidateItem,
    isLoading: false,
    setLoading: mockSetLoading,
    setError: mockSetError,
    getTotalPrice: jest.fn(),
    getTotalDiscount: jest.fn(),
  };

  const mockSummary = {
    total: 0,
    itemCount: 0,
    discount: 0,
    shipping: 0,
    tax: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock store state to default
    mockStoreState.cartItems = [];
    mockStoreState.isLoading = false;

    // Reset mock summary to default
    mockSummary.total = 0;
    mockSummary.itemCount = 0;
    mockSummary.discount = 0;
    mockSummary.shipping = 0;
    mockSummary.tax = 0;

    // Mock zustand store with proper selector support
    mockUseCartStore.mockImplementation((selector?: any) => {
      if (selector) {
        return selector(mockStoreState);
      }
      return mockStoreState;
    });

    mockUseCartSummary.mockReturnValue(mockSummary);

    // Default mock implementations
    mockValidateItem.mockReturnValue(true);
    mockGetItemCount.mockReturnValue(0);
    mockIsItemInCart.mockReturnValue(false);
    mockGetItem.mockReturnValue(null);

    // Default fetchProductInfo mock
    mockFetchProductInfo.mockResolvedValue({
      id: 'test-product',
      name: '테스트 상품',
      price: 10000,
      image: '/test-image.jpg',
      inStock: true,
      discount: 0,
      originalPrice: 10000,
      maxQuantity: 10,
    });
  });

  describe('상태 반환값', () => {
    it('useCartActions 훅이 올바른 타입을 반환한다', () => {
      const { result } = renderHook(() => useCartActions());

      expect(typeof result.current.isLoading).toBe('boolean');
      expect(typeof result.current.itemCount).toBe('number');
      expect(typeof result.current.isEmpty).toBe('boolean');
      expect(typeof result.current.summary).toBe('object');
    });
  });

  describe('기본 기능', () => {
    it('useCartActions 훅이 올바른 인터페이스를 반환한다', () => {
      const { result } = renderHook(() => useCartActions());

      expect(typeof result.current.addToCart).toBe('function');
      expect(typeof result.current.updateQuantity).toBe('function');
      expect(typeof result.current.removeItem).toBe('function');
      expect(typeof result.current.clearCart).toBe('function');
      expect(typeof result.current.incrementQuantity).toBe('function');
      expect(typeof result.current.decrementQuantity).toBe('function');
      expect(typeof result.current.updateItemOptions).toBe('function');
    });

    it('함수들이 에러 없이 호출된다', async () => {
      const { result } = renderHook(() => useCartActions());

      // 동기 함수들은 act()로 감싸서 상태 업데이트 경고 방지
      act(() => {
        result.current.updateQuantity('test', 1);
        result.current.removeItem('test');
        result.current.incrementQuantity('test');
        result.current.decrementQuantity('test');
        result.current.updateItemOptions({ itemId: 'test', size: 'L' });
      });

      // async 함수들도 에러 없이 호출되는지 확인
      await act(async () => {
        await result.current.addToCart({ id: 'test', quantity: 1 });
        await result.current.clearCart({ confirm: false });
      });
    });
  });
});
