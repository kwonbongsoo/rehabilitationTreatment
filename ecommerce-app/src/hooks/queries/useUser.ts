import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useUserRepository } from '../../context/RepositoryContext';
import { User, UserUpdateRequest, Address } from '../../api/models/user';
import { RegisterRequest } from '../../api/models/auth';
import { queryKeys } from './queryKeys';

/**
 * 회원가입 훅 - 멱등성 키는 헤더로만 전송
 */
export function useRegister() {
  const queryClient = useQueryClient();
  const userRepo = useUserRepository();

  // mutationFn을 useCallback으로 메모이제이션
  const mutationFn = useCallback(
    ({ userData, idempotencyKey }: { userData: RegisterRequest; idempotencyKey: string }) => {
      return userRepo.register(userData, idempotencyKey);
    },
    [userRepo.register],
  );

  return useMutation<User, Error, { userData: RegisterRequest; idempotencyKey: string }>({
    mutationFn,
  });
}

/**
 * 현재 사용자 정보 조회 훅
 */
// export function useCurrentUser() {
//     const userRepo = useUserRepository();

//     return useQuery<User, Error>({
//         queryKey: queryKeys.user.me(),
//         queryFn: () => userRepo.getCurrentUser(),
//         staleTime: 300000, // 5분 캐싱
//         retry: false
//     });
// }
