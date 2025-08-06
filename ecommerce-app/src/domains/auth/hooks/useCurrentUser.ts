import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../services';

/**
 * 현재 사용자 정보 조회 훅
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'current-user'],
    queryFn: async () => {
      const { success, error, statusCode = 500, data } = await getCurrentUser();

      if (!success && error) {
        throw new Error(error ?? '사용자 정보 조회에 실패했습니다.', {
          cause: { statusCode },
        });
      }

      return data;
    },
    staleTime: 5 * 60 * 1000, // 5분간 fresh
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
  });
}
