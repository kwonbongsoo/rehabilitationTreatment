import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserRepository } from '../../context/RepositoryContext';
import { User, UserUpdateRequest, Address } from '../../api/models/user';
import { RegisterRequest } from '../../api/models/auth';
import { queryKeys } from './queryKeys';

/**
 * 회원가입 훅 - 멱등성 키 지원
 */
export function useRegister() {
    const queryClient = useQueryClient();
    const userRepo = useUserRepository();

    return useMutation<User, Error, RegisterRequest & { _idempotencyKey?: string }>({
        mutationFn: ({ _idempotencyKey, ...userData }: RegisterRequest & { _idempotencyKey?: string }) => {
            return userRepo.register(userData, _idempotencyKey);
        },
        onSuccess: (user) => {
            // 회원가입 성공 후 사용자 정보 캐시
            queryClient.setQueryData(queryKeys.user.me(), user);
        }
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
