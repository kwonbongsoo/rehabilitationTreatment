import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { createApiClient, ApiClient } from '../api/client';
import { createAuthRepository } from '../api/repository/authRepository';
import { createUserRepository } from '../api/repository/userRepository';

// 각 레포지토리 타입 정의
export interface Repositories {
    auth: ReturnType<typeof createAuthRepository>;
    user: ReturnType<typeof createUserRepository>;
}

// 컨텍스트 생성 - 이름 변경: ApiContext → RepositoryContext
const RepositoryContext = createContext<Repositories | null>(null);

// 컨텍스트 제공자 컴포넌트
interface ApiProviderProps {
    children: ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
    // 요청마다 새 apiClient 인스턴스 생성
    const apiClient = useMemo<ApiClient>(() => createApiClient(), []);

    // 각 레포지토리 인스턴스 생성
    const repositories = useMemo<Repositories>(() => ({
        auth: createAuthRepository(apiClient),
        user: createUserRepository(apiClient),
    }), [apiClient]);

    return (
        <RepositoryContext.Provider value={repositories} >
            {children}
        </RepositoryContext.Provider>
    );
}


// 레포지토리 접근을 위한 훅
export function useRepositories(): Repositories {
    const context = useContext(RepositoryContext);

    if (!context) {
        throw new Error('useRepositories must be used within an ApiProvider');
    }

    return context;
}

// 특정 리포지토리만 가져오는 편의 훅들
export function useAuthRepository() {
    return useRepositories().auth;
}

export function useUserRepository() {
    return useRepositories().user;
}