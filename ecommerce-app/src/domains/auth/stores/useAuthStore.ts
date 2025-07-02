/**
 * Zustand 기반 인증 상태 관리
 *
 * React Context 패턴 대신 Zustand를 사용하여 더 간단하고 효율적인 상태 관리 제공
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { UserResponse, UserRole } from '../types/auth';

export interface AuthState {
  // 상태 (순수한 인증 상태만)
  user: UserResponse | null;
  isAuthenticated: boolean;
  isGuest: boolean;

  // 계산된 값들 (getter 함수)
  getUserRole: () => UserRole;
  isAdmin: () => boolean;
}

export interface AuthActions {
  // 액션
  setUser: (user: UserResponse | null) => void;
  logout: () => Promise<void>;
  clearSession: () => void; // 세션 완전 초기화
}

type AuthStore = AuthState & AuthActions;

// 초기 상태 정의 (재사용을 위해 별도 객체로)
const initialState: Pick<AuthState, 'user' | 'isAuthenticated' | 'isGuest'> = {
  user: null,
  isAuthenticated: false,
  isGuest: true,
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      ...initialState,

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

      logout: async () => {
        // 🔄 완전한 세션 초기화
        set(() => ({
          ...initialState,
          getUserRole: get().getUserRole,
          isAdmin: get().isAdmin,
          setUser: get().setUser,
          logout: get().logout,
          clearSession: get().clearSession,
        }));
      },

      // 세션 완전 초기화 (긴급 상황용)
      clearSession: () => {
        set(() => ({
          ...initialState,
          getUserRole: get().getUserRole,
          isAdmin: get().isAdmin,
          setUser: get().setUser,
          logout: get().logout,
          clearSession: get().clearSession,
        }));
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
  const { user, isAuthenticated, isGuest, setUser, logout, clearSession, getUserRole, isAdmin } =
    useAuthStore();

  return {
    // 상태
    user,
    isAuthenticated,
    isGuest,

    // 액션
    setUser,
    logout,
    clearSession,

    // 헬퍼
    getUserRole,
    isAdmin,
  };
};
