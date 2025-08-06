import { NextRequest } from 'next/server';
import { HeaderBuilderFactory } from '../headerBuilder';

// Mock Next.js modules
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
  headers: jest.fn(),
}));

// Mock environment variables
const originalEnv = process.env;

describe('HeaderBuilderFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('create', () => {
    it('should create a basic header builder', () => {
      const builder = HeaderBuilderFactory.create();
      expect(builder).toBeDefined();
      expect(typeof builder.withContentType).toBe('function');
      expect(typeof builder.withAuth).toBe('function');
      expect(typeof builder.build).toBe('function');
    });
  });

  describe('createForApiRequest', () => {
    it('should create header builder with content-type and bearer auth preset', async () => {
      // Mock cookies to return a token
      const { cookies } = require('next/headers');
      cookies.mockResolvedValue({
        get: jest.fn().mockReturnValue({ value: 'test-token' }),
      });

      const builder = HeaderBuilderFactory.createForApiRequest();
      const headers = await builder.build();

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['Authorization']).toBe('Bearer test-token');
    });
  });

  describe('createForBasicAuth', () => {
    it('should create header builder with basic auth preset using environment variable', async () => {
      process.env.AUTH_BASIC_KEY = 'test-basic-key';

      const builder = HeaderBuilderFactory.createForBasicAuth();
      const headers = await builder.build();

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['Authorization']).toBe('Basic dGVzdC1iYXNpYy1rZXk='); // base64 encoded
    });

    it('should create header builder with basic auth using provided key', async () => {
      const builder = HeaderBuilderFactory.createForBasicAuth('custom-key');
      const headers = await builder.build();

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['Authorization']).toBe('Basic Y3VzdG9tLWtleQ=='); // base64 encoded
    });

    it('should throw error when AUTH_BASIC_KEY is not set and no key provided', () => {
      delete process.env.AUTH_BASIC_KEY;

      expect(() => HeaderBuilderFactory.createForBasicAuth()).toThrow(
        'AUTH_BASIC_KEY 환경 변수가 설정되어 있지 않습니다.'
      );
    });
  });

  describe('createForIdempotentRequest', () => {
    it('should create header builder with idempotency key', async () => {
      // Mock cookies to return a token
      const { cookies } = require('next/headers');
      cookies.mockResolvedValue({
        get: jest.fn().mockReturnValue({ value: 'test-token' }),
      });

      const idempotencyKey = 'unique-operation-123';
      const builder = HeaderBuilderFactory.createForIdempotentRequest(idempotencyKey);
      const headers = await builder.build();

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['Authorization']).toBe('Bearer test-token');
      expect(headers['X-Idempotency-Key']).toBe(idempotencyKey);
    });
  });

  describe('createForMiddleware', () => {
    it('should create middleware header builder without request', () => {
      const builder = HeaderBuilderFactory.createForMiddleware();
      expect(builder).toBeDefined();
      expect(typeof builder.withContentType).toBe('function');
      expect(typeof builder.withAuth).toBe('function');
    });

    it('should create middleware header builder with request', () => {
      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'middleware-token' }),
        },
      } as unknown as NextRequest;

      const builder = HeaderBuilderFactory.createForMiddleware(mockRequest);
      expect(builder).toBeDefined();
    });
  });

  describe('createForMiddlewareBasicAuth', () => {
    it('should create middleware header builder with basic auth using environment variable', async () => {
      process.env.AUTH_BASIC_KEY = 'middleware-key';
      
      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'middleware-token' }),
        },
      } as unknown as NextRequest;

      const builder = HeaderBuilderFactory.createForMiddlewareBasicAuth(mockRequest);
      const headers = await builder.build();

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['User-Agent']).toBe('NextJS-Middleware');
      // Note: Basic auth will use the provided key, not the token from cookies
      expect(headers['Authorization']).toBe('Basic bWlkZGxld2FyZS1rZXk='); // base64 encoded
    });

    it('should create middleware header builder with custom auth key', async () => {
      const customKey = 'custom-middleware-key';
      
      const builder = HeaderBuilderFactory.createForMiddlewareBasicAuth(undefined, customKey);
      const headers = await builder.build();

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['User-Agent']).toBe('NextJS-Middleware');
      expect(headers['Authorization']).toBe('Basic Y3VzdG9tLW1pZGRsZXdhcmUta2V5'); // base64 encoded
    });

    it('should throw error when AUTH_BASIC_KEY is not set and no key provided', () => {
      delete process.env.AUTH_BASIC_KEY;

      expect(() => HeaderBuilderFactory.createForMiddlewareBasicAuth()).toThrow(
        'AUTH_BASIC_KEY 환경 변수가 설정되어 있지 않습니다.'
      );
    });
  });
});

describe('HttpHeaderBuilder', () => {
  describe('header building chain', () => {
    it('should build headers with all chained methods', async () => {
      // Mock cookies
      const { cookies } = require('next/headers');
      cookies.mockResolvedValue({
        get: jest.fn().mockReturnValue({ value: 'chain-test-token' }),
      });

      const builder = HeaderBuilderFactory.create()
        .withContentType('application/xml')
        .withAuth('bearer')
        .withIdempotencyKey('test-key-123')
        .withPreviousToken('prev-token')
        .withCustomHeader('X-Custom', 'custom-value');

      const headers = await builder.build();

      expect(headers).toEqual({
        'Content-Type': 'application/xml',
        'Authorization': 'Bearer chain-test-token',
        'X-Idempotency-Key': 'test-key-123',
        'X-Previous-Token': 'prev-token',
        'X-Custom': 'custom-value',
      });
    });

    it('should handle optional parameters gracefully', async () => {
      const { cookies } = require('next/headers');
      cookies.mockResolvedValue({
        get: jest.fn().mockReturnValue(undefined),
      });

      const builder = HeaderBuilderFactory.create()
        .withContentType()
        .withAuth('bearer')
        .withPreviousToken(); // no token provided

      const headers = await builder.build();

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['Authorization']).toBeUndefined(); // no token available
      expect(headers['X-Previous-Token']).toBeUndefined(); // no token provided
    });

    it('should prefer explicit auth value over cookies', async () => {
      const { cookies } = require('next/headers');
      cookies.mockResolvedValue({
        get: jest.fn().mockReturnValue({ value: 'cookie-token' }),
      });

      const builder = HeaderBuilderFactory.create()
        .withAuth('bearer', 'explicit-token');

      const headers = await builder.build();

      expect(headers['Authorization']).toBe('Bearer explicit-token');
    });
  });

  describe('auth token resolution', () => {
    it('should resolve token from request headers first', async () => {
      const { headers } = require('next/headers');
      headers.mockResolvedValue({
        get: jest.fn().mockReturnValue('Bearer header-token'),
      });

      const { cookies } = require('next/headers');
      cookies.mockResolvedValue({
        get: jest.fn().mockReturnValue({ value: 'cookie-token' }),
      });

      const builder = HeaderBuilderFactory.create().withAuth('bearer');
      const result = await builder.build();

      expect(result['Authorization']).toBe('Bearer header-token');
    });

    it('should fallback to cookies when headers fail', async () => {
      const { headers } = require('next/headers');
      headers.mockRejectedValue(new Error('Headers not available'));

      const { cookies } = require('next/headers');
      cookies.mockResolvedValue({
        get: jest.fn().mockReturnValue({ value: 'fallback-token' }),
      });

      const builder = HeaderBuilderFactory.create().withAuth('bearer');
      const result = await builder.build();

      expect(result['Authorization']).toBe('Bearer fallback-token');
    });

    it('should handle missing tokens gracefully', async () => {
      const { headers } = require('next/headers');
      headers.mockResolvedValue({
        get: jest.fn().mockReturnValue(null),
      });

      const { cookies } = require('next/headers');
      cookies.mockResolvedValue({
        get: jest.fn().mockReturnValue(undefined),
      });

      const builder = HeaderBuilderFactory.create().withAuth('bearer');
      const result = await builder.build();

      expect(result['Authorization']).toBeUndefined();
    });
  });

  describe('auth header formatting', () => {
    it('should format bearer token correctly', async () => {
      const builder = HeaderBuilderFactory.create().withAuth('bearer', 'test-token');
      const headers = await builder.build();

      expect(headers['Authorization']).toBe('Bearer test-token');
    });

    it('should format basic auth correctly', async () => {
      const builder = HeaderBuilderFactory.create().withAuth('basic', 'username:password');
      const headers = await builder.build();

      expect(headers['Authorization']).toBe('Basic dXNlcm5hbWU6cGFzc3dvcmQ='); // base64 encoded
    });
  });
});

describe('MiddlewareHeaderBuilder', () => {
  describe('with NextRequest', () => {
    it('should resolve token from NextRequest cookies', async () => {
      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'middleware-token' }),
        },
      } as unknown as NextRequest;

      const builder = HeaderBuilderFactory.createForMiddleware(mockRequest)
        .withAuth('bearer');
      
      const headers = await builder.build();

      expect(headers['Authorization']).toBe('Bearer middleware-token');
    });

    it('should handle missing cookies in NextRequest', async () => {
      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue(undefined),
        },
      } as unknown as NextRequest;

      const builder = HeaderBuilderFactory.createForMiddleware(mockRequest)
        .withAuth('bearer');
      
      const headers = await builder.build();

      expect(headers['Authorization']).toBeUndefined();
    });
  });

  describe('basic auth formatting in middleware', () => {
    it('should use btoa for base64 encoding in middleware', async () => {
      // Mock btoa for Node.js environment
      global.btoa = jest.fn().mockReturnValue('YnRvYS1lbmNvZGVk');

      const builder = HeaderBuilderFactory.createForMiddleware()
        .withAuth('basic', 'test-creds');
      
      const headers = await builder.build();

      expect(headers['Authorization']).toBe('Basic YnRvYS1lbmNvZGVk');
      expect(global.btoa).toHaveBeenCalledWith('test-creds');
    });
  });
});