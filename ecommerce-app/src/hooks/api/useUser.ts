/**
 * 사용자 관련 React Query 훅
 * - 현대적인 데이터 페칭 패턴
 * - 자동 캐싱 및 재검증
 * - 로딩/에러 상태 관리
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '@/services';
import { getCurrentUser } from '@/app/actions/user';
import type {
  // UserResponse,
  RegisterRequest,
} from '@/domains/auth/types/auth';
import type {
  UserUpdateRequest,
  // Address,
  AddressRequest,
} from '@/domains/auth/types/user';
import { isApiError } from '@/lib/api';

/**
 * Query Keys 상수
 */
export const USER_QUERY_KEYS = {
  all: ['user'] as const,
  current: ['user', 'current'] as const,
  profile: ['user', 'profile'] as const,
  addresses: ['user', 'addresses'] as const,
  completeness: ['user', 'completeness'] as const,
  availability: {
    email: (email: string) => ['user', 'availability', 'email', email] as const,
    userId: (userId: string) => ['user', 'availability', 'userId', userId] as const,
  },
} as const;

// ========== 조회 훅 ==========

/**
 * 현재 사용자 정보 조회
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: USER_QUERY_KEYS.current,
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5분간 fresh
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    retry: (failureCount, error) => {
      // 인증 에러는 재시도하지 않음
      if (isApiError(error) && (error.statusCode === 401 || error.statusCode === 403)) {
        window.location.reload();
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: true,
    enabled: typeof window !== 'undefined', // 클라이언트에서만 실행
  });
}

/**
 * 인증 상태 확인
 */
export function useAuthStatus() {
  return useQuery({
    queryKey: ['auth', 'status'],
    queryFn: UserService.checkAuthStatus,
    staleTime: 2 * 60 * 1000, // 2분간 fresh
    gcTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: true,
    enabled: typeof window !== 'undefined',
  });
}

/**
 * 사용자 주소 목록 조회
 */
export function useUserAddresses() {
  return useQuery({
    queryKey: USER_QUERY_KEYS.addresses,
    queryFn: UserService.getAddresses,
    staleTime: 10 * 60 * 1000, // 10분간 fresh
    enabled: typeof window !== 'undefined',
  });
}

/**
 * 프로필 완성도 조회
 */
export function useProfileCompleteness() {
  return useQuery({
    queryKey: USER_QUERY_KEYS.completeness,
    queryFn: UserService.getProfileCompleteness,
    staleTime: 5 * 60 * 1000,
    enabled: typeof window !== 'undefined',
  });
}

/**
 * 이메일 중복 확인
 */
export function useEmailAvailability(email: string, enabled = true) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.availability.email(email),
    queryFn: () => UserService.checkEmailAvailability(email),
    enabled: enabled && !!email && typeof window !== 'undefined',
    staleTime: 30 * 1000, // 30초간 fresh
    retry: false,
  });
}

/**
 * 사용자 ID 중복 확인
 */
export function useUserIdAvailability(userId: string, enabled = true) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.availability.userId(userId),
    queryFn: () => UserService.checkUserIdAvailability(userId),
    enabled: enabled && !!userId && typeof window !== 'undefined',
    staleTime: 30 * 1000,
    retry: false,
  });
}

// ========== 변경 훅 ==========

/**
 * 사용자 정보 업데이트
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserUpdateRequest) => UserService.updateUser(data),
    onSuccess: (updatedUser) => {
      // 관련 쿼리 무효화
      queryClient.setQueryData(USER_QUERY_KEYS.current, updatedUser);
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.completeness });
    },
    onError: (error) => {
      console.error('사용자 정보 업데이트 실패:', error);
    },
  });
}

/**
 * 회원가입
 */
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userData,
      idempotencyKey,
    }: {
      userData: RegisterRequest;
      idempotencyKey?: string;
    }) => UserService.register(userData, idempotencyKey),
    onSuccess: () => {
      // 인증 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
    },
  });
}

/**
 * 주소 추가
 */
export function useAddAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (address: AddressRequest) => UserService.addAddress(address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.addresses });
    },
  });
}

/**
 * 주소 수정
 */
export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, address }: { id: string; address: Partial<AddressRequest> }) =>
      UserService.updateAddress(id, address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.addresses });
    },
  });
}

/**
 * 주소 삭제
 */
export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => UserService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.addresses });
    },
  });
}

/**
 * 기본 주소 설정
 */
export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => UserService.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.addresses });
    },
  });
}

// ========== 편의 훅 ==========

/**
 * 사용자 인증 상태와 정보를 함께 제공하는 통합 훅
 */
export function useAuth() {
  const { data: user, isLoading: userLoading, error: userError } = useCurrentUser();
  const { isLoading: authLoading } = useAuthStatus();

  return {
    user,
    isLoading: userLoading || authLoading,
    error: userError,
    isGuest: user?.role === 'guest',
    isLoggedIn: user?.role !== 'guest',
  };
}

/**
 * 주소 관리 통합 훅
 */
export function useAddressManager() {
  const { data: addresses, isLoading, error } = useUserAddresses();
  const addMutation = useAddAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();
  const setDefaultMutation = useSetDefaultAddress();

  return {
    addresses: addresses || [],
    isLoading,
    error,
    operations: {
      add: addMutation.mutateAsync,
      update: updateMutation.mutateAsync,
      delete: deleteMutation.mutateAsync,
      setDefault: setDefaultMutation.mutateAsync,
    },
    isWorking:
      addMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      setDefaultMutation.isPending,
  };
}
