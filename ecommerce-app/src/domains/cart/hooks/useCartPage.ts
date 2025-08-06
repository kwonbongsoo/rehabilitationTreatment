/**
 * 장바구니 페이지 비즈니스 로직 훅
 * UI 로직과 비즈니스 로직을 분리
 */

import { useState, useEffect, useCallback } from 'react';
import { useCartState } from './useCartState';
import { useCartActions } from './useCartActions';
import { MOCK_CART_ITEMS, MockCartItem } from '@/data/mock';

interface UseCartPageReturn {
  // 상태
  displayItems: MockCartItem[];
  isLoading: boolean;
  selectedItemId: string | null;
  showDeleteModal: boolean;
  showClearModal: boolean;
  discountCode: string;
  subtotal: number;
  total: number;
  
  // 액션
  handleItemClick: (itemId: string) => void;
  handleDeleteItem: (itemId: string) => void;
  handleClearCart: () => void;
  confirmDeleteItem: () => void;
  confirmClearCart: () => void;
  updateItemQuantity: (itemId: string, change: number) => void;
  setDiscountCode: (code: string) => void;
  applyDiscountCode: () => void;
  handleCheckout: () => void;
  
  // 모달 제어
  setShowDeleteModal: (show: boolean) => void;
  setShowClearModal: (show: boolean) => void;
}

export function useCartPage(): UseCartPageReturn {
  const { cartItems, isLoading } = useCartState();
  const { removeItem, updateQuantity, clearCart } = useCartActions();

  // 상태 관리
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState('');

  // 중앙집중화된 Mock 데이터 사용
  const displayItems = cartItems.length > 0 ? cartItems : MOCK_CART_ITEMS;

  // 가격 계산
  const subtotal = displayItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal; // 추가 수수료 없음

  // 아이템 클릭 처리
  const handleItemClick = useCallback((itemId: string) => {
    setSelectedItemId(selectedItemId === itemId ? null : itemId);
  }, [selectedItemId]);

  // 아이템 삭제 처리
  const handleDeleteItem = useCallback((itemId: string) => {
    setItemToDelete(itemId);
    setShowDeleteModal(true);
  }, []);

  // 장바구니 비우기 처리
  const handleClearCart = useCallback(() => {
    setShowClearModal(true);
  }, []);

  // 삭제 확인 처리
  const confirmDeleteItem = useCallback(() => {
    if (itemToDelete) {
      removeItem(itemToDelete);
      setItemToDelete(null);
      setSelectedItemId(null);
    }
    setShowDeleteModal(false);
  }, [itemToDelete, removeItem]);

  // 전체 삭제 확인 처리
  const confirmClearCart = useCallback(() => {
    clearCart();
    setSelectedItemId(null);
    setShowClearModal(false);
  }, [clearCart]);

  // 수량 업데이트 처리
  const updateItemQuantity = useCallback((itemId: string, change: number) => {
    const item = displayItems.find((item) => item.id === itemId);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      updateQuantity(itemId, newQuantity);
    }
  }, [displayItems, updateQuantity]);

  // 할인 코드 적용 (추후 구현)
  const applyDiscountCode = useCallback(() => {
    // TODO: 할인 코드 적용 로직 구현
    // 개발 환경에서만 로그 출력
    if (process.env.NODE_ENV === 'development') {
      console.log('할인 코드 적용:', discountCode);
    }
  }, [discountCode]);

  // 체크아웃 처리 (추후 구현)
  const handleCheckout = useCallback(() => {
    // TODO: 체크아웃 로직 구현
    // 개발 환경에서만 로그 출력
    if (process.env.NODE_ENV === 'development') {
      console.log('체크아웃 처리');
    }
  }, []);

  // CommonLayout에서 발생하는 clearCart 이벤트 리스너
  useEffect(() => {
    const handleClearCartEvent = () => {
      handleClearCart();
    };

    window.addEventListener('clearCart', handleClearCartEvent);

    return () => {
      window.removeEventListener('clearCart', handleClearCartEvent);
    };
  }, [handleClearCart]);

  return {
    // 상태
    displayItems,
    isLoading,
    selectedItemId,
    showDeleteModal,
    showClearModal,
    discountCode,
    subtotal,
    total,
    
    // 액션
    handleItemClick,
    handleDeleteItem,
    handleClearCart,
    confirmDeleteItem,
    confirmClearCart,
    updateItemQuantity,
    setDiscountCode,
    applyDiscountCode,
    handleCheckout,
    
    // 모달 제어
    setShowDeleteModal,
    setShowClearModal,
  };
}