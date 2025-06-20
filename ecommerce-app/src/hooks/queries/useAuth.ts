import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';
import { apiService } from '../../api/apiClient';
import {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  SessionInfoResponse,
} from '../../api/models/auth';
import { useAuth } from '../../store/useAuthStore';
import { ErrorHandler } from '../../utils/errorHandling';
import { queryKeys } from './queryKeys';

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
 * 로그인 훅 - 새로운 APIClient 사용
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const { setUser } = useAuth();

  // mutationFn을 useCallback으로 메모이제이션
  const mutationFn = useCallback(
    async ({
      credentials,
      idempotencyKey,
    }: {
      credentials: LoginRequest;
      idempotencyKey?: string;
    }) => {
      return apiService.login(credentials, idempotencyKey);
    },
    [],
  );

  // 성공 콜백을 useCallback으로 메모이제이션
  const onSuccessCallback = useCallback(
    (response: LoginResponse) => {
      const { role, id, email, name } = response.data;
      const filteredUserResponse = {
        role,
        id: id ?? '',
        email: email ?? '',
        name: name ?? '',
      };

      // 상태 업데이트 (동기적으로 처리)
      setUser(filteredUserResponse);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.session() });
    },
    [setUser, queryClient],
  );

  return useMutation<LoginResponse, Error, { credentials: LoginRequest; idempotencyKey?: string }>({
    mutationFn,
    onSuccess: onSuccessCallback,
    onError: (error) => {
      ErrorHandler.handleApiError(error, '로그인');
    },
  });
}

/**
 * 로그아웃 훅 - 새로운 APIClient 사용
 */
export function useLogout() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  // mutationFn을 useCallback으로 메모이제이션
  const mutationFn = useCallback(async () => {
    return apiService.logout();
  }, []);

  // 성공 콜백을 useCallback으로 메모이제이션
  const onSuccessCallback = useCallback(() => {
    // AuthProvider 상태 초기화
    logout();

    // React Query 캐시 초기화
    queryClient.clear();
  }, [logout, queryClient]);

  return useMutation<LogoutResponse, Error, void>({
    mutationFn,
    onSuccess: onSuccessCallback,
    onError: (error) => {
      ErrorHandler.handleApiError(error, '로그아웃');
    },
  });
}

/**
 * 세션 정보 조회 훅 - 새로운 APIClient 사용
 */
export function useSessionInfo(options: SessionInfoOptions = {}) {
  const { setUser } = useAuth();
  const queryClient = useQueryClient();

  // 쿼리 함수를 useCallback으로 메모이제이션
  const queryFn = useCallback(async () => {
    return apiService.getSessionInfo();
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
