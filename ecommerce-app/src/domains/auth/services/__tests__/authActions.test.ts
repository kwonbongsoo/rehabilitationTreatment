/**
 * authActions 서버 액션 테스트
 */
import { login, logout, register, forgotPassword } from '../authActions';
import { cookies } from 'next/headers';
import { HeaderBuilderFactory } from '@/lib/server/headerBuilder';
import type { LoginRequest, RegisterRequest, ForgotPasswordRequest } from '../../types/auth';

// Mock dependencies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('@/lib/server/headerBuilder');
jest.mock('@/lib/server/serverActionErrorHandler');

// Global fetch mock
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock environment variables
const originalEnv = process.env;
beforeAll(() => {
  process.env = {
    ...originalEnv,
    AUTH_SERVICE_URL: 'http://koa-auth-server:4000',
    KONG_GATEWAY_URL: 'http://kong:8000',
    NODE_ENV: 'test',
  };
});

afterAll(() => {
  process.env = originalEnv;
});

describe('authActions', () => {
  let mockCookieStore: any;
  let mockHeaderBuilder: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock cookie store
    mockCookieStore = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    };
    (cookies as jest.Mock).mockResolvedValue(mockCookieStore);

    // Mock header builder
    mockHeaderBuilder = {
      withPreviousToken: jest.fn().mockReturnThis(),
      build: jest.fn().mockResolvedValue({
        'Content-Type': 'application/json',
      }),
    };
    (HeaderBuilderFactory.createForBasicAuth as jest.Mock).mockReturnValue(mockHeaderBuilder);
    (HeaderBuilderFactory.createForApiRequest as jest.Mock).mockReturnValue(mockHeaderBuilder);
    (HeaderBuilderFactory.createForIdempotentRequest as jest.Mock).mockReturnValue(
      mockHeaderBuilder,
    );

    // Mock serverActionErrorHandler
    const {
      handleApiResponseForServerAction,
      safeServerAction,
    } = require('@/lib/server/serverActionErrorHandler');
    safeServerAction.mockImplementation(async (fn: any) => {
      try {
        const result = await fn();
        return result;
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : '알 수 없는 오류',
        };
      }
    });
    handleApiResponseForServerAction.mockImplementation(async (response: any) => {
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      }
      return { success: false, error: `HTTP ${response.status}` };
    });
  });

  describe('login', () => {
    const validCredentials: LoginRequest = {
      id: 'testuser',
      password: 'password123',
    };

    it('성공적인 로그인 시 토큰을 쿠키에 저장하고 사용자 정보를 반환한다', async () => {
      const mockLoginResponse = {
        data: {
          access_token: 'test-access-token',
          role: 'user',
          id: 'testuser',
          name: '테스트 사용자',
          email: 'test@example.com',
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000),
        },
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockLoginResponse),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);
      mockCookieStore.get.mockReturnValue(null);

      const result = await login(validCredentials);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        role: 'user',
        id: 'testuser',
        email: 'test@example.com',
        name: '테스트 사용자',
        exp: expect.any(Number),
        iat: expect.any(Number),
      });

      // 쿠키 설정 확인
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'access_token',
        'test-access-token',
        expect.objectContaining({
          httpOnly: true,
          secure: false, // test 환경
          sameSite: 'lax',
          path: '/',
        }),
      );

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'access_type',
        'user',
        expect.objectContaining({
          httpOnly: false,
          secure: false,
          sameSite: 'lax',
          path: '/',
        }),
      );

      // API 호출 확인
      expect(mockFetch).toHaveBeenCalledWith(
        'http://koa-auth-server:4000/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(validCredentials),
        }),
      );
    });

    it('아이디가 없으면 검증 에러를 반환한다', async () => {
      const invalidCredentials = { id: '', password: 'password123' };

      const result = await login(invalidCredentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('아이디와 비밀번호를 입력해주세요.');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('비밀번호가 없으면 검증 에러를 반환한다', async () => {
      const invalidCredentials = { id: 'testuser', password: '' };

      const result = await login(invalidCredentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('아이디와 비밀번호를 입력해주세요.');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('API 응답이 실패하면 에러를 반환한다', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);
      mockCookieStore.get.mockReturnValue(null);

      const { handleApiResponseForServerAction } = require('@/lib/server/serverActionErrorHandler');
      handleApiResponseForServerAction.mockResolvedValue({
        success: false,
        error: '인증에 실패했습니다.',
      });

      const result = await login(validCredentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('인증에 실패했습니다.');
    });

    it('유효하지 않은 응답 구조에 대해 인증 에러를 반환한다', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ invalid: 'response' }),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);
      mockCookieStore.get.mockReturnValue(null);

      const result = await login(validCredentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('유효하지 않은 로그인 응답입니다.');
    });

    it('기존 토큰이 있으면 헤더에 포함한다', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'existing-token' });

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: {
            access_token: 'new-token',
            role: 'user',
            id: 'testuser',
            name: '테스트 사용자',
            email: 'test@example.com',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
          },
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await login(validCredentials);

      expect(mockHeaderBuilder.withPreviousToken).toHaveBeenCalledWith('existing-token');
    });
  });

  describe('logout', () => {
    it('성공적인 로그아웃 시 쿠키를 삭제한다', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      const result = await logout();

      expect(result.success).toBe(true);
      expect(mockCookieStore.delete).toHaveBeenCalledWith('access_token');
      expect(mockCookieStore.delete).toHaveBeenCalledWith('access_type');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://koa-auth-server:4000/api/auth/logout',
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });

    it('API 실패 시에도 쿠키를 삭제한다', async (): Promise<void> => {
      const mockResponse = {
        ok: false,
        status: 500,
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      const { handleApiResponseForServerAction } = require('@/lib/server/serverActionErrorHandler');
      handleApiResponseForServerAction.mockResolvedValue({
        success: false,
        error: '서버 오류',
      });

      await logout();

      expect(mockCookieStore.delete).toHaveBeenCalledWith('access_token');
      expect(mockCookieStore.delete).toHaveBeenCalledWith('access_type');
    });

    it('401 에러는 정상적으로 처리한다', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({ message: 'Unauthorized' }),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      const result = await logout();

      expect(result.success).toBe(true);
      expect(mockCookieStore.delete).toHaveBeenCalledWith('access_token');
      expect(mockCookieStore.delete).toHaveBeenCalledWith('access_type');
    });

    it('네트워크 에러 시에도 쿠키를 삭제한다', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await logout();

      expect(mockCookieStore.delete).toHaveBeenCalledWith('access_token');
      expect(mockCookieStore.delete).toHaveBeenCalledWith('access_type');
      expect(result.success).toBe(false);
    });
  });

  describe('register', () => {
    const validUserData: RegisterRequest = {
      id: 'testuser',
      password: 'password123',
      confirmPassword: 'password123',
      name: '테스트 사용자',
      email: 'test@example.com',
    };
    const idempotencyKey = 'test-idempotency-key';

    it('성공적인 회원가입을 처리한다', async () => {
      const mockRegisterResponse = {
        success: true,
        message: '회원가입이 완료되었습니다.',
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockRegisterResponse),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      const { handleApiResponseForServerAction } = require('@/lib/server/serverActionErrorHandler');
      handleApiResponseForServerAction.mockResolvedValue({
        success: true,
        data: mockRegisterResponse,
      });

      const result = await register(validUserData, idempotencyKey);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRegisterResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://kong:8000/api/members',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            id: validUserData.id,
            password: validUserData.password,
            name: validUserData.name,
            email: validUserData.email,
          }),
        }),
      );
    });

    it('필수 필드가 없으면 검증 에러를 반환한다', async () => {
      const invalidUserData = { ...validUserData, name: '' };

      const result = await register(invalidUserData, idempotencyKey);

      expect(result.success).toBe(false);
      expect(result.error).toBe('모든 필수 정보를 입력해주세요.');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('비밀번호가 일치하지 않으면 검증 에러를 반환한다', async () => {
      const invalidUserData = { ...validUserData, confirmPassword: 'different' };

      const result = await register(invalidUserData, idempotencyKey);

      expect(result.success).toBe(false);
      expect(result.error).toBe('비밀번호가 일치하지 않습니다.');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('멱등성 키가 없으면 검증 에러를 반환한다', async () => {
      const result = await register(validUserData, '');

      expect(result.success).toBe(false);
      expect(result.error).toBe('멱등성 키가 누락되었습니다.');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('멱등성 키로 헤더 빌더를 생성한다', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      const { handleApiResponseForServerAction } = require('@/lib/server/serverActionErrorHandler');
      handleApiResponseForServerAction.mockResolvedValue({
        success: true,
        data: { success: true },
      });

      await register(validUserData, idempotencyKey);

      expect(HeaderBuilderFactory.createForIdempotentRequest).toHaveBeenCalledWith(idempotencyKey);
    });
  });

  describe('forgotPassword', () => {
    const validRequest: ForgotPasswordRequest = {
      email: 'test@example.com',
    };

    it('구현되지 않은 기능에 대해 에러를 발생시킨다', async () => {
      await expect(forgotPassword(validRequest)).rejects.toThrow(
        '비밀번호 찾기 기능은 아직 구현되지 않았습니다.',
      );
    });
  });
});

describe('환경 변수 검증', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it('AUTH_SERVICE_URL이 정의되어야 한다', () => {
    expect(process.env.AUTH_SERVICE_URL).toBeDefined();
    expect(process.env.AUTH_SERVICE_URL).toBe('http://koa-auth-server:4000');
  });

  it('KONG_GATEWAY_URL이 정의되어야 한다', () => {
    expect(process.env.KONG_GATEWAY_URL).toBeDefined();
    expect(process.env.KONG_GATEWAY_URL).toBe('http://kong:8000');
  });
});
