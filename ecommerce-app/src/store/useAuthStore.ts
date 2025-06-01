// zustand 기반 인증 상태 관리
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface User {
    id: string;
    email?: string;
    name?: string;
    role: 'guest' | 'user' | 'admin';
}

interface AuthState {
    // 상태
    user: User | null;
    isAuthenticated: boolean;
    isGuest: boolean;
    isLoading: boolean;

    // 액션
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;

    // 계산된 값들
    getUserRole: () => string;
    isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    devtools(
        persist(
            (set, get) => ({
                // 초기 상태
                user: null,
                isAuthenticated: false,
                isGuest: false,
                isLoading: false,

                // 액션들
                setUser: (user) => set((state) => {
                    const isAuthenticated = Boolean(user);
                    const isGuest = user?.role === 'guest';

                    return {
                        ...state,
                        user,
                        isAuthenticated,
                        isGuest
                    };
                }),

                setLoading: (loading) => set({ isLoading: loading }),

                logout: () => set({
                    user: null,
                    isAuthenticated: false,
                    isGuest: false,
                    isLoading: false
                }),

                // 계산된 값들
                getUserRole: () => {
                    const { user } = get();
                    return user?.role || 'guest';
                },

                isAdmin: () => {
                    const { user } = get();
                    return user?.role === 'admin';
                }
            }),
            {
                name: 'auth-store', // localStorage 키
                // 민감한 정보는 저장하지 않음 (토큰은 쿠키에만)
                partialize: (state) => ({
                    user: state.user,
                    isAuthenticated: state.isAuthenticated,
                    isGuest: state.isGuest
                })
            }
        ),
        {
            name: 'auth-store' // Redux DevTools 이름
        }
    )
);
