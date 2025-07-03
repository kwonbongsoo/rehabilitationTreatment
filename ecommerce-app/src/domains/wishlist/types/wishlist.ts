/**
 * 위시리스트 아이템 인터페이스 (기존 코드 기반)
 */
export interface WishlistItem {
  id: number;
  name: string;
  price: number;
  image: string;
  inStock: boolean;
  size: string;
  color: string;
}

/**
 * 위시리스트 상태 인터페이스 (기존 코드 기반)
 */
export interface WishlistState {
  wishlistItems: WishlistItem[];
  totalItems: number;
}

/**
 * 위시리스트 액션 인터페이스 (기존 코드 기반)
 */
export interface WishlistActions {
  // 기존 액션들
  addItem: (item: WishlistItem) => void;
  removeItem: (itemId: number) => void;
  clear: () => void;

  // 기존 셀렉터들
  hasItem: (itemId: number) => boolean;
  getItem: (itemId: number) => WishlistItem | undefined;
}

/**
 * 위시리스트 요약 정보
 */
export interface WishlistSummary {
  totalItems: number;
  totalValue: number;
  currency: string;
}
