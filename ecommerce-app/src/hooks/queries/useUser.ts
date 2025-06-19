import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { apiService } from '../../api/apiClient';
import { User } from '../../api/models/user';
import { RegisterRequest } from '../../api/models/auth';
import { queryKeys } from './queryKeys';

/**
 * 회원가입 훅 - 새로운 APIClient 사용
 */
export function useRegister() {
  const queryClient = useQueryClient();

  const mutationFn = useCallback(
    ({ userData, idempotencyKey }: { userData: RegisterRequest; idempotencyKey: string }) => {
      return apiService.register(userData, idempotencyKey);
    },
    [],
  );

  // onSuccess 콜백을 useCallback으로 메모이제이션
  const onSuccessCallback = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.user.session() });
  }, [queryClient]);

  // onError 콜백을 useCallback으로 메모이제이션
  const onErrorCallback = useCallback((error: Error) => {
    console.error('Registration failed:', error);
  }, []);

  return useMutation<User, Error, { userData: RegisterRequest; idempotencyKey: string }>({
    mutationFn,
    onSuccess: onSuccessCallback,
    onError: onErrorCallback,
  });
}
