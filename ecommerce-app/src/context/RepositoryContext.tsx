// Repository Context 간단화 - token props 제거
import { createContext, useContext, ReactNode, useMemo } from 'react';
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
}

export function ApiProvider({ children }: ApiProviderProps) {
  const repositories = useMemo(() => {
    const apiClient: ApiClient = createApiClient();
    return {
      auth: createAuthRepository(apiClient),
      user: createUserRepository(apiClient),
    } satisfies Repositories;
  }, []);

  return <RepositoryContext.Provider value={repositories}>{children}</RepositoryContext.Provider>;
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
