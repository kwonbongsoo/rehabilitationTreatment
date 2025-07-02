import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';
import { getSessionInfo as getSessionInfoAction } from '@/app/actions/auth';
import { SessionInfoResponse } from '@/domains/auth/types/auth';
import { useAuth } from '@/domains/auth/stores';
import { queryKeys } from '@/hooks/queries/queryKeys';

interface SessionInfoOptions {
  enabled?: boolean;
  retry?: boolean | number;
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  onError?: (error: Error) => void;
}

/**
 * 세션 정보 조회 훅 - 새로운 APIClient 사용
 */
export function useSessionInfo(options: SessionInfoOptions = {}) {
  const { setUser } = useAuth();
  const queryClient = useQueryClient();

  // 쿼리 함수를 useCallback으로 메모이제이션
  const queryFn = useCallback(async () => {
    return getSessionInfoAction();
  }, []);

  // React Query 옵션을 useMemo로 메모이제이션
  const queryOptions = useMemo(
    () => ({
      queryKey: queryKeys.user.session(),
      queryFn,
      enabled: options.enabled ?? true,
      retry: options.retry ?? false,
      staleTime: options.staleTime ?? 1 * 60 * 1000, // 1분
      gcTime: options.gcTime ?? 2 * 60 * 1000, // 2분 (기본값)
      refetchOnWindowFocus: options.refetchOnWindowFocus ?? true,
      refetchOnMount: options.refetchOnMount ?? true,
    }),
    [
      queryFn,
      options.enabled,
      options.retry,
      options.staleTime,
      options.gcTime,
      options.refetchOnWindowFocus,
      options.refetchOnMount,
    ],
  );

  const query = useQuery<SessionInfoResponse, Error>(queryOptions);

  // 성공 시 사이드 이펙트 처리
  useEffect(() => {
    if (query.data) {
      const { exp, iat, ...filteredUserResponse } = query.data.data;
      if (filteredUserResponse.role === 'user') {
        setUser(filteredUserResponse);
      }
    }
  }, [query.data, setUser, queryClient]);

  // 에러 처리
  useEffect(() => {
    if (query.error && options.onError) {
      options.onError(query.error);
    }
  }, [query.error, options]);

  return query;
}
