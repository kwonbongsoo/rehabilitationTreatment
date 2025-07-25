import { create } from 'zustand';
import { UserResponse, UserRole } from '../types/user';

interface UserState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isGuest: boolean;

  // Actions
  setUser: (user: UserResponse | null) => void;
  logout: () => void;
  clearSession: () => void;

  // Selectors
  getUserRole: () => UserRole;
  isAdmin: () => boolean;
}

export const useUserStore = create<UserState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isGuest: true,

  setUser: (user) => {
    const isAuthenticated = Boolean(user);
    const isGuest = !isAuthenticated || user?.role === 'guest';

    set({
      user,
      isAuthenticated,
      isGuest,
    });
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      isGuest: true,
    });
  },

  clearSession: () => {
    get().logout();
  },

  getUserRole: () => {
    const { user } = get();
    return user?.role || 'guest';
  },

  isAdmin: () => {
    const { user } = get();
    return user?.role === 'admin';
  },
}));
