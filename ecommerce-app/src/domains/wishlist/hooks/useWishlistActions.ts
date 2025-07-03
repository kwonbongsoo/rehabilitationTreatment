/**
 * 위시리스트 액션 훅 (기존 코드 기반)
 *
 * 위시리스트 관련 액션들을 래핑하여 컴포넌트에서 사용하기 쉽게 만듭니다.
 */
import { useCallback } from 'react';
import { useWishlistStore } from '../stores/useWishlistStore';
import { NotificationManager } from '@/utils/notifications';
import type { WishlistItem } from '../types/wishlist';

interface UseWishlistActionsOptions {
  showNotification?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface UseWishlistActionsReturn {
  // 액션들
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (itemId: number) => void;
  toggleWishlist: (item: WishlistItem) => void;
  clearWishlist: () => void;

  // 상태
  isInWishlist: (itemId: number) => boolean;
  wishlistCount: number;
}

export function useWishlistActions(
  options: UseWishlistActionsOptions = {},
): UseWishlistActionsReturn {
  const { showNotification = true, onSuccess, onError } = options;

  // Zustand selector를 사용하여 필요한 상태와 액션만 선택
  const addItem = useWishlistStore((state) => state.addItem);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const clear = useWishlistStore((state) => state.clear);
  const hasItem = useWishlistStore((state) => state.hasItem);
  const totalItems = useWishlistStore((state) => state.totalItems);

  const addToWishlist = useCallback(
    (item: WishlistItem) => {
      try {
        addItem(item);

        if (showNotification) {
          NotificationManager.showSuccess(`${item.name}이(가) 위시리스트에 추가되었습니다.`);
        }

        onSuccess?.();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '위시리스트 추가 중 오류가 발생했습니다.';

        if (showNotification) {
          NotificationManager.showError(errorMessage);
        }

        onError?.(error instanceof Error ? error : new Error(errorMessage));
      }
    },
    [addItem, showNotification, onSuccess, onError],
  );

  const removeFromWishlist = useCallback(
    (itemId: number) => {
      try {
        removeItem(itemId);

        if (showNotification) {
          NotificationManager.showSuccess('위시리스트에서 제거되었습니다.');
        }

        onSuccess?.();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '위시리스트 제거 중 오류가 발생했습니다.';

        if (showNotification) {
          NotificationManager.showError(errorMessage);
        }

        onError?.(error instanceof Error ? error : new Error(errorMessage));
      }
    },
    [removeItem, showNotification, onSuccess, onError],
  );

  const toggleWishlist = useCallback(
    (item: WishlistItem) => {
      if (hasItem(item.id)) {
        removeFromWishlist(item.id);
      } else {
        addToWishlist(item);
      }
    },
    [hasItem, addToWishlist, removeFromWishlist],
  );

  const clearWishlist = useCallback(() => {
    try {
      clear();

      if (showNotification) {
        NotificationManager.showSuccess('위시리스트가 비워졌습니다.');
      }

      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '위시리스트 비우기 중 오류가 발생했습니다.';

      if (showNotification) {
        NotificationManager.showError(errorMessage);
      }

      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [clear, showNotification, onSuccess, onError]);

  const isInWishlist = useCallback((itemId: number) => hasItem(itemId), [hasItem]);

  return {
    // 액션들
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,

    // 상태
    isInWishlist,
    wishlistCount: totalItems,
  };
}
