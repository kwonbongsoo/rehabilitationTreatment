/**
 * Zustand 기반 인증 상태 관리
 *
 * React Context 패턴 대신 Zustand를 사용하여 더 간단하고 효율적인 상태 관리 제공
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { UserResponse, UserRole } from '../api/models/auth';

interface AuthState {
  // 상태
  user: UserResponse | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;

  // 액션
  setUser: (user: UserResponse | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;

  // 계산된 값들 (getter 함수)
  getUserRole: () => UserRole;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      user: null,
      isAuthenticated: false,
      isGuest: true,
      isLoading: false,

      // 액션들
      setUser: (user) => {
        set((state) => {
          const isAuthenticated = Boolean(user);
          const isGuest = !isAuthenticated || user?.role === 'guest';

          return {
            ...state,
            user,
            isAuthenticated,
            isGuest,
          };
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      logout: async () => {
        set({
          user: null,
          isAuthenticated: false,
          isGuest: true,
          isLoading: false,
        });
        // 쿠키 삭제는 서버에서 처리됨
      },

      // 계산된 값들 (getter 함수)
      getUserRole: () => {
        const { user } = get();
        return user?.role || 'guest';
      },

      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },
    }),
    {
      name: 'auth-store', // Redux DevTools 이름
    },
  ),
);

// React Context 패턴과 호환되는 훅 (기존 코드 호환성)
export const useAuth = () => {
  const { user, isAuthenticated, isGuest, isLoading, setUser, logout } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isGuest,
    isLoading,
    setUser,
    logout,
  };
};
