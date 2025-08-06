import {
  handleApiServerActionResponse,
  handleActionError,
} from '../errorHandler';

// Mock console.error to avoid noise in tests
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('handleApiServerActionResponse', () => {
  describe('when response is successful', () => {
    it('should return success result with data', async () => {
      const mockData = { id: 1, name: 'Test Product' };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: mockData }),
      } as unknown as Response;

      const result = await handleApiServerActionResponse(mockResponse);

      expect(result).toEqual({
        success: true,
        data: mockData,
      });
    });

    it('should handle data processing errors during success response', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: null }),
      } as unknown as Response;

      // Mock a processing error during data extraction
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = await handleApiServerActionResponse(mockResponse);

      expect(result).toEqual({
        success: true,
        data: null,
      });

      consoleSpy.mockRestore();
    });
  });

  describe('when response has error', () => {
    it('should return error result with message from response body', async () => {
      const errorMessage = 'Validation failed';
      const mockResponse = {
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({ message: errorMessage }),
      } as unknown as Response;

      const result = await handleApiServerActionResponse(mockResponse);

      expect(result).toEqual({
        success: false,
        error: errorMessage,
        statusCode: 400,
      });
    });

    it('should return error result with error field from response body', async () => {
      const errorMessage = 'Authentication failed';
      const mockResponse = {
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({ error: errorMessage }),
      } as unknown as Response;

      const result = await handleApiServerActionResponse(mockResponse);

      expect(result).toEqual({
        success: false,
        error: errorMessage,
        statusCode: 401,
      });
    });

    it('should use default error message when JSON parsing fails', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as Response;

      const result = await handleApiServerActionResponse(mockResponse);

      expect(result).toEqual({
        success: false,
        error: '오류가 발생했습니다.',
        statusCode: 500,
      });
    });

    it('should use default error message when response body has no message or error field', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({ someOtherField: 'value' }),
      } as unknown as Response;

      const result = await handleApiServerActionResponse(mockResponse);

      expect(result).toEqual({
        success: false,
        error: '오류가 발생했습니다.',
        statusCode: 500,
      });
    });
  });

  describe('when response processing throws error', () => {
    it('should handle network errors', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Network error')),
      } as unknown as Response;

      const result = await handleApiServerActionResponse(mockResponse);

      expect(result).toEqual({
        success: false,
        error: 'API 응답 처리 중 오류가 발생했습니다.',
        statusCode: 500,
      });
    });

    it('should handle unexpected errors during response processing', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockRejectedValue(new TypeError('Unexpected error')),
      } as unknown as Response;

      const result = await handleApiServerActionResponse(mockResponse);

      expect(result).toEqual({
        success: false,
        error: 'API 응답 처리 중 오류가 발생했습니다.',
        statusCode: 500,
      });
    });
  });
});

describe('handleActionError', () => {
  it('should handle fetch errors with specific message', () => {
    const fetchError = new Error('fetch failed');
    
    const result = handleActionError(fetchError);

    expect(result).toEqual({
      success: false,
      error: '서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.',
      statusCode: 500,
    });
  });

  it('should handle timeout errors with specific message', () => {
    const timeoutError = new Error('timeout exceeded');
    
    const result = handleActionError(timeoutError);

    expect(result).toEqual({
      success: false,
      error: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
      statusCode: 500,
    });
  });

  it('should handle general Error instances', () => {
    const generalError = new Error('Something went wrong');
    
    const result = handleActionError(generalError);

    expect(result).toEqual({
      success: false,
      error: '서버 오류가 발생했습니다.',
      statusCode: 500,
    });
  });

  it('should handle non-Error types', () => {
    const unknownError = 'String error';
    
    const result = handleActionError(unknownError);

    expect(result).toEqual({
      success: false,
      error: '서버 오류가 발생했습니다.',
      statusCode: 500,
    });
  });

  it('should handle null/undefined errors', () => {
    const result1 = handleActionError(null);
    const result2 = handleActionError(undefined);

    expect(result1).toEqual({
      success: false,
      error: '서버 오류가 발생했습니다.',
      statusCode: 500,
    });

    expect(result2).toEqual({
      success: false,
      error: '서버 오류가 발생했습니다.',
      statusCode: 500,
    });
  });

  it('should log errors to console', () => {
    const error = new Error('Test error');
    const consoleSpy = jest.spyOn(console, 'error');
    
    handleActionError(error);

    expect(consoleSpy).toHaveBeenCalledWith('Server action error:', error);
    
    consoleSpy.mockRestore();
  });
});