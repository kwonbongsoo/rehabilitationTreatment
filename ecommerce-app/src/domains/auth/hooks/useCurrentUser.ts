import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../services';

/**
 * 현재 사용자 정보 조회 훅
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'current-user'],
    queryFn: async () => {
      try {
        const result = await getCurrentUser();

        if (result && !result.success) {
          const error = new Error(result.error || '사용자 정보 조회에 실패했습니다.') as Error & {
            statusCode?: number;
          };
          error.statusCode = result.statusCode ?? 500;
          throw error;
        }

        return result.data;
      } catch (error) {
        // 이미 처리된 에러는 그대로 전달
        if (error instanceof Error && 'statusCode' in error) {
          throw error;
        }

        // 예상치 못한 에러 처리
        const wrappedError = new Error('사용자 정보 조회 중 오류가 발생했습니다.') as Error & {
          statusCode?: number;
        };
        wrappedError.statusCode = 500;
        throw wrappedError;
      }
    },
    staleTime: 5 * 60 * 1000, // 5분간 fresh
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
  });
}
