import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '../hooks/queries/queryKeys';

/**
 * React Query 설정 및 기본 옵션
 */
export const queryClientConfig = {
    defaultOptions: {
        queries: {
            // 5분 동안 캐시된 데이터를 신선한 것으로 간주
            staleTime: 1000 * 60 * 5,
            // 네트워크 오류 시 3번 재시도
            retry: (failureCount: number, error: any) => {
                // 401, 403 같은 인증 오류는 재시도하지 않음
                if (error?.response?.status === 401 || error?.response?.status === 403) {
                    return false;
                }
                // 최대 3번까지 재시도
                return failureCount < 3;
            },
            // 백그라운드에서 자동 refetch 비활성화 (성능 최적화)
            refetchOnWindowFocus: false,
            // 컴포넌트 마운트 시 재요청하지 않음
            refetchOnMount: false,
        },
        mutations: {
            // 뮤테이션 실패 시 재시도하지 않음
            retry: false,
        },
    },
};

/**
 * 사용자 관련 캐시 무효화
 */
export function invalidateUserQueries(queryClient: QueryClient) {
    return queryClient.invalidateQueries({
        queryKey: queryKeys.user.all,
    });
}

/**
 * 인증 관련 캐시 무효화
 */
export function invalidateAuthQueries(queryClient: QueryClient) {
    return queryClient.invalidateQueries({
        queryKey: queryKeys.auth.all,
    });
}

/**
 * 로그아웃 시 모든 사용자 데이터 제거
 */
export function clearUserCache(queryClient: QueryClient) {
    queryClient.removeQueries({
        queryKey: queryKeys.user.all,
    });
    queryClient.removeQueries({
        queryKey: queryKeys.auth.all,
    });
}

/**
 * QueryClient 인스턴스 생성
 */
export function createQueryClient(): QueryClient {
    return new QueryClient(queryClientConfig);
}
