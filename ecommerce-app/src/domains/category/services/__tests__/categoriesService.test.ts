/**
 * CategoriesService 테스트
 *
 * 카테고리 서비스 로직을 테스트합니다.
 * 사이드이펙트 방지를 위해 외부 API 클라이언트와 fetch를 모킹합니다.
 */

import categoriesService, { CategoriesService, fetchCategories } from '../categoriesService';
import type { CategoryOption, CategoriesResponse } from '../categoriesService';
import type { CategoryPageData } from '../../types/categories';
import { BaseError, ErrorCode } from '@ecommerce/common';

// 외부 의존성 모킹
jest.mock('@/infrastructure/clients/kongApiClient', () => ({
  __esModule: true,
  default: {
    getCategories: jest.fn(),
    getCategoriesForProductForm: jest.fn(),
  },
}));

// fetch API 모킹
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

// console.error 모킹
const mockConsoleError = jest.fn();
const mockConsoleLog = jest.fn();
global.console.error = mockConsoleError;
global.console.log = mockConsoleLog;

describe('CategoriesService', () => {
  const mockKongApiClient = require('@/infrastructure/clients/kongApiClient').default;

  const mockCategoryOptions: CategoryOption[] = [
    {
      id: 1,
      name: '의류',
      slug: 'clothing',
      iconCode: 'shirt',
    },
    {
      id: 2,
      name: '신발',
      slug: 'shoes',
      iconCode: 'shoe',
    },
    {
      id: 3,
      name: '액세서리',
      slug: 'accessories',
      iconCode: 'watch',
    },
  ];

  const mockCategoryPageComponents = [
    {
      id: 'category-banner',
      type: 'banner',
      title: '카테고리 배너',
      content: {
        image: 'category-banner.jpg',
        text: '다양한 카테고리를 탐색하세요',
      },
    },
    {
      id: 'category-grid',
      type: 'category-grid',
      title: '카테고리 목록',
      content: {
        categories: mockCategoryOptions,
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();
    mockConsoleLog.mockClear();
    // Reset NODE_ENV to test (default for Jest)
    (process.env as any).NODE_ENV = 'test';
  });

  describe('클래스 인스턴스화', () => {
    it('CategoriesService 클래스를 인스턴스화할 수 있어야 한다', () => {
      const service = new CategoriesService();
      expect(service).toBeInstanceOf(CategoriesService);
      expect(typeof service.getCategoriesPageData).toBe('function');
      expect(typeof service.getCategoriesForProductForm).toBe('function');
    });

    it('싱글톤 인스턴스가 제공되어야 한다', () => {
      expect(categoriesService).toBeInstanceOf(CategoriesService);
    });
  });

  describe('getCategoriesPageData', () => {
    it('카테고리 페이지 데이터를 성공적으로 가져와야 한다', async () => {
      const mockApiResponse = {
        data: {
          components: mockCategoryPageComponents,
        },
      };

      mockKongApiClient.getCategories.mockResolvedValue(mockApiResponse);

      const result = await categoriesService.getCategoriesPageData();

      expect(mockKongApiClient.getCategories).toHaveBeenCalledWith({
        headers: undefined,
      });
      expect(result).toEqual({
        components: mockCategoryPageComponents,
      });
    });

    it('헤더 옵션과 함께 데이터를 가져와야 한다', async () => {
      const mockApiResponse = {
        data: {
          components: mockCategoryPageComponents,
        },
      };

      const customHeaders = {
        Authorization: 'Bearer token123',
        'X-User-ID': 'user456',
      };

      mockKongApiClient.getCategories.mockResolvedValue(mockApiResponse);

      const result = await categoriesService.getCategoriesPageData({
        headers: customHeaders,
      });

      expect(mockKongApiClient.getCategories).toHaveBeenCalledWith({
        headers: customHeaders,
      });
      expect(result).toEqual({
        components: mockCategoryPageComponents,
      });
    });

    it('components가 없는 경우 빈 배열을 반환해야 한다', async () => {
      const mockApiResponse = {
        data: {},
      };

      mockKongApiClient.getCategories.mockResolvedValue(mockApiResponse);

      const result = await categoriesService.getCategoriesPageData();

      expect(result).toEqual({
        components: [],
      });
    });

    it('API 호출 실패시 에러를 던져야 한다', async () => {
      const apiError = new Error('API connection failed');
      mockKongApiClient.getCategories.mockRejectedValue(apiError);

      await expect(categoriesService.getCategoriesPageData()).rejects.toThrow(
        'Failed to fetch categories page data',
      );

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to fetch categories page data:',
        apiError,
      );
    });
  });

  describe('getCategoriesForProductForm', () => {
    it('상품 폼용 카테고리를 성공적으로 가져와야 한다', async () => {
      mockKongApiClient.getCategoriesForProductForm.mockResolvedValue(mockCategoryOptions);

      const result = await categoriesService.getCategoriesForProductForm();

      expect(mockKongApiClient.getCategoriesForProductForm).toHaveBeenCalledWith({
        headers: undefined,
      });
      expect(result).toEqual({
        success: true,
        data: mockCategoryOptions,
      });
    });

    it('헤더 옵션과 함께 카테고리를 가져와야 한다', async () => {
      const customHeaders = {
        'Content-Type': 'application/json',
      };

      mockKongApiClient.getCategoriesForProductForm.mockResolvedValue(mockCategoryOptions);

      const result = await categoriesService.getCategoriesForProductForm({
        headers: customHeaders,
      });

      expect(mockKongApiClient.getCategoriesForProductForm).toHaveBeenCalledWith({
        headers: customHeaders,
      });
      expect(result).toEqual({
        success: true,
        data: mockCategoryOptions,
      });
    });

    it('BaseError 발생시 에러 메시지를 포함한 실패 응답을 반환해야 한다', async () => {
      const baseError = new BaseError(
        ErrorCode.EXTERNAL_SERVICE_ERROR,
        'External service unavailable',
        undefined,
        503,
      );

      mockKongApiClient.getCategoriesForProductForm.mockRejectedValue(baseError);

      const result = await categoriesService.getCategoriesForProductForm();

      expect(result).toEqual({
        success: false,
        error: 'External service unavailable',
      });
      expect(mockConsoleError).toHaveBeenCalledWith('Failed to fetch categories:', baseError);
    });

    it('일반 Error 발생시 에러 메시지를 포함한 실패 응답을 반환해야 한다', async () => {
      const generalError = new Error('Network timeout');
      mockKongApiClient.getCategoriesForProductForm.mockRejectedValue(generalError);

      const result = await categoriesService.getCategoriesForProductForm();

      expect(result).toEqual({
        success: false,
        error: 'Network timeout',
      });
    });

    it('알 수 없는 에러 발생시 기본 메시지를 반환해야 한다', async () => {
      mockKongApiClient.getCategoriesForProductForm.mockRejectedValue('String error');

      const result = await categoriesService.getCategoriesForProductForm();

      expect(result).toEqual({
        success: false,
        error: 'Failed to fetch categories',
      });
    });
  });

  describe('fetchCategories (함수형 API)', () => {
    const mockResponse = (status: number, data: any): { ok: boolean; status: number; json: jest.Mock } => ({
      ok: status >= 200 && status < 300,
      status,
      json: jest.fn().mockResolvedValue(data),
    });

    it('카테고리를 성공적으로 가져와야 한다', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, mockCategoryOptions) as any);

      const result = await fetchCategories();

      expect(mockFetch).toHaveBeenCalledWith('/next-api/account/add-product/categories', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      expect(result).toEqual({
        success: true,
        data: mockCategoryOptions,
      });
    });

    it('서버 에러 응답시 BaseError를 던지고 실패 응답을 반환해야 한다', async () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = 'development';
      
      try {
        const errorData = { error: 'Categories not found' };
        mockFetch.mockResolvedValue(mockResponse(404, errorData) as any);

        const result = await fetchCategories();

        expect(result).toEqual({
          success: false,
          error: 'Categories not found',
        });
        // 에러 데이터는 development 환경에서만 로깅됨
        expect(mockConsoleLog).toHaveBeenCalledWith(errorData);
      } finally {
        (process.env as any).NODE_ENV = originalEnv;
      }
    });

    it('서버 에러 응답에 에러 메시지가 없는 경우 기본 메시지를 사용해야 한다', async () => {
      mockFetch.mockResolvedValue(mockResponse(500, {}) as any);

      const result = await fetchCategories();

      expect(result).toEqual({
        success: false,
        error: 'Failed to fetch categories',
      });
    });

    it('응답 JSON 파싱 실패시 기본 에러 메시지를 사용해야 한다', async () => {
      const mockBadResponse = {
        ok: false,
        status: 500,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      };

      mockFetch.mockResolvedValue(mockBadResponse as any);

      const result = await fetchCategories();

      expect(result).toEqual({
        success: false,
        error: 'Failed to fetch categories',
      });
    });

    it('fetch 자체가 실패할 때 에러를 처리해야 한다', async () => {
      const networkError = new Error('Network error');
      mockFetch.mockRejectedValue(networkError);

      const result = await fetchCategories();

      expect(result).toEqual({
        success: false,
        error: 'Network error',
      });
      expect(mockConsoleError).toHaveBeenCalledWith('Error fetching categories:', networkError);
    });

    it('알 수 없는 타입의 에러가 발생할 때 기본 메시지를 사용해야 한다', async () => {
      mockFetch.mockRejectedValue('Unknown error');

      const result = await fetchCategories();

      expect(result).toEqual({
        success: false,
        error: 'Failed to fetch categories',
      });
    });

    it('development 환경에서 에러 데이터를 로깅해야 한다', async () => {
      // Mock the environment to 'development'
      const originalEnv = process.env.NODE_ENV;
      
      // Use direct assignment which should work for the test
      (process.env as any).NODE_ENV = 'development';
      
      try {
        const errorData = { error: 'Test error', details: 'Additional info' };
        mockFetch.mockResolvedValue(mockResponse(400, errorData) as any);

        await fetchCategories();

        expect(mockConsoleLog).toHaveBeenCalledWith(errorData);
      } finally {
        // Restore original env
        (process.env as any).NODE_ENV = originalEnv;
      }
    });

    it('production 환경에서는 에러 데이터를 로깅하지 않아야 한다', async () => {
      const originalEnv = process.env.NODE_ENV;
      
      // Use direct assignment for production test as well
      (process.env as any).NODE_ENV = 'production';

      try {
        const errorData = { error: 'Test error' };
        mockFetch.mockResolvedValue(mockResponse(400, errorData) as any);

        await fetchCategories();

        expect(mockConsoleLog).not.toHaveBeenCalled();
      } finally {
        // Restore original env
        (process.env as any).NODE_ENV = originalEnv;
      }
    });
  });

  describe('타입 안전성', () => {
    it('getCategoriesPageData가 올바른 타입을 반환해야 한다', async () => {
      const mockApiResponse = {
        data: {
          components: mockCategoryPageComponents,
        },
      };

      mockKongApiClient.getCategories.mockResolvedValue(mockApiResponse);

      const result: CategoryPageData = await categoriesService.getCategoriesPageData();

      expect(result).toHaveProperty('components');
      expect(Array.isArray(result.components)).toBe(true);
    });

    it('getCategoriesForProductForm이 올바른 타입을 반환해야 한다', async () => {
      mockKongApiClient.getCategoriesForProductForm.mockResolvedValue(mockCategoryOptions);

      const result: CategoriesResponse = await categoriesService.getCategoriesForProductForm();

      expect(result).toHaveProperty('success');
      expect(typeof result.success).toBe('boolean');
      expect(result.success).toBe(true);
      
      // 성공 응답의 데이터 구조 검증
      expect(result).toHaveProperty('data');
      expect(Array.isArray((result as any).data)).toBe(true);
    });

    it('getCategoriesForProductForm이 실패 응답 타입을 올바르게 반환해야 한다', async () => {
      const testError = new Error('Test error');
      mockKongApiClient.getCategoriesForProductForm.mockRejectedValue(testError);

      const result: CategoriesResponse = await categoriesService.getCategoriesForProductForm();

      expect(result).toHaveProperty('success');
      expect(typeof result.success).toBe('boolean');
      expect(result.success).toBe(false);
      
      // 실패 응답의 에러 구조 검증
      expect(result).toHaveProperty('error');
      expect(typeof (result as any).error).toBe('string');
    });

    it('fetchCategories가 올바른 타입을 반환해야 한다', async () => {
      const mockResponseValue = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockCategoryOptions),
      };
      mockFetch.mockResolvedValue(mockResponseValue as any);

      const result: CategoriesResponse = await fetchCategories();

      expect(result).toHaveProperty('success');
      expect(typeof result.success).toBe('boolean');
    });
  });

  describe('에러 처리 통합', () => {
    it('모든 메서드에서 일관된 에러 처리를 해야 한다', async () => {
      const error = new Error('Consistent error');

      // getCategoriesPageData 에러
      mockKongApiClient.getCategories.mockRejectedValue(error);
      await expect(categoriesService.getCategoriesPageData()).rejects.toThrow();

      // getCategoriesForProductForm 에러
      mockKongApiClient.getCategoriesForProductForm.mockRejectedValue(error);
      const productFormResult = await categoriesService.getCategoriesForProductForm();
      expect(productFormResult.success).toBe(false);

      // fetchCategories 에러
      mockFetch.mockRejectedValue(error);
      const fetchResult = await fetchCategories();
      expect(fetchResult.success).toBe(false);

      // 모든 에러가 콘솔에 로깅되었는지 확인
      expect(mockConsoleError).toHaveBeenCalledTimes(3);
    });
  });
});
