import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UserResponse } from '../api/models/auth';
import { useAuthRepository } from '../context/RepositoryContext';
import { useCurrentUser, useRefreshToken, tokenUtils } from '../hooks/queries/useAuth';

// 명확한 타입 정의
interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  user: UserResponse | null;
  isLoading: boolean;
  setToken: (token: string) => void;
  logout: () => void;
  refreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

// 유틸리티 함수 분리 - 컴포넌트 외부로 이동
const isUserGuest = (user: UserResponse | null): boolean => {
  return Boolean(user?.role === 'guest');
};

// 인증 상태 확인 - 명확한 함수로 분리
const checkAuthenticated = (token: string | null, user: UserResponse | null): boolean => {
  return Boolean(token && user);
};

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState<string | null>(tokenUtils.getToken());

  // 사용자 정보 쿼리
  const {
    data: user,
    isLoading
  } = useCurrentUser({
    enabled: Boolean(token),
    retry: false,
    onError: () => token && handleLogout()
  });

  // 토큰 갱신 뮤테이션
  const refreshTokenMutation = useRefreshToken({
    onError: () => handleLogout()
  });

  // 파생 상태 - 간결하고 명확한 계산
  const isAuthenticated = checkAuthenticated(token, user as UserResponse | null);
  const isGuest = isUserGuest(user as UserResponse | null);

  // 토큰 설정 - 명확한 함수명 사용
  function handleSetToken(newToken: string): void {
    tokenUtils.setToken(newToken);
    setTokenState(newToken);
  }

  // 로그아웃 - 명확한 함수명 사용
  function handleLogout(): void {
    tokenUtils.clearToken();
    setTokenState(null);
    queryClient.removeQueries({ queryKey: ['user'] });
  }

  // 토큰 갱신 - 에러 처리 개선
  async function handleRefreshToken(): Promise<string | null> {
    try {
      const result = await refreshTokenMutation.mutateAsync();
      return result.token;
    } catch (error) {
      handleLogout();
      return null;
    }
  }

  // useEffect의 목적을 주석으로 명확히
  useEffect(() => {
    // 토큰이 있을 때만 사용자 정보 다시 가져오기
    if (token) {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    }
  }, [token, queryClient]);

  // Context value 객체 미리 생성 - 불필요한 렌더링 방지
  const contextValue: AuthContextValue = {
    token,
    user: user as UserResponse | null,
    isAuthenticated,
    isGuest,
    isLoading,
    setToken: handleSetToken,
    logout: handleLogout,
    refreshToken: handleRefreshToken
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}