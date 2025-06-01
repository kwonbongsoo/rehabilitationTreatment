import { ApiClient } from '../client';
import { User, UserUpdateRequest, Address } from '../models/user';
import { RegisterRequest } from '../models/auth';

export const createUserRepository = (apiClient: ApiClient) => ({
    /**
     * 회원가입 (member 서버 사용)
     */
    register: async (userData: RegisterRequest): Promise<User> => {
        const response = await apiClient.post<{ success: boolean; member: User; message?: string }>('/members', {
            id: userData.id,
            password: userData.password,
            name: userData.name,
            email: userData.email
        });
        return response.member;
    },
    /**
     * 현재 사용자 정보 조회
     */
    getCurrentUser: async (): Promise<User> => {
        return apiClient.get<User>('/users/me');
    },

    /**
     * 사용자 정보 업데이트
     */
    updateUserProfile: async (data: UserUpdateRequest): Promise<User> => {
        return apiClient.put<User>('/users/me', data);
    },

    /**
     * 사용자 주소 목록 조회
     */
    getUserAddresses: async (): Promise<Address[]> => {
        return apiClient.get<Address[]>('/users/me/addresses');
    },

    /**
     * 사용자 주소 추가
     */
    addAddress: async (address: Omit<Address, 'id'>): Promise<Address> => {
        return apiClient.post<Address>('/users/me/addresses', address);
    },

    /**
     * 사용자 주소 업데이트
     */
    updateAddress: async (id: string, address: Omit<Address, 'id'>): Promise<Address> => {
        return apiClient.put<Address>(`/users/me/addresses/${id}`, address);
    },

    /**
     * 사용자 주소 삭제
     */
    deleteAddress: async (id: string): Promise<void> => {
        return apiClient.delete<void>(`/users/me/addresses/${id}`);
    }
})