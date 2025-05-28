import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { createApiClient, ApiClient } from '../api/client';
import { createAuthRepository } from '../api/repository/authRepository';
import { createUserRepository } from '../api/repository/userRepository';

// 각 레포지토리 타입 정의
export interface Repositories {
    auth: ReturnType<typeof createAuthRepository>;
    user: ReturnType<typeof createUserRepository>;
}

// 컨텍스트 생성
const RepositoryContext = createContext<Repositories | null>(null);

interface ApiProviderProps {
    children: ReactNode;
    initialApiClient?: ApiClient; // SSR에서 생성된 API 클라이언트
}

export function ApiProvider({ children, initialApiClient }: ApiProviderProps) {
    // 요청마다 새 apiClient 인스턴스 또는 초기 인스턴스 사용
    const apiClient = useMemo<ApiClient>(
        () => initialApiClient || createApiClient(),
        [initialApiClient]
    );

    // 레포지토리 생성
    const repositories = useMemo<Repositories>(
        () => ({
            auth: createAuthRepository(apiClient),
            user: createUserRepository(apiClient),
        }),
        [apiClient]
    );

    return (
        <RepositoryContext.Provider value={repositories}>
            {children}
        </RepositoryContext.Provider>
    );
}

export function useRepositories(): Repositories {
    const context = useContext(RepositoryContext);

    if (!context) {
        throw new Error('useRepositories must be used within an ApiProvider');
    }

    return context;
}

export function useAuthRepository() {
    return useRepositories().auth;
}

export function useUserRepository() {
    return useRepositories().user;
}