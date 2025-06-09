import { Context } from 'koa';
import { AuthenticationError, BaseError, ErrorCode } from '@ecommerce/common';
import { errorMiddleware } from '../middlewares/errorMiddleware';

describe('에러 미들웨어', () => {
  let mockContext: Partial<Context>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockContext = {
      status: 200,
      body: {},
      set: jest.fn(),
      state: {},
      request: {
        method: 'GET',
        url: '/test',
        query: {},
        body: {},
        ip: '127.0.0.1',
        ips: [],
        path: '/test',
        protocol: 'http',
        secure: false,
        hostname: 'localhost',
        host: 'localhost:3000',
        subdomains: [],
        originalUrl: '/test',
        href: 'http://localhost:3000/test',
        origin: 'http://localhost:3000',
        fresh: false,
        stale: true,
        idempotent: false,
        charset: 'utf-8',
        length: 0,
        type: '',
        is: jest.fn(),
        accepts: jest.fn(),
        acceptsEncodings: jest.fn(),
        acceptsCharsets: jest.fn(),
        acceptsLanguages: jest.fn(),
        get: jest.fn(),
        header: {},
        headers: {},
      } as any,
      response: {
        status: 200,
        message: '',
        length: 0,
        type: '',
        lastModified: new Date(),
        etag: '',
        set: jest.fn(),
        append: jest.fn(),
        remove: jest.fn(),
        is: jest.fn(),
        get: jest.fn(),
        redirect: jest.fn(),
        attachment: jest.fn(),
        body: {},
        header: {},
        headers: {},
      } as any,
    };
    mockNext = jest.fn();
  });

  it('BaseError를 올바르게 처리해야 한다', async () => {
    const error = new BaseError(ErrorCode.VALIDATION_ERROR, '테스트 에러', undefined, 400);
    mockNext.mockRejectedValueOnce(error);

    await errorMiddleware(mockContext as Context, mockNext);

    expect(mockContext.status).toBe(400);
    expect(mockContext.body).toEqual({
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: '테스트 에러',
        details: undefined,
      },
    });
  });

  it('AuthenticationError를 올바르게 처리해야 한다', async () => {
    const error = new AuthenticationError('유효하지 않은 토큰');
    mockNext.mockRejectedValueOnce(error);

    await errorMiddleware(mockContext as Context, mockNext);

    expect(mockContext.status).toBe(401);
    expect(mockContext.body).toEqual({
      error: {
        code: 'UNAUTHORIZED',
        message: '유효하지 않은 토큰',
        details: null,
      },
    });
  });

  it('알 수 없는 에러를 올바르게 처리해야 한다', async () => {
    const error = new Error('알 수 없는 에러');
    mockNext.mockRejectedValueOnce(error);

    await errorMiddleware(mockContext as Context, mockNext);

    expect(mockContext.status).toBe(500);
    expect(mockContext.body).toEqual({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        details: null,
      },
    });
  });
});
