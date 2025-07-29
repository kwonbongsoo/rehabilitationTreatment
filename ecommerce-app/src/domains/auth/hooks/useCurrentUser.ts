import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../services';
import { isApiError } from '@/lib/api';

/**
 * 현재 사용자 정보 조회 훅
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'current-user'],
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