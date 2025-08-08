/**
 * Auth Store Index 테스트
 * 모든 exports가 올바르게 노출되는지 확인
 */
import { useAuthStore, useAuth } from '../index';
import type { AuthState, AuthActions } from '../index';

describe('Auth Store Index', () => {
  it('useAuthStore가 올바르게 export된다', () => {
    expect(typeof useAuthStore).toBe('function');
    // Zustand creates a 'useBoundStore' function internally
    expect(useAuthStore.name).toBe('useBoundStore');
  });

  it('useAuth가 올바르게 export된다', () => {
    expect(typeof useAuth).toBe('function');
    expect(useAuth.name).toBe('useAuth');
  });

  it('AuthState 타입이 올바르게 export된다', () => {
    // TypeScript 타입은 런타임에 검증할 수 없지만,
    // 컴파일 시점에 타입이 올바른지 확인
    const mockAuthState: AuthState = {
      user: null,
      isGuest: true,
      isSessionInitialized: false,
      getUserRole: () => 'guest',
      isAdmin: () => false,
    };

    expect(mockAuthState.user).toBeNull();
    expect(mockAuthState.isGuest).toBe(true);
    expect(mockAuthState.isSessionInitialized).toBe(false);
    expect(mockAuthState.getUserRole()).toBe('guest');
    expect(mockAuthState.isAdmin()).toBe(false);
  });

  it('AuthActions 타입이 올바르게 export된다', () => {
    // TypeScript 타입은 런타임에 검증할 수 없지만,
    // 컴파일 시점에 타입이 올바른지 확인
    const mockAuthActions: AuthActions = {
      setUser: jest.fn(),
      logout: jest.fn(),
      clearSession: jest.fn(),
      setSessionInitialized: jest.fn(),
    };

    expect(typeof mockAuthActions.setUser).toBe('function');
    expect(typeof mockAuthActions.logout).toBe('function');
    expect(typeof mockAuthActions.clearSession).toBe('function');
    expect(typeof mockAuthActions.setSessionInitialized).toBe('function');
  });

  it('모든 필요한 exports가 존재한다', () => {
    const indexExports = require('../index');

    expect(indexExports).toHaveProperty('useAuthStore');
    expect(indexExports).toHaveProperty('useAuth');
    
    // 타입 exports는 런타임에 존재하지 않으므로 함수만 확인
    expect(typeof indexExports.useAuthStore).toBe('function');
    expect(typeof indexExports.useAuth).toBe('function');
  });
});