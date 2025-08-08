/**
 * userActions 서버 액션 테스트
 */
import { getSessionInfo, getCurrentUser } from '../userActions';
import { HeaderBuilderFactory } from '@/lib/server/headerBuilder';

// Mock dependencies
jest.mock('@/lib/server/headerBuilder');
jest.mock('@/lib/server/errorHandler');

// Global fetch mock
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock environment variables
const originalEnv = process.env;
beforeAll(() => {
  process.env = {
    ...originalEnv,
    AUTH_SERVICE_URL: 'http://koa-auth-server:4000',
  };
});

afterAll(() => {
  process.env = originalEnv;
});

describe('userActions', () => {
  let mockHeaderBuilder: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock header builder
    mockHeaderBuilder = {
      build: jest.fn().mockResolvedValue({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      }),
    };
    (HeaderBuilderFactory.createForApiRequest as jest.Mock).mockReturnValue(mockHeaderBuilder);

    // Mock errorHandler
    const { handleApiServerActionResponse, handleActionError } = require('@/lib/server/errorHandler');
    
    handleApiServerActionResponse.mockImplementation(async (response: any) => {
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}`);
    });

    handleActionError.mockImplementation((error: any) => ({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      statusCode: 500,
    }));
  });

  describe('getSessionInfo', () => {
    it('성공적인 세션 정보 조회 시 액세스 토큰을 제외하고 반환한다', async () => {
      const mockSessionResponse = {
        success: true,
        data: {
          access_token: 'test-access-token',
          id: 'testuser',
          name: '테스트 사용자',
          email: 'test@example.com',
          role: 'user',
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000),
        },
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockSessionResponse),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      const result = await getSessionInfo();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        id: 'testuser',
        name: '테스트 사용자',
        email: 'test@example.com',
        role: 'user',
        exp: expect.any(Number),
        iat: expect.any(Number),
      });

      // access_token이 제외되었는지 확인
      expect(result.data).not.toHaveProperty('access_token');

      // API 호출 확인
      expect(mockFetch).toHaveBeenCalledWith(
        'http://koa-auth-server:4000/api/auth/session-info',
        expect.objectContaining({
          method: 'GET',
          cache: 'no-store',
        })
      );

      // 헤더 빌더 사용 확인
      expect(HeaderBuilderFactory.createForApiRequest).toHaveBeenCalled();
      expect(mockHeaderBuilder.build).toHaveBeenCalled();
    });

    it('API 호출 실패 시 에러를 반환한다', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      const { handleActionError } = require('@/lib/server/errorHandler');
      handleActionError.mockReturnValue({
        success: false,
        error: '인증에 실패했습니다.',
        statusCode: 401,
      });

      const result = await getSessionInfo();

      expect(result.success).toBe(false);
      expect(result.error).toBe('인증에 실패했습니다.');
      expect(result.statusCode).toBe(401);
    });

    it('네트워크 에러 시 에러를 반환한다', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await getSessionInfo();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.statusCode).toBe(500);
    });

    it('올바른 헤더로 API를 호출한다', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: {
            id: 'testuser',
            name: '테스트 사용자',
            email: 'test@example.com',
            role: 'user',
          },
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await getSessionInfo();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://koa-auth-server:4000/api/auth/session-info',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
          cache: 'no-store',
        })
      );
    });

    it('응답에서 빈 데이터를 올바르게 처리한다', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: {
            access_token: 'token',
            // 다른 필드들이 없는 경우
          },
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      const result = await getSessionInfo();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({});
      expect(result.data).not.toHaveProperty('access_token');
    });
  });

  describe('getCurrentUser', () => {
    it('getSessionInfo 성공 시 사용자 정보를 반환한다', async () => {
      const mockSessionResponse = {
        success: true,
        data: {
          access_token: 'test-token',
          id: 'testuser',
          name: '테스트 사용자',
          email: 'test@example.com',
          role: 'user',
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000),
        },
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockSessionResponse),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      const result = await getCurrentUser();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        id: 'testuser',
        name: '테스트 사용자',
        email: 'test@example.com',
        role: 'user',
        exp: expect.any(Number),
        iat: expect.any(Number),
      });
    });

    it('getSessionInfo 실패 시 에러를 반환한다', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      const { handleActionError } = require('@/lib/server/errorHandler');
      handleActionError.mockReturnValue({
        success: false,
        error: '인증에 실패했습니다.',
        statusCode: 401,
      });

      const result = await getCurrentUser();

      expect(result.success).toBe(false);
      expect(result.error).toBe('인증에 실패했습니다.');
      expect(result.statusCode).toBe(401);
    });

    it('getSessionInfo에서 에러 메시지가 없으면 기본 메시지를 사용한다', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      const { handleActionError } = require('@/lib/server/errorHandler');
      handleActionError.mockReturnValue({
        success: false,
        error: null, // null 에러
        statusCode: null, // null statusCode
      });

      const result = await getCurrentUser();

      expect(result.success).toBe(false);
      expect(result.error).toBe('사용자 정보 조회에 실패했습니다.');
      expect(result.statusCode).toBe(500);
    });

    it('getCurrentUser가 getSessionInfo를 올바르게 래핑한다', async () => {
      // Mock a successful getSessionInfo response
      const mockSessionResponse = {
        success: true,
        data: {
          id: 'testuser',
          role: 'user',
        },
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: {
            access_token: 'token',
            id: 'testuser',
            role: 'user',
          },
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      const result = await getCurrentUser();

      // Verify that getCurrentUser correctly processes and returns the result
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 'testuser', role: 'user' });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://koa-auth-server:4000/api/auth/session-info',
        expect.objectContaining({
          method: 'GET',
          cache: 'no-store',
        })
      );
    });
  });

  describe('환경 변수', () => {
    it('AUTH_SERVICE_URL이 올바르게 사용된다', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: { id: 'testuser' },
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await getSessionInfo();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://koa-auth-server:4000/api/auth/session-info',
        expect.any(Object)
      );
    });
  });

  describe('캐싱 동작', () => {
    it('세션 정보 조회 시 캐시를 사용하지 않는다', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: { id: 'testuser' },
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await getSessionInfo();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          cache: 'no-store',
        })
      );
    });
  });
});