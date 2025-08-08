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
  isGuest: boolean;

  // 세션 초기화 상태
  isSessionInitialized: boolean;

  // 계산된 값들 (getter 함수)
  getUserRole: () => UserRole;
  isAdmin: () => boolean;
}

export interface AuthActions {
  // 액션
  setUser: (user: UserResponse | null) => void;
  logout: () => Promise<void>;
  clearSession: () => void; // 세션 완전 초기화

  // 세션 초기화 상태 관리
  setSessionInitialized: (initialized: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

// 초기 상태 정의 (재사용을 위해 별도 객체로)
const initialState: Pick<AuthState, 'user' | 'isGuest' | 'isSessionInitialized'> = {
  user: null,
  isGuest: true,
  isSessionInitialized: false,
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      ...initialState,

      // 액션들
      setUser: (user) => {
        set((state) => {
          const isGuest = user?.role === 'guest';

          return {
            ...state,
            user,
            isGuest,
            isSessionInitialized: true, // 사용자 정보가 설정되면 세션 초기화 완료
          };
        });
      },

      logout: async () => {
        // 🔄 완전한 세션 초기화
        await set(() => ({
          ...initialState,
          isSessionInitialized: true, // 로그아웃도 초기화된 상태로 간주
          getUserRole: get().getUserRole,
          isAdmin: get().isAdmin,
          setUser: get().setUser,
          logout: get().logout,
          clearSession: get().clearSession,
          setSessionInitialized: get().setSessionInitialized,
        }));
      },

      // 세션 완전 초기화 (긴급 상황용)
      clearSession: () => {
        get().logout();
      },

      // 세션 초기화 상태 관리
      setSessionInitialized: (initialized) => {
        set((state) => ({
          ...state,
          isSessionInitialized: initialized,
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
export const useAuth = (): AuthState & AuthActions => {
  const {
    user,
    isGuest,
    isSessionInitialized,
    setUser,
    logout,
    clearSession,
    setSessionInitialized,
    getUserRole,
    isAdmin,
  } = useAuthStore();

  return {
    // 상태
    user,
    isGuest,
    isSessionInitialized,

    // 액션
    setUser,
    logout,
    clearSession,
    setSessionInitialized,

    // 헬퍼
    getUserRole,
    isAdmin,
  };
};
