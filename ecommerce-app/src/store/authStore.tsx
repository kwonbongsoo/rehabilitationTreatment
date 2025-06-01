import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UserResponse } from '../api/models/auth';
import { useCurrentUser } from '../hooks/queries/useAuth';
import { cookieService } from '../services/cookieService';

// 명확한 타입 정의
interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  user: UserResponse | null;
  isLoading: boolean;
  setToken: (token: string) => void;
  logout: () => Promise<void>;
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
  const [token, setTokenState] = useState<string | null>(cookieService.getToken());

  // 사용자 정보 쿼리 - 401 에러 시 페이지 새로고침
  const {
    data: user,
    isLoading
  } = useCurrentUser({
    enabled: Boolean(token),
    retry: false,
    onError: () => {
      // Nginx에서 401 에러 시 페이지 새로고침으로 새 게스트 토큰 발급
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  });

  // 파생 상태 - 간결하고 명확한 계산
  const isAuthenticated = checkAuthenticated(token, user as UserResponse | null);
  const isGuest = isUserGuest(user as UserResponse | null);

  // 토큰 설정 - SSR에서만 사용 (쿠키는 이미 설정됨)
  function handleSetToken(newToken: string): void {
    setTokenState(newToken);
  }

  // 로그아웃 - 명확한 함수명 사용
  async function handleLogout(): Promise<void> {
    await cookieService.clearToken();
    setTokenState(null);
    queryClient.removeQueries({ queryKey: ['user'] });
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
    logout: handleLogout
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