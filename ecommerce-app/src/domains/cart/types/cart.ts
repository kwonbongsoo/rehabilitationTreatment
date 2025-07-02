/**
 * 장바구니 아이템 인터페이스
 */
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
  discount?: number; // 할인율 (0-100)
  originalPrice?: number; // 원래 가격
  maxQuantity?: number; // 최대 수량 제한
  inStock: boolean;
}

/**
 * 장바구니 상태 인터페이스
 */
export interface CartState {
  items: CartItem[];
  totalItems: number;
  isLoading: boolean;
  error?: string;
}

/**
 * 장바구니 액션 인터페이스
 */
export interface CartActions {
  // 기본 CRUD 액션
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateItem: (itemId: string, updates: Partial<CartItem>) => void;
  clear: () => void;

  // 계산 함수들
  getItem: (itemId: string) => CartItem | undefined;
  getTotalPrice: () => number;
  getTotalDiscount: () => number;
  getItemCount: () => number;

  // 검증 함수들
  validateItem: (item: CartItem) => boolean;
  isItemInCart: (itemId: string) => boolean;

  // 로딩 상태 관리
  setLoading: (loading: boolean) => void;
  setError: (error: string | undefined) => void;
}

/**
 * 장바구니 추가 요청
 */
export interface AddToCartRequest {
  productId: string;
  quantity?: number;
  size?: string;
  color?: string;
  options?: Record<string, any>;
}

/**
 * 장바구니 아이템 업데이트 요청
 */
export interface UpdateCartItemRequest {
  itemId: string;
  quantity?: number;
  size?: string;
  color?: string;
  options?: Record<string, any>;
}

/**
 * 장바구니 아이템 제거 요청
 */
export interface RemoveFromCartRequest {
  itemId: string;
  reason?: 'user_action' | 'out_of_stock' | 'price_changed';
}

/**
 * 장바구니 요약 정보
 */
export interface CartSummary {
  itemCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
}
