import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthRepository } from '../../context/RepositoryContext';
import { LoginRequest } from '../../api/models/auth';

export function useCurrentUser(options = {}) {
    const authRepo = useAuthRepository();

    return useQuery({
        queryKey: ['user', 'me'],
        queryFn: () => authRepo.getUserInfo(),
        ...options,
    });
}

export function useLogin() {
    const queryClient = useQueryClient();
    const authRepo = useAuthRepository();

    return useMutation({
        mutationFn: (credentials: LoginRequest) => authRepo.login(credentials),
        onSuccess: (data) => {
            // 캐시 업데이트
            queryClient.setQueryData(['user', 'me'], data.user);
        }
    });
}

export function useLogout() {
    const queryClient = useQueryClient();
    const authRepo = useAuthRepository();

    return useMutation({
        mutationFn: () => authRepo.logout(),
        onSuccess: () => {
            // 캐시 삭제
            queryClient.removeQueries({ queryKey: ['user', 'me'] });
        }
    });
}