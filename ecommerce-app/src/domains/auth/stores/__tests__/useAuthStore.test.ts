/**
 * useAuthStore 테스트
 * Zustand 기반 인증 상태 관리 테스트
 */
import { renderHook, act } from '@testing-library/react';
import { useAuthStore, useAuth } from '../useAuthStore';
import type { UserResponse, UserRole } from '../../types/auth';

// Zustand 스토어를 초기 상태로 리셋하는 헬퍼 함수
const resetAuthStore = () => {
  act(() => {
    useAuthStore.getState().clearSession();
    useAuthStore.getState().setSessionInitialized(false);
  });
};

describe('useAuthStore', () => {
  beforeEach(() => {
    resetAuthStore();
  });

  describe('초기 상태', () => {
    it('초기 상태가 올바르게 설정된다', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.user).toBeNull();
      expect(result.current.isGuest).toBe(true);
      expect(result.current.isSessionInitialized).toBe(false);
      expect(result.current.getUserRole()).toBe('guest');
      expect(result.current.isAdmin()).toBe(false);
    });
  });

  describe('setUser 액션', () => {
    it('일반 사용자 정보를 설정한다', () => {
      const { result } = renderHook(() => useAuthStore());
      const userData: UserResponse = {
        role: 'user',
        id: 'testuser',
        email: 'test@example.com',
        name: '테스트 사용자',
      };

      act(() => {
        result.current.setUser(userData);
      });

      expect(result.current.user).toEqual(userData);
      expect(result.current.isGuest).toBe(false);
      expect(result.current.isSessionInitialized).toBe(true);
      expect(result.current.getUserRole()).toBe('user');
      expect(result.current.isAdmin()).toBe(false);
    });

    it('관리자 사용자 정보를 설정한다', () => {
      const { result } = renderHook(() => useAuthStore());
      const adminData: UserResponse = {
        role: 'admin',
        id: 'admin',
        email: 'admin@example.com',
        name: '관리자',
      };

      act(() => {
        result.current.setUser(adminData);
      });

      expect(result.current.user).toEqual(adminData);
      expect(result.current.isGuest).toBe(false);
      expect(result.current.isSessionInitialized).toBe(true);
      expect(result.current.getUserRole()).toBe('admin');
      expect(result.current.isAdmin()).toBe(true);
    });

    it('게스트 사용자 정보를 설정한다', () => {
      const { result } = renderHook(() => useAuthStore());
      const guestData: UserResponse = {
        role: 'guest',
      };

      act(() => {
        result.current.setUser(guestData);
      });

      expect(result.current.user).toEqual(guestData);
      expect(result.current.isGuest).toBe(true);
      expect(result.current.isSessionInitialized).toBe(true);
      expect(result.current.getUserRole()).toBe('guest');
      expect(result.current.isAdmin()).toBe(false);
    });

    it('사용자 정보를 null로 설정한다', () => {
      const { result } = renderHook(() => useAuthStore());

      // 먼저 사용자를 설정
      act(() => {
        result.current.setUser({
          role: 'user',
          id: 'test',
        });
      });

      // 그 다음 null로 설정
      act(() => {
        result.current.setUser(null);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isGuest).toBe(false); // null일 때는 role이 없으므로 isGuest는 false
      expect(result.current.isSessionInitialized).toBe(true);
      expect(result.current.getUserRole()).toBe('guest'); // getUserRole은 항상 기본값 'guest' 반환
      expect(result.current.isAdmin()).toBe(false);
    });
  });

  describe('logout 액션', () => {
    it('로그아웃 시 상태를 초기화한다', async () => {
      const { result } = renderHook(() => useAuthStore());
      
      // 먼저 사용자 로그인 상태 설정
      act(() => {
        result.current.setUser({
          role: 'user',
          id: 'testuser',
          email: 'test@example.com',
          name: '테스트 사용자',
        });
      });

      expect(result.current.user).not.toBeNull();
      expect(result.current.isGuest).toBe(false);

      // 로그아웃 실행
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isGuest).toBe(true);
      expect(result.current.isSessionInitialized).toBe(true); // 로그아웃도 초기화된 상태
      expect(result.current.getUserRole()).toBe('guest');
      expect(result.current.isAdmin()).toBe(false);
    });

    it('로그아웃 후에도 액션 함수들이 유지된다', async () => {
      const { result } = renderHook(() => useAuthStore());
      
      const initialSetUser = result.current.setUser;
      const initialLogout = result.current.logout;
      const initialClearSession = result.current.clearSession;

      // 사용자 로그인
      act(() => {
        result.current.setUser({ role: 'user', id: 'test' });
      });

      // 로그아웃
      await act(async () => {
        await result.current.logout();
      });

      // 액션 함수들이 여전히 존재하는지 확인
      expect(typeof result.current.setUser).toBe('function');
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.clearSession).toBe('function');
      expect(typeof result.current.setSessionInitialized).toBe('function');
    });
  });

  describe('clearSession 액션', () => {
    it('세션을 완전히 초기화한다', () => {
      const { result } = renderHook(() => useAuthStore());
      
      // 사용자 상태 설정
      act(() => {
        result.current.setUser({
          role: 'admin',
          id: 'admin',
          email: 'admin@example.com',
          name: '관리자',
        });
      });

      expect(result.current.user).not.toBeNull();
      expect(result.current.isAdmin()).toBe(true);

      // 세션 초기화
      act(() => {
        result.current.clearSession();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isGuest).toBe(true);
      expect(result.current.isSessionInitialized).toBe(true);
      expect(result.current.getUserRole()).toBe('guest');
      expect(result.current.isAdmin()).toBe(false);
    });
  });

  describe('setSessionInitialized 액션', () => {
    it('세션 초기화 상태를 변경한다', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.isSessionInitialized).toBe(false);

      act(() => {
        result.current.setSessionInitialized(true);
      });

      expect(result.current.isSessionInitialized).toBe(true);

      act(() => {
        result.current.setSessionInitialized(false);
      });

      expect(result.current.isSessionInitialized).toBe(false);
    });

    it('다른 상태에 영향을 주지 않는다', () => {
      const { result } = renderHook(() => useAuthStore());
      
      const userData: UserResponse = {
        role: 'user',
        id: 'test',
      };

      act(() => {
        result.current.setUser(userData);
      });

      const userBeforeSet = result.current.user;
      const isGuestBeforeSet = result.current.isGuest;

      act(() => {
        result.current.setSessionInitialized(false);
      });

      expect(result.current.user).toBe(userBeforeSet);
      expect(result.current.isGuest).toBe(isGuestBeforeSet);
      expect(result.current.isSessionInitialized).toBe(false);
    });
  });

  describe('getUserRole 계산된 값', () => {
    it('사용자 역할을 올바르게 반환한다', () => {
      const { result } = renderHook(() => useAuthStore());
      
      const roles: UserRole[] = ['guest', 'user', 'admin'];

      roles.forEach((role) => {
        act(() => {
          result.current.setUser({ role });
        });

        expect(result.current.getUserRole()).toBe(role);
      });
    });

    it('사용자가 없을 때 guest를 반환한다', () => {
      const { result } = renderHook(() => useAuthStore());
      
      act(() => {
        result.current.setUser(null);
      });

      expect(result.current.getUserRole()).toBe('guest');
    });

    it('사용자 정보가 없을 때도 guest를 반환한다', () => {
      const { result } = renderHook(() => useAuthStore());
      
      // 초기 상태에서도 guest 반환
      expect(result.current.getUserRole()).toBe('guest');
    });
  });

  describe('isAdmin 계산된 값', () => {
    it('관리자일 때 true를 반환한다', () => {
      const { result } = renderHook(() => useAuthStore());
      
      act(() => {
        result.current.setUser({
          role: 'admin',
          id: 'admin',
        });
      });

      expect(result.current.isAdmin()).toBe(true);
    });

    it('일반 사용자일 때 false를 반환한다', () => {
      const { result } = renderHook(() => useAuthStore());
      
      act(() => {
        result.current.setUser({
          role: 'user',
          id: 'user',
        });
      });

      expect(result.current.isAdmin()).toBe(false);
    });

    it('게스트일 때 false를 반환한다', () => {
      const { result } = renderHook(() => useAuthStore());
      
      act(() => {
        result.current.setUser({
          role: 'guest',
        });
      });

      expect(result.current.isAdmin()).toBe(false);
    });

    it('사용자가 없을 때 false를 반환한다', () => {
      const { result } = renderHook(() => useAuthStore());
      
      act(() => {
        result.current.setUser(null);
      });

      expect(result.current.isAdmin()).toBe(false);
    });
  });

  describe('상태 변화 추적', () => {
    it('여러 상태 변경이 올바르게 반영된다', () => {
      const { result } = renderHook(() => useAuthStore());
      
      // 초기 상태 확인
      expect(result.current.user).toBeNull();
      expect(result.current.isGuest).toBe(true);
      expect(result.current.isSessionInitialized).toBe(false);

      // 사용자 설정
      act(() => {
        result.current.setUser({
          role: 'user',
          id: 'user1',
          name: '사용자1',
        });
      });

      expect(result.current.user?.name).toBe('사용자1');
      expect(result.current.isGuest).toBe(false);
      expect(result.current.isSessionInitialized).toBe(true);

      // 다른 사용자로 변경
      act(() => {
        result.current.setUser({
          role: 'admin',
          id: 'admin',
          name: '관리자',
        });
      });

      expect(result.current.user?.name).toBe('관리자');
      expect(result.current.getUserRole()).toBe('admin');
      expect(result.current.isAdmin()).toBe(true);

      // 로그아웃
      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isGuest).toBe(true);
      expect(result.current.isSessionInitialized).toBe(true);
      expect(result.current.getUserRole()).toBe('guest');
      expect(result.current.isAdmin()).toBe(false);
    });
  });
});

describe('useAuth 호환성 훅', () => {
  beforeEach(() => {
    resetAuthStore();
  });

  it('useAuthStore와 동일한 인터페이스를 제공한다', () => {
    const { result: storeResult } = renderHook(() => useAuthStore());
    const { result: authResult } = renderHook(() => useAuth());

    // 상태 비교
    expect(authResult.current.user).toBe(storeResult.current.user);
    expect(authResult.current.isGuest).toBe(storeResult.current.isGuest);
    expect(authResult.current.isSessionInitialized).toBe(storeResult.current.isSessionInitialized);

    // 함수 존재 확인
    expect(typeof authResult.current.setUser).toBe('function');
    expect(typeof authResult.current.logout).toBe('function');
    expect(typeof authResult.current.clearSession).toBe('function');
    expect(typeof authResult.current.setSessionInitialized).toBe('function');
    expect(typeof authResult.current.getUserRole).toBe('function');
    expect(typeof authResult.current.isAdmin).toBe('function');
  });

  it('useAuth 훅을 통해 상태 변경이 올바르게 작동한다', () => {
    const { result } = renderHook(() => useAuth());

    const userData: UserResponse = {
      role: 'user',
      id: 'testuser',
      email: 'test@example.com',
      name: '테스트 사용자',
    };

    act(() => {
      result.current.setUser(userData);
    });

    expect(result.current.user).toEqual(userData);
    expect(result.current.isGuest).toBe(false);
    expect(result.current.getUserRole()).toBe('user');
    expect(result.current.isAdmin()).toBe(false);
  });

  it('useAuth와 useAuthStore가 동일한 상태를 공유한다', () => {
    const { result: authResult } = renderHook(() => useAuth());
    const { result: storeResult } = renderHook(() => useAuthStore());

    const userData: UserResponse = {
      role: 'admin',
      id: 'admin',
    };

    // useAuth를 통해 상태 변경
    act(() => {
      authResult.current.setUser(userData);
    });

    // 두 훅 모두 동일한 상태를 반영
    expect(authResult.current.user).toEqual(userData);
    expect(storeResult.current.user).toEqual(userData);
    expect(authResult.current.isAdmin()).toBe(true);
    expect(storeResult.current.isAdmin()).toBe(true);

    // useAuthStore를 통해 로그아웃
    act(() => {
      storeResult.current.logout();
    });

    // 두 훅 모두 로그아웃 상태 반영
    expect(authResult.current.user).toBeNull();
    expect(storeResult.current.user).toBeNull();
    expect(authResult.current.isGuest).toBe(true);
    expect(storeResult.current.isGuest).toBe(true);
  });
});