import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useUserRepository } from '../../context/RepositoryContext';
import { User } from '../../api/models/user';
import { RegisterRequest } from '../../api/models/auth';
import { queryKeys } from './queryKeys';

/**
 * 회원가입 훅
 */
export function useRegister() {
  const queryClient = useQueryClient();
  const userRepo = useUserRepository();

  const mutationFn = useCallback(
    ({ userData, idempotencyKey }: { userData: RegisterRequest; idempotencyKey: string }) => {
      return userRepo.register(userData, idempotencyKey);
    },
    [userRepo],
  );

  return useMutation<User, Error, { userData: RegisterRequest; idempotencyKey: string }>({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.user.session() }),
    onError: (error) => {
      console.error('Registration failed:', error);
    },
  });
}
