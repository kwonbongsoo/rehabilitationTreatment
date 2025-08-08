import {
  handleServerActionError,
  handleApiResponseForServerAction,
  withServerActionErrorHandling,
  safeServerAction,
  ServerActionResult,
} from '../serverActionErrorHandler';
import { BaseError, ErrorCode } from '@ecommerce/common';

// Mock console.error to avoid noise in tests  
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

// Clean up after all tests
afterAll(() => {
  consoleSpy.mockRestore();
});

describe('handleServerActionError', () => {
  describe('BaseError handling', () => {
    it('should handle BaseError instances correctly', () => {
      // Create a mock BaseError instance
      const baseError = {
        message: 'Custom error message',
        statusCode: 400,
        code: 'CUSTOM_ERROR',
      };
      Object.setPrototypeOf(baseError, BaseError.prototype);
      
      const result = handleServerActionError(baseError);

      expect(result).toEqual({
        success: false,
        error: 'Custom error message',
        statusCode: 400,
        code: 'CUSTOM_ERROR',
      });
    });

    it('should handle BaseError subclasses correctly', () => {
      // Create a mock BaseError subclass instance
      const customError = {
        message: 'Validation failed',
        statusCode: 422,
        code: ErrorCode.VALIDATION_ERROR,
      };
      Object.setPrototypeOf(customError, BaseError.prototype);

      const result = handleServerActionError(customError);

      expect(result).toEqual({
        success: false,
        error: 'Validation failed',
        statusCode: 422,
        code: ErrorCode.VALIDATION_ERROR,
      });
    });
  });

  describe('authentication error detection', () => {
    const authErrorCases = [
      'Authentication failed',
      'Invalid credentials provided',
      'Token expired',
      'AUTH_ERROR: Access denied',
    ];

    authErrorCases.forEach((errorMessage) => {
      it(`should detect auth error: "${errorMessage}"`, () => {
        const error = new Error(errorMessage);
        
        const result = handleServerActionError(error);

        expect(result).toEqual({
          success: false,
          error: '인증에 실패했습니다.',
          statusCode: 401,
          code: ErrorCode.INVALID_CREDENTIALS,
        });
      });
    });
  });

  describe('network error detection', () => {
    const networkErrorCases = [
      'fetch failed',
      'Network connection lost',
      'Connection timeout',
      'FETCH_ERROR: Unable to connect',
    ];

    networkErrorCases.forEach((errorMessage) => {
      it(`should detect network error: "${errorMessage}"`, () => {
        const error = new Error(errorMessage);
        
        const result = handleServerActionError(error);

        expect(result).toEqual({
          success: false,
          error: '서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.',
          statusCode: 503,
          code: ErrorCode.SERVICE_UNAVAILABLE,
        });
      });
    });
  });

  describe('validation error detection', () => {
    const validationErrorCases = [
      'Validation failed',
      'Invalid input provided',
      'VALIDATION_ERROR: Required field missing',
    ];

    validationErrorCases.forEach((errorMessage) => {
      it(`should detect validation error: "${errorMessage}"`, () => {
        const error = new Error(errorMessage);
        
        const result = handleServerActionError(error);

        expect(result).toEqual({
          success: false,
          error: errorMessage,
          statusCode: 400,
          code: ErrorCode.VALIDATION_ERROR,
        });
      });
    });
  });

  describe('general error handling', () => {
    it('should handle general Error instances', () => {
      const error = new Error('Something unexpected happened');
      
      const result = handleServerActionError(error);

      expect(result).toEqual({
        success: false,
        error: 'Something unexpected happened',
        statusCode: 500,
        code: ErrorCode.INTERNAL_ERROR,
      });
    });

    it('should handle non-Error types with context', () => {
      const unknownError = 'String error';
      const context = 'product creation';
      
      const result = handleServerActionError(unknownError, context);

      expect(result).toEqual({
        success: false,
        error: 'product creation 중 오류가 발생했습니다.',
        statusCode: 500,
        code: ErrorCode.INTERNAL_ERROR,
      });
    });

    it('should handle non-Error types without context', () => {
      const unknownError = { message: 'Object error' };
      
      const result = handleServerActionError(unknownError);

      expect(result).toEqual({
        success: false,
        error: '알 수 없는 오류가 발생했습니다.',
        statusCode: 500,
        code: ErrorCode.INTERNAL_ERROR,
      });
    });
  });
});

describe('handleApiResponseForServerAction', () => {
  describe('successful responses', () => {
    it('should return success result with data', async () => {
      const mockData = { id: 1, name: 'Test Product' };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      } as unknown as Response;

      const result = await handleApiResponseForServerAction(mockResponse);

      expect(result).toEqual({
        success: true,
        data: mockData,
      });
    });
  });

  describe('error responses', () => {
    it('should handle error response with JSON error message', async () => {
      const errorMessage = 'Product not found';
      const mockResponse = {
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue(JSON.stringify({ message: errorMessage })),
      } as unknown as Response;

      const result = await handleApiResponseForServerAction(mockResponse);

      expect(result).toEqual({
        success: false,
        error: errorMessage,
        statusCode: 404,
        code: ErrorCode.INTERNAL_ERROR,
      });
    });

    it('should handle error response with error field', async () => {
      const errorMessage = 'Validation failed';
      const mockResponse = {
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue(JSON.stringify({ error: errorMessage })),
      } as unknown as Response;

      const result = await handleApiResponseForServerAction(mockResponse);

      expect(result).toEqual({
        success: false,
        error: errorMessage,
        statusCode: 400,
        code: ErrorCode.INTERNAL_ERROR,
      });
    });

    it('should handle non-JSON error responses', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Internal Server Error'),
      } as unknown as Response;

      const result = await handleApiResponseForServerAction(mockResponse);

      expect(result).toEqual({
        success: false,
        error: '서버 오류가 발생했습니다.',
        statusCode: 500,
        code: ErrorCode.INTERNAL_ERROR,
      });
    });

    it('should include context in error handling', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Server Error'),
      } as unknown as Response;

      const result = await handleApiResponseForServerAction(mockResponse, 'user registration');

      expect(result).toEqual({
        success: false,
        error: '서버 오류가 발생했습니다.',
        statusCode: 500,
        code: ErrorCode.INTERNAL_ERROR,
      });
    });
  });

  describe('response processing errors', () => {
    it('should handle JSON parsing errors', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as Response;

      const result = await handleApiResponseForServerAction(mockResponse, 'data fetch');

      expect(result).toEqual({
        success: false,
        error: 'Invalid JSON',
        statusCode: 400,
        code: ErrorCode.VALIDATION_ERROR,
      });
    });

    it('should handle text parsing errors', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        text: jest.fn().mockRejectedValue(new Error('Text parsing failed')),
      } as unknown as Response;

      const result = await handleApiResponseForServerAction(mockResponse);

      expect(result).toEqual({
        success: false,
        error: 'Text parsing failed',
        statusCode: 500,
        code: ErrorCode.INTERNAL_ERROR,
      });
    });
  });
});

describe('withServerActionErrorHandling', () => {
  it('should execute action successfully', async () => {
    const mockAction = jest.fn().mockResolvedValue({ success: true, data: 'test' });
    const wrappedAction = withServerActionErrorHandling(mockAction, 'test context');

    const result = await wrappedAction('arg1', 'arg2');

    expect(mockAction).toHaveBeenCalledWith('arg1', 'arg2');
    expect(result).toEqual({ success: true, data: 'test' });
  });

  it('should log and re-throw errors', async () => {
    const error = new Error('Action failed');
    const mockAction = jest.fn().mockRejectedValue(error);
    const wrappedAction = withServerActionErrorHandling(mockAction, 'test context');

    await expect(wrappedAction('arg1')).rejects.toThrow('Action failed');
    
    expect(consoleSpy).toHaveBeenCalledWith('[ServerAction:test context] Error:', error);
  });

  it('should use "Unknown" context when none provided', async () => {
    const error = new Error('Action failed');
    const mockAction = jest.fn().mockRejectedValue(error);
    const wrappedAction = withServerActionErrorHandling(mockAction);

    await expect(wrappedAction()).rejects.toThrow('Action failed');
    
    expect(consoleSpy).toHaveBeenCalledWith('[ServerAction:Unknown] Error:', error);
  });
});

describe('safeServerAction', () => {
  it('should execute action and return result', async () => {
    const mockResult: ServerActionResult<string> = { success: true, data: 'test data' };
    const mockAction = jest.fn().mockResolvedValue(mockResult);

    const result = await safeServerAction(mockAction, 'safe context');

    expect(mockAction).toHaveBeenCalled();
    expect(result).toBe(mockResult);
  });

  it('should catch and handle errors safely', async () => {
    const error = new Error('Safe action failed');
    const mockAction = jest.fn().mockRejectedValue(error);

    const result = await safeServerAction(mockAction, 'safe context');

    expect(result).toEqual({
      success: false,
      error: 'Safe action failed',
      statusCode: 500,
      code: ErrorCode.INTERNAL_ERROR,
    });
    
    expect(consoleSpy).toHaveBeenCalledWith('[SafeServerAction:safe context] Error:', error);
  });

  it('should use "Unknown" context when none provided', async () => {
    const error = new Error('Safe action failed');
    const mockAction = jest.fn().mockRejectedValue(error);

    await safeServerAction(mockAction);

    expect(consoleSpy).toHaveBeenCalledWith('[SafeServerAction:Unknown] Error:', error);
  });

  it('should handle BaseError instances in safe context', async () => {
    // Create a mock BaseError instance
    const baseError = {
      message: 'Validation error',
      statusCode: 422,
      code: ErrorCode.VALIDATION_ERROR,
    };
    Object.setPrototypeOf(baseError, BaseError.prototype);
    
    const mockAction = jest.fn().mockRejectedValue(baseError);

    const result = await safeServerAction(mockAction);

    expect(result).toEqual({
      success: false,
      error: 'Validation error',
      statusCode: 422,
      code: ErrorCode.VALIDATION_ERROR,
    });
  });
});