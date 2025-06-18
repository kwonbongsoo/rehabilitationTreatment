import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthRepository } from '../../context/RepositoryContext';
import { LoginRequest, LoginResponse, SessionInfoResponse } from '../../api/models/auth';
import { queryKeys } from './queryKeys';
import { useAuth } from '../../store/useAuthStore';
import { useCallback } from 'react';

interface CurrentUserOptions {
  enabled?: boolean;
  retry?: boolean | number;
  onError?: (error: Error) => void;
}

/**
 * 로그인 훅 - AuthProvider와 안전한 연동
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const authRepo = useAuthRepository();
  const { setUser } = useAuth();

  // 성공 콜백을 useCallback으로 메모이제이션
  const onSuccessCallback = useCallback(
    (response: LoginResponse) => {
      // React Error #185 방지를 위해 다음 틱에서 상태 업데이트
      console.log('response', response);
      setTimeout(() => {
        const { role, id, email, name } = response.data;
        const filteredUserResponse = { role, id, email, name };

        // 로그인 성공 시 AuthProvider 상태 업데이트
        setUser(filteredUserResponse);

        // React Query 캐시 업데이트
        queryClient.setQueryData([...queryKeys.user.id(), id], filteredUserResponse);
      }, 0);
    },
    [setUser, queryClient],
  );

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
    [authRepo.login],
  );

  return useMutation<LoginResponse, Error, { credentials: LoginRequest; idempotencyKey?: string }>({
    mutationFn,
    onSuccess: onSuccessCallback,
  });
}

/**
 * 로그아웃 훅
 */
export function useLogout() {
  const authRepo = useAuthRepository();
  const { logout } = useAuth();

  // mutationFn을 useCallback으로 메모이제이션
  const mutationFn = useCallback(async () => {
    return authRepo.logout();
  }, [authRepo.logout]);

  // 성공 콜백을 useCallback으로 메모이제이션
  const onSuccessCallback = useCallback(() => {
    // 쿠키지우는 코드 작성
    setTimeout(() => {
      // AuthProvider 상태 초기화
      logout();
      // 페이지 새로고침으로 서버에서 새 게스트 토큰 발급
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }, 0);
  }, [logout]);

  return useMutation<void, Error, void>({
    mutationFn,
    onSuccess: onSuccessCallback,
  });
}

export function useSessionInfo() {
  const queryClient = useQueryClient();
  const authRepo = useAuthRepository();
  const { setUser } = useAuth();

  // mutationFn을 useCallback으로 메모이제이션
  const mutationFn = useCallback(async () => {
    return authRepo.sessionInfo();
  }, [authRepo.sessionInfo]);

  // 성공 콜백을 useCallback으로 메모이제이션
  const onSuccessCallback = useCallback(
    (response: SessionInfoResponse) => {
      // 쿠키지우는 코드 작성
      setTimeout(() => {
        const { exp, iat, ...filteredUserResponse } = response.data;
        if (filteredUserResponse.role === 'user') {
          setUser(filteredUserResponse);
          queryClient.setQueryData(queryKeys.user.id(), filteredUserResponse);
        }
      }, 0);
    },
    [setUser, queryClient],
  );

  return useMutation<SessionInfoResponse, Error, void>({
    mutationFn,
    onSuccess: onSuccessCallback,
  });
}
