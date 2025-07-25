import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/lib/auth/server';
import { UserResponse } from '@/domains/auth/types/auth';

/**
 * 인증 상태 조회를 위한 React Query 훅
 * 
 * 특징:
 * - 클라이언트에서만 실행되는 안전한 패턴
 * - 로딩 상태를 명시적으로 처리
 * - SSR 안전성 보장
 */
export function useAuthQuery() {
  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async (): Promise<UserResponse | null> => {
      try {
        const sessionInfo = await getCurrentUser();
        return sessionInfo;
      } catch (error) {
        console.error('Failed to get current user:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5분간 fresh
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    retry: false, // 인증 실패시 재시도 안함
    refetchOnWindowFocus: true, // 탭 전환시 재검증
    enabled: typeof window !== 'undefined', // 클라이언트에서만 실행
  });
}

/**
 * 인증 query key 상수
 */
export const AUTH_QUERY_KEYS = {
  user: ['auth', 'user'] as const,
} as const;