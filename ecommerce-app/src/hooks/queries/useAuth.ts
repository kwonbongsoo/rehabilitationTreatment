import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthRepository } from '../../context/RepositoryContext';
import { LoginRequest, LoginResponse, SessionInfoResponse } from '../../api/models/auth';
import { queryKeys } from './queryKeys';
import { useAuth } from '../../store/useAuthStore';
import { useCallback, useEffect } from 'react';

interface SessionInfoOptions {
  enabled?: boolean;
  retry?: boolean | number;
  staleTime?: number;
  onError?: (error: Error) => void;
}

/**
 * 로그인 훅 - AuthProvider와 안전한 연동
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const authRepo = useAuthRepository();
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
      return authRepo.login(credentials, idempotencyKey);
    },
    [authRepo],
  );

  // 성공 콜백을 useCallback으로 메모이제이션
  const onSuccessCallback = useCallback(
    (response: LoginResponse) => {
      const { role, id, email, name } = response.data;
      const filteredUserResponse = { role, id, email, name };

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
      console.error('Login failed:', error);
    },
  });
}

/**
 * 로그아웃 훅
 */
export function useLogout() {
  const authRepo = useAuthRepository();
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  // mutationFn을 useCallback으로 메모이제이션
  const mutationFn = useCallback(async () => {
    return authRepo.logout();
  }, [authRepo]);

  // 성공 콜백을 useCallback으로 메모이제이션
  const onSuccessCallback = useCallback(() => {
    // AuthProvider 상태 초기화
    logout();

    // React Query 캐시 초기화
    queryClient.clear();
    window.location.reload();
  }, [logout, queryClient]);

  return useMutation<void, Error, void>({
    mutationFn,
    onSuccess: onSuccessCallback,
    onError: (error) => {
      console.error('Logout failed:', error);
    },
  });
}

/**
 * 세션 정보 조회 훅 - useQuery로 변경 (베스트 프랙티스)
 */
export function useSessionInfo(options: SessionInfoOptions = {}) {
  const authRepo = useAuthRepository();
  const { setUser } = useAuth();
  const queryClient = useQueryClient();

  // 쿼리 함수를 useCallback으로 메모이제이션
  const queryFn = useCallback(async () => {
    return authRepo.sessionInfo();
  }, [authRepo]);

  const query = useQuery<SessionInfoResponse, Error>({
    queryKey: queryKeys.user.session(),
    queryFn,
    enabled: options.enabled ?? true,
    retry: options.retry ?? false,
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5분
  });

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
  }, [query.error, options.onError]);

  return query;
}
