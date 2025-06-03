import { createContext, useContext, ReactNode, useState, useCallback, useMemo } from 'react';
import { UserResponse } from '../api/models/auth';
import { cookieService } from '../services/cookieService';

// 명확한 타입 정의
interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  user: UserResponse | null;
  isLoading: boolean;
  setUser: (user: UserResponse | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // 안전한 상태 관리 - React Error #185 방지
  const [user, setUserState] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 토큰 상태는 쿠키에서 읽기 (SSR 안전)
  const [token] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return cookieService.getToken();
    }
    return null;
  });


  // 안전한 사용자 설정 함수
  const setUser = useCallback((newUser: UserResponse | null) => {
    setUserState(newUser);
  }, []);

  // 로그아웃 함수
  const logout = useCallback(async () => {
    setUserState(null);
    // 쿠키 삭제는 서버에서 처리됨
  }, []);

  // 계산된 값들을 useMemo로 최적화
  const contextValue = useMemo((): AuthContextValue => {
    const isAuthenticated = Boolean(user && token);
    const isGuest = !isAuthenticated || user?.role === 'guest';

    return {
      token,
      user,
      isAuthenticated,
      isGuest,
      isLoading,
      setUser,
      logout
    };
  }, [token, user, isLoading, setUser, logout]);

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