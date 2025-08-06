// Mock the HttpClient before importing anything
jest.mock('@ecommerce/common', () => ({
  HttpClient: jest.fn().mockImplementation(function(this: any) {
    this.get = jest.fn();
    this.post = jest.fn();
    return this;
  }),
}));

import { KongApiClient } from '../kongApiClient';
import kongApiClient from '../kongApiClient';
import { HttpClient } from '@ecommerce/common';

// Get mock functions after import
const MockedHttpClient = HttpClient as jest.MockedClass<typeof HttpClient>;

// Mock environment variables
const originalEnv = process.env;

describe('KongApiClient', () => {
  let mockGet: jest.Mock;
  let mockPost: jest.Mock;
  let mockHttpClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    process.env = { ...originalEnv };
    
    // Get fresh mock functions
    mockGet = jest.fn();
    mockPost = jest.fn();
    
    // Create a proper mock instance
    mockHttpClient = {
      get: mockGet,
      post: mockPost,
    };
    
    // Update the mock implementation to return the mock instance
    MockedHttpClient.mockImplementation(function(this: any) {
      Object.assign(this, mockHttpClient);
      return this;
    });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Constructor', () => {
    it('should use KONG_GATEWAY_URL for server-side', () => {
      // Simulate server-side (window is undefined)
      delete (global as any).window;
      process.env.KONG_GATEWAY_URL = 'http://kong-gateway:8000';

      new KongApiClient();

      expect(HttpClient).toHaveBeenCalledWith('http://kong-gateway:8000', {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should use NEXT_PUBLIC_PROXY_API_URL for client-side', () => {
      // Simulate client-side (window exists)
      (global as any).window = {};
      process.env.NEXT_PUBLIC_PROXY_API_URL = 'http://localhost:9000';

      new KongApiClient();

      expect(HttpClient).toHaveBeenCalledWith('http://localhost:9000', {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should use default URLs when environment variables are not set', () => {
      delete process.env.KONG_GATEWAY_URL;
      delete process.env.NEXT_PUBLIC_PROXY_API_URL;
      delete (global as any).window;

      new KongApiClient();

      expect(HttpClient).toHaveBeenCalledWith('http://localhost:8000', {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should accept custom options', () => {
      delete (global as any).window;
      delete process.env.KONG_GATEWAY_URL;
      const customOptions = {
        timeout: 10000,
        headers: { 'X-Custom': 'test' },
      };

      new KongApiClient(customOptions);

      expect(HttpClient).toHaveBeenCalledWith('http://localhost:8000', {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'X-Custom': 'test',
        },
      });
    });
  });

  describe('API Methods', () => {
    let client: KongApiClient;

    beforeEach(() => {
      delete (global as any).window;
      client = new KongApiClient();
    });

    describe('getCategories', () => {
      it('should call get with correct endpoint and default options', async () => {
        const mockResponse = { categories: [], components: [] };
        mockGet.mockResolvedValue(mockResponse);

        const result = await client.getCategories();

        expect(mockGet).toHaveBeenCalledWith('/api/categories', {});
        expect(result).toBe(mockResponse);
      });

      it('should pass custom headers when provided', async () => {
        const mockResponse = { categories: [], components: [] };
        const customHeaders = { Authorization: 'Bearer token123' };
        mockGet.mockResolvedValue(mockResponse);

        const result = await client.getCategories({ headers: customHeaders });

        expect(mockGet).toHaveBeenCalledWith('/api/categories', {
          headers: customHeaders,
        });
        expect(result).toBe(mockResponse);
      });

      it('should handle API errors gracefully', async () => {
        const error = new Error('Network error');
        mockGet.mockRejectedValue(error);

        await expect(client.getCategories()).rejects.toThrow('Network error');
      });
    });

    describe('getCategoriesForProductForm', () => {
      it('should call get with correct endpoint', async () => {
        const mockResponse = [{ id: 1, name: 'Electronics' }];
        mockGet.mockResolvedValue(mockResponse);

        const result = await client.getCategoriesForProductForm();

        expect(mockGet).toHaveBeenCalledWith('/api/v1/categories', {});
        expect(result).toBe(mockResponse);
      });

      it('should pass custom headers when provided', async () => {
        const mockResponse = [{ id: 1, name: 'Electronics' }];
        const customHeaders = { 'X-Request-ID': 'req-123' };
        mockGet.mockResolvedValue(mockResponse);

        await client.getCategoriesForProductForm({ headers: customHeaders });

        expect(mockGet).toHaveBeenCalledWith('/api/v1/categories', {
          headers: customHeaders,
        });
      });
    });

    describe('getHomePageData', () => {
      it('should call get with correct endpoint', async () => {
        const mockResponse = { banner: {}, products: [], categories: [] };
        mockGet.mockResolvedValue(mockResponse);

        const result = await client.getHomePageData();

        expect(mockGet).toHaveBeenCalledWith('/api/home', {});
        expect(result).toBe(mockResponse);
      });

      it('should handle empty options parameter', async () => {
        const mockResponse = { banner: {}, products: [], categories: [] };
        mockGet.mockResolvedValue(mockResponse);

        await client.getHomePageData(undefined);

        expect(mockGet).toHaveBeenCalledWith('/api/home', {});
      });
    });

    describe('createProduct', () => {
      it('should call post with FormData and correct endpoint', async () => {
        const mockResponse = { id: 123, name: 'New Product' };
        const formData = new FormData();
        formData.append('name', 'Test Product');
        mockPost.mockResolvedValue(mockResponse);

        const result = await client.createProduct(formData);

        expect(mockPost).toHaveBeenCalledWith('/api/products', formData, {});
        expect(result).toBe(mockResponse);
      });

      it('should pass custom headers when provided', async () => {
        const mockResponse = { id: 123, name: 'New Product' };
        const formData = new FormData();
        const customHeaders = { 'X-Upload-Type': 'product' };
        mockPost.mockResolvedValue(mockResponse);

        await client.createProduct(formData, { headers: customHeaders });

        expect(mockPost).toHaveBeenCalledWith('/api/products', formData, {
          headers: customHeaders,
        });
      });

      it('should handle FormData submission errors', async () => {
        const formData = new FormData();
        const error = new Error('Upload failed');
        mockPost.mockRejectedValue(error);

        await expect(client.createProduct(formData)).rejects.toThrow('Upload failed');
      });
    });
  });

  describe('Singleton Instance', () => {
    it('should export a singleton instance', () => {
      expect(kongApiClient).toBeDefined();
      expect(typeof kongApiClient.getCategories).toBe('function');
    });

    it('should export the class constructor', () => {
      expect(KongApiClient).toBeDefined();
      expect(typeof KongApiClient).toBe('function');
    });
  });

  describe('Environment Detection', () => {
    it('should correctly detect server environment', () => {
      delete (global as any).window;
      process.env.KONG_GATEWAY_URL = 'http://server-url:8000';

      new KongApiClient();

      expect(HttpClient).toHaveBeenCalledWith('http://server-url:8000', expect.any(Object));
    });

    it('should correctly detect client environment', () => {
      (global as any).window = {};
      process.env.NEXT_PUBLIC_PROXY_API_URL = 'http://client-url:9000';

      new KongApiClient();

      expect(HttpClient).toHaveBeenCalledWith('http://client-url:9000', expect.any(Object));
    });
  });

  describe('Error Handling', () => {
    let client: KongApiClient;

    beforeEach(() => {
      delete (global as any).window;
      client = new KongApiClient();
    });

    it('should propagate network errors', async () => {
      const networkError = new Error('Connection refused');
      mockGet.mockRejectedValue(networkError);

      await expect(client.getCategories()).rejects.toThrow('Connection refused');
    });

    it('should propagate timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      mockPost.mockRejectedValue(timeoutError);

      const formData = new FormData();
      await expect(client.createProduct(formData)).rejects.toThrow('Request timeout');
    });
  });
});