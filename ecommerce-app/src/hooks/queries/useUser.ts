import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserRepository } from '../../context/RepositoryContext';
import { User, UserUpdateRequest, Address } from '../../api/models/user';
import { RegisterRequest } from '../../api/models/auth';
import { queryKeys } from './queryKeys';

/**
 * 회원가입 훅
 */
export function useRegister() {
    const queryClient = useQueryClient();
    const userRepo = useUserRepository();

    return useMutation<User, Error, RegisterRequest>({
        mutationFn: (userData: RegisterRequest) => userRepo.register(userData),
        onSuccess: (user) => {
            // 회원가입 성공 후 사용자 정보 캐시
            queryClient.setQueryData(queryKeys.user.me(), user);
        }
    });
}

/**
 * 현재 사용자 정보 조회 훅
 */
export function useCurrentUser() {
    const userRepo = useUserRepository();

    return useQuery<User, Error>({
        queryKey: queryKeys.user.me(),
        queryFn: () => userRepo.getCurrentUser(),
        staleTime: 300000, // 5분 캐싱
        retry: false
    });
}

/**
 * 사용자 프로필 업데이트 훅
 */
export function useUpdateUserProfile() {
    const queryClient = useQueryClient();
    const userRepo = useUserRepository();

    return useMutation<User, Error, UserUpdateRequest>({
        mutationFn: (data: UserUpdateRequest) => userRepo.updateUserProfile(data),
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(queryKeys.user.me(), updatedUser);
        }
    });
}

/**
 * 사용자 주소 목록 조회 훅
 */
export function useUserAddresses() {
    const userRepo = useUserRepository();

    return useQuery<Address[], Error>({
        queryKey: queryKeys.user.addresses(),
        queryFn: () => userRepo.getUserAddresses(),
        staleTime: 300000
    });
}

/**
 * 주소 추가 훅
 */
export function useAddAddress() {
    const queryClient = useQueryClient();
    const userRepo = useUserRepository();

    return useMutation<Address, Error, Omit<Address, 'id'>>({
        mutationFn: (address) => userRepo.addAddress(address),
        onSuccess: () => {
            // 주소 목록 무효화하여 재조회
            queryClient.invalidateQueries({ queryKey: queryKeys.user.addresses() });
        }
    });
}

/**
 * 주소 업데이트 훅
 */
export function useUpdateAddress() {
    const queryClient = useQueryClient();
    const userRepo = useUserRepository();

    return useMutation<Address, Error, { id: string; address: Omit<Address, 'id'> }>({
        mutationFn: ({ id, address }) => userRepo.updateAddress(id, address),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.user.addresses() });
        }
    });
}

/**
 * 주소 삭제 훅
 */
export function useDeleteAddress() {
    const queryClient = useQueryClient();
    const userRepo = useUserRepository();

    return useMutation<void, Error, string>({
        mutationFn: (id: string) => userRepo.deleteAddress(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.user.addresses() });
        }
    });
}
