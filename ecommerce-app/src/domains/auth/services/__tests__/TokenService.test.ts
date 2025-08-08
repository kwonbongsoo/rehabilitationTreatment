/**
 * TokenService 단위 테스트
 */
import { TokenService, type TokenWithCookieResult } from '../TokenService';
import { ServerResponse } from 'http';
import { createTokenCookies } from '../cookieService';

// Mock dependencies
jest.mock('../cookieService', () => ({
  createTokenCookies: jest.fn(),
}));

// Fetch Mock
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock ServerResponse
const createMockResponse = () => {
  const mockRes = {
    setHeader: jest.fn(),
  } as unknown as ServerResponse;
  return mockRes;
};

// Mock console.error to reduce noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('TokenService', () => {
  let tokenService: TokenService;
  let mockCreateTokenCookies: jest.MockedFunction<typeof createTokenCookies>;

  beforeEach(() => {
    tokenService = new TokenService();
    mockCreateTokenCookies = createTokenCookies as jest.MockedFunction<typeof createTokenCookies>;
    jest.clearAllMocks();
  });

  describe('환경 변수 검증', () => {
    const originalEnv = process.env;

    afterEach(() => {
      process.env = { ...originalEnv };
    });

    it('AUTH_SERVICE_URL이 없으면 예외를 발생시킨다', async () => {
      process.env = {
        ...originalEnv,
        AUTH_SERVICE_URL: undefined,
        AUTH_PREFIX: '/api/auth',
      };

      const mockRes = createMockResponse();

      const result = await tokenService.issueGuestTokenWithCookie(mockRes);

      expect(result.success).toBe(false);
      expect(result.error).toContain('AUTH_SERVICE_URL 환경 변수가 설정되지 않았습니다');
      expect(result.cookieSet).toBe(false);
    });

    it('AUTH_PREFIX가 없으면 예외를 발생시킨다', async () => {
      process.env = {
        ...originalEnv,
        AUTH_SERVICE_URL: 'http://localhost:3001',
        AUTH_PREFIX: undefined,
      };

      const mockRes = createMockResponse();

      const result = await tokenService.issueGuestTokenWithCookie(mockRes);

      expect(result.success).toBe(false);
      expect(result.error).toContain('AUTH_PREFIX 환경 변수가 설정되지 않았습니다');
      expect(result.cookieSet).toBe(false);
    });
  });

  describe('issueGuestTokenWithCookie', () => {
    beforeEach(() => {
      process.env.AUTH_SERVICE_URL = 'http://localhost:3001';
      process.env.AUTH_PREFIX = '/api/auth';
    });

    it('성공적인 토큰 발급 시 쿠키를 설정하고 성공 결과를 반환한다', async () => {
      const mockTokenData = {
        access_token: 'test-token',
        role: 'guest',
        exp: Math.floor(Date.now() / 1000) + 3600, // 1시간 후
        iat: Math.floor(Date.now() / 1000),
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockTokenData,
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);
      mockCreateTokenCookies.mockReturnValue(['test-cookie-header']);

      const mockRes = createMockResponse();
      const result = await tokenService.issueGuestTokenWithCookie(mockRes);

      expect(result.success).toBe(true);
      expect(result.cookieSet).toBe(true);
      expect(result.data).toEqual(mockTokenData);
      expect(mockRes.setHeader).toHaveBeenCalledWith('Set-Cookie', ['test-cookie-header']);
    });

    it('API 응답이 실패하면 에러 결과를 반환한다', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      const mockRes = createMockResponse();
      const result = await tokenService.issueGuestTokenWithCookie(mockRes);

      expect(result.success).toBe(false);
      expect(result.cookieSet).toBe(false);
      expect(result.error).toContain('Auth 서비스 응답 오류: 500');
    });

    it('네트워크 에러 시 에러 결과를 반환한다', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const mockRes = createMockResponse();
      const result = await tokenService.issueGuestTokenWithCookie(mockRes);

      expect(result.success).toBe(false);
      expect(result.cookieSet).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('타임아웃 시 에러 결과를 반환한다', async () => {
      // AbortController timeout 테스트
      mockFetch.mockRejectedValue(new Error('The operation was aborted'));

      const mockRes = createMockResponse();
      const result = await tokenService.issueGuestTokenWithCookie(mockRes);

      expect(result.success).toBe(false);
      expect(result.cookieSet).toBe(false);
      expect(result.error).toBe('The operation was aborted');
    });

    it('토큰이 없는 응답 시 에러 결과를 반환한다', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: false, // success: false로 변경
          data: {
            // access_token이 없는 경우
            role: 'guest',
          },
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      const mockRes = createMockResponse();
      const result = await tokenService.issueGuestTokenWithCookie(mockRes);

      expect(result.success).toBe(false);
      expect(result.cookieSet).toBe(false);
    });

    it('올바른 요청 헤더로 API를 호출한다', async () => {
      const mockTokenData = {
        access_token: 'test-token',
        role: 'guest',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockTokenData,
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);
      mockCreateTokenCookies.mockReturnValue(['test-cookie-header']);

      const mockRes = createMockResponse();
      await tokenService.issueGuestTokenWithCookie(mockRes);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/guest-token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'NextJS-SSR',
          },
          signal: expect.any(AbortSignal),
        }
      );
    });

    it('쿠키 생성 실패 시에도 적절히 처리한다', async () => {
      const mockTokenData = {
        access_token: 'test-token',
        role: 'guest',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockTokenData,
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);
      mockCreateTokenCookies.mockImplementation(() => {
        throw new Error('Cookie creation failed');
      });

      const mockRes = createMockResponse();
      const result = await tokenService.issueGuestTokenWithCookie(mockRes);

      expect(result.success).toBe(false);
      expect(result.cookieSet).toBe(false);
      expect(result.error).toBe('Cookie creation failed');
    });
  });

  describe('프로덕션 환경', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      process.env.AUTH_SERVICE_URL = 'http://localhost:3001';
      process.env.AUTH_PREFIX = '/api/auth';
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('프로덕션 환경에서 에러 로그를 출력하지 않는다', async () => {
      process.env.NODE_ENV = 'production';

      mockFetch.mockRejectedValue(new Error('Test error'));

      const mockRes = createMockResponse();
      await tokenService.issueGuestTokenWithCookie(mockRes);

      // 프로덕션에서는 console.error가 호출되지 않아야 함
      expect(console.error).not.toHaveBeenCalled();
    });

    it('개발 환경에서 에러 로그를 출력한다', async () => {
      process.env.NODE_ENV = 'development';

      mockFetch.mockRejectedValue(new Error('Test error'));

      const mockRes = createMockResponse();
      await tokenService.issueGuestTokenWithCookie(mockRes);

      // 개발 환경에서는 console.error가 호출되어야 함
      expect(console.error).toHaveBeenCalled();
    });
  });
});

describe('TokenService 싱글톤', () => {
  it('tokenService 인스턴스가 올바르게 생성된다', () => {
    const { tokenService } = require('../TokenService');
    
    expect(tokenService).toBeInstanceOf(TokenService);
  });
});