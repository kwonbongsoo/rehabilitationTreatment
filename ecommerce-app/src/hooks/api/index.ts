/**
 * API 훅 공개 인터페이스
 */

// User hooks
export {
  useCurrentUser,
  useAuthStatus,
  useUserAddresses,
  useProfileCompleteness,
  useEmailAvailability,
  useUserIdAvailability,
  useUpdateUser,
  useRegister,
  useAddAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
  useAuth,
  useAddressManager,
  USER_QUERY_KEYS,
} from './useUser';

// 향후 추가될 훅들
// export { useProducts, useProduct, PRODUCT_QUERY_KEYS } from './useProducts';
// export { useOrders, useOrder, ORDER_QUERY_KEYS } from './useOrders';
// export { useCart, useCartItems, CART_QUERY_KEYS } from './useCart';