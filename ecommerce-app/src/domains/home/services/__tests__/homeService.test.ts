/**
 * HomeService 테스트
 * 
 * 홈페이지 데이터 서비스 로직을 테스트합니다.
 * 사이드이펙트 방지를 위해 외부 API 클라이언트를 모킹합니다.
 */

import homeService, { HomeService } from '../homeService';
import type { HomePageResponse } from '../../types/home';

// 외부 API 클라이언트 모킹
jest.mock('@/infrastructure/clients/kongApiClient', () => ({
  __esModule: true,
  default: {
    getHomePageData: jest.fn(),
  },
}));

// console.error 모킹
const mockConsoleError = jest.fn();
global.console.error = mockConsoleError;

describe('HomeService', () => {
  const mockKongApiClient = require('@/infrastructure/clients/kongApiClient').default;

  const mockComponentsData = [
    {
      id: 'hero-banner',
      type: 'hero',
      title: '메인 배너',
      content: {
        image: 'banner.jpg',
        text: '특별 할인 이벤트',
        link: '/events',
      },
      order: 1,
    },
    {
      id: 'featured-products',
      type: 'product-grid',
      title: '추천 상품',
      content: {
        products: [
          { id: '1', name: '상품 1', price: 10000 },
          { id: '2', name: '상품 2', price: 20000 },
        ],
      },
      order: 2,
    },
    {
      id: 'categories',
      type: 'category-list',
      title: '카테고리',
      content: {
        categories: [
          { id: 1, name: '의류' },
          { id: 2, name: '신발' },
        ],
      },
      order: 3,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();
  });

  describe('클래스 인스턴스화', () => {
    it('HomeService 클래스를 인스턴스화할 수 있어야 한다', () => {
      const service = new HomeService();
      expect(service).toBeInstanceOf(HomeService);
      expect(typeof service.getHomePageData).toBe('function');
    });

    it('싱글톤 인스턴스가 제공되어야 한다', () => {
      expect(homeService).toBeInstanceOf(HomeService);
      expect(typeof homeService.getHomePageData).toBe('function');
    });
  });

  describe('getHomePageData - 성공 케이스', () => {
    it('홈페이지 데이터를 성공적으로 가져와야 한다', async () => {
      const mockApiResponse = {
        data: {
          components: mockComponentsData,
        },
      };

      mockKongApiClient.getHomePageData.mockResolvedValue(mockApiResponse);

      const result = await homeService.getHomePageData();

      expect(mockKongApiClient.getHomePageData).toHaveBeenCalledWith({
        headers: undefined,
      });
      expect(result).toEqual({
        components: mockComponentsData,
      });
    });

    it('헤더 옵션과 함께 데이터를 가져와야 한다', async () => {
      const mockApiResponse = {
        data: {
          components: mockComponentsData,
        },
      };

      const customHeaders = {
        'X-Custom-Header': 'test-value',
        'Authorization': 'Bearer token123',
      };

      mockKongApiClient.getHomePageData.mockResolvedValue(mockApiResponse);

      const result = await homeService.getHomePageData({
        headers: customHeaders,
      });

      expect(mockKongApiClient.getHomePageData).toHaveBeenCalledWith({
        headers: customHeaders,
      });
      expect(result).toEqual({
        components: mockComponentsData,
      });
    });

    it('빈 components 배열도 올바르게 처리해야 한다', async () => {
      const mockApiResponse = {
        data: {
          components: [],
        },
      };

      mockKongApiClient.getHomePageData.mockResolvedValue(mockApiResponse);

      const result = await homeService.getHomePageData();

      expect(result).toEqual({
        components: [],
      });
    });

    it('data가 null인 경우 빈 배열을 반환해야 한다', async () => {
      const mockApiResponse = {
        data: null,
      };

      mockKongApiClient.getHomePageData.mockResolvedValue(mockApiResponse);

      const result = await homeService.getHomePageData();

      expect(result).toEqual({
        components: [],
      });
    });

    it('data가 undefined인 경우 빈 배열을 반환해야 한다', async () => {
      const mockApiResponse = {
        data: undefined,
      };

      mockKongApiClient.getHomePageData.mockResolvedValue(mockApiResponse);

      const result = await homeService.getHomePageData();

      expect(result).toEqual({
        components: [],
      });
    });

    it('components가 없는 경우 빈 배열을 반환해야 한다', async () => {
      const mockApiResponse = {
        data: {
          otherField: 'some value',
        },
      };

      mockKongApiClient.getHomePageData.mockResolvedValue(mockApiResponse);

      const result = await homeService.getHomePageData();

      expect(result).toEqual({
        components: [],
      });
    });
  });

  describe('getHomePageData - 에러 케이스', () => {
    it('API 호출 실패시 에러를 던져야 한다', async () => {
      const apiError = new Error('API Error: 500 Internal Server Error');
      mockKongApiClient.getHomePageData.mockRejectedValue(apiError);

      await expect(homeService.getHomePageData()).rejects.toThrow(
        'Failed to fetch home page data'
      );

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to fetch home page data:',
        apiError
      );
    });

    it('401 인증 에러도 적절히 처리해야 한다', async () => {
      const authError = new Error('Unauthorized');
      mockKongApiClient.getHomePageData.mockRejectedValue(authError);

      await expect(homeService.getHomePageData()).rejects.toThrow(
        'Failed to fetch home page data'
      );

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to fetch home page data:',
        authError
      );
    });

    it('네트워크 에러도 적절히 처리해야 한다', async () => {
      const networkError = new Error('Network Error');
      mockKongApiClient.getHomePageData.mockRejectedValue(networkError);

      await expect(homeService.getHomePageData()).rejects.toThrow(
        'Failed to fetch home page data'
      );

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to fetch home page data:',
        networkError
      );
    });

    it('타임아웃 에러도 적절히 처리해야 한다', async () => {
      const timeoutError = new Error('Request timeout');
      mockKongApiClient.getHomePageData.mockRejectedValue(timeoutError);

      await expect(homeService.getHomePageData()).rejects.toThrow(
        'Failed to fetch home page data'
      );
    });

    it('문자열 에러도 적절히 처리해야 한다', async () => {
      mockKongApiClient.getHomePageData.mockRejectedValue('String error');

      await expect(homeService.getHomePageData()).rejects.toThrow(
        'Failed to fetch home page data'
      );

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to fetch home page data:',
        'String error'
      );
    });

    it('null 에러도 적절히 처리해야 한다', async () => {
      mockKongApiClient.getHomePageData.mockRejectedValue(null);

      await expect(homeService.getHomePageData()).rejects.toThrow(
        'Failed to fetch home page data'
      );

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to fetch home page data:',
        null
      );
    });
  });

  describe('데이터 변환', () => {
    it('API 응답을 도메인 모델로 올바르게 변환해야 한다', async () => {
      const mockApiResponse = {
        data: {
          components: mockComponentsData,
          // 다른 필드들은 무시되어야 함
          metadata: {
            version: '1.0',
            timestamp: '2024-01-01T00:00:00Z',
          },
          extra: 'ignored',
        },
      };

      mockKongApiClient.getHomePageData.mockResolvedValue(mockApiResponse);

      const result = await homeService.getHomePageData();

      // 오직 components만 포함되어야 함
      expect(result).toEqual({
        components: mockComponentsData,
      });
      expect(result).not.toHaveProperty('metadata');
      expect(result).not.toHaveProperty('extra');
    });

    it('components 배열의 구조가 유지되어야 한다', async () => {
      const mockApiResponse = {
        data: {
          components: mockComponentsData,
        },
      };

      mockKongApiClient.getHomePageData.mockResolvedValue(mockApiResponse);

      const result = await homeService.getHomePageData();

      expect(result.components).toHaveLength(3);
      expect(result.components[0]).toHaveProperty('id', 'hero-banner');
      expect(result.components[0]).toHaveProperty('type', 'hero');
      expect(result.components[1]).toHaveProperty('id', 'featured-products');
      expect(result.components[2]).toHaveProperty('id', 'categories');
    });
  });

  describe('옵션 처리', () => {
    it('옵션 없이 호출할 수 있어야 한다', async () => {
      const mockApiResponse = {
        data: {
          components: [],
        },
      };

      mockKongApiClient.getHomePageData.mockResolvedValue(mockApiResponse);

      await homeService.getHomePageData();

      expect(mockKongApiClient.getHomePageData).toHaveBeenCalledWith({
        headers: undefined,
      });
    });

    it('빈 옵션 객체로 호출할 수 있어야 한다', async () => {
      const mockApiResponse = {
        data: {
          components: [],
        },
      };

      mockKongApiClient.getHomePageData.mockResolvedValue(mockApiResponse);

      await homeService.getHomePageData({});

      expect(mockKongApiClient.getHomePageData).toHaveBeenCalledWith({
        headers: undefined,
      });
    });

    it('빈 헤더 객체로 호출할 수 있어야 한다', async () => {
      const mockApiResponse = {
        data: {
          components: [],
        },
      };

      mockKongApiClient.getHomePageData.mockResolvedValue(mockApiResponse);

      await homeService.getHomePageData({ headers: {} });

      expect(mockKongApiClient.getHomePageData).toHaveBeenCalledWith({
        headers: {},
      });
    });
  });

  describe('메모리 누수 방지', () => {
    it('여러 번 호출해도 메모리 누수가 발생하지 않아야 한다', async () => {
      const mockApiResponse = {
        data: {
          components: mockComponentsData,
        },
      };

      mockKongApiClient.getHomePageData.mockResolvedValue(mockApiResponse);

      // 여러 번 호출
      const promises = Array.from({ length: 10 }, () => 
        homeService.getHomePageData()
      );

      const results = await Promise.all(promises);

      // 모든 결과가 동일해야 함
      results.forEach(result => {
        expect(result).toEqual({
          components: mockComponentsData,
        });
      });

      expect(mockKongApiClient.getHomePageData).toHaveBeenCalledTimes(10);
    });

    it('에러 발생 후에도 정상적으로 재호출할 수 있어야 한다', async () => {
      // 첫 번째 호출 - 실패
      mockKongApiClient.getHomePageData.mockRejectedValueOnce(
        new Error('First call failed')
      );

      await expect(homeService.getHomePageData()).rejects.toThrow(
        'Failed to fetch home page data'
      );

      // 두 번째 호출 - 성공
      const mockApiResponse = {
        data: {
          components: mockComponentsData,
        },
      };

      mockKongApiClient.getHomePageData.mockResolvedValue(mockApiResponse);

      const result = await homeService.getHomePageData();

      expect(result).toEqual({
        components: mockComponentsData,
      });
      expect(mockKongApiClient.getHomePageData).toHaveBeenCalledTimes(2);
    });
  });

  describe('타입 안전성', () => {
    it('반환 타입이 HomePageResponse 인터페이스를 준수해야 한다', async () => {
      const mockApiResponse = {
        data: {
          components: mockComponentsData,
        },
      };

      mockKongApiClient.getHomePageData.mockResolvedValue(mockApiResponse);

      const result: HomePageResponse = await homeService.getHomePageData();

      expect(result).toHaveProperty('components');
      expect(Array.isArray(result.components)).toBe(true);
    });
  });
});