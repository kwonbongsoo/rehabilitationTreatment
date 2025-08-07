import { CategoryPageResponse, HomePageResult } from '@/types';
import { Category } from '@/domains/category/types/categories';
import { HttpClient, FetchOptions } from '@ecommerce/common';

interface KongApiClientOptions {
  timeout?: number;
  headers?: Record<string, string>;
}

interface ApiCallOptions {
  headers?: Record<string, string> | undefined;
}

class KongApiClient extends HttpClient {
  constructor(options: KongApiClientOptions = {}) {
    // 서버사이드: KONG_GATEWAY_URL, 클라이언트사이드: NEXT_PUBLIC_PROXY_API_URL
    const getBaseURL = (): string => {
      if (typeof window === 'undefined') {
        // 서버사이드
        return process.env.KONG_GATEWAY_URL || 'http://localhost:8000';
      } else {
        // 클라이언트사이드
        return process.env.NEXT_PUBLIC_PROXY_API_URL || 'http://localhost:9000';
      }
    };

    const baseURL = getBaseURL();

    super(baseURL, {
      timeout: options.timeout || 5000,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  // Categories API (BFF) - 카테고리 페이지용 (UI 컴포넌트와 상품 포함)
  async getCategories(options?: ApiCallOptions): Promise<CategoryPageResponse> {
    const requestOptions: Record<string, unknown> = {};
    if (options?.headers) {
      requestOptions.headers = options.headers;
    }
    return await this.get('/api/categories', requestOptions);
  }

  // Categories API (Product Domain) - 상품 등록 폼용 (간단한 카테고리 목록만)
  async getCategoriesForProductForm(options?: ApiCallOptions): Promise<Category[]> {
    const requestOptions: Record<string, unknown> = {};
    if (options?.headers) {
      requestOptions.headers = options.headers;
    }
    // Next.js API route that calls product domain directly
    return await this.get('/api/v1/categories', requestOptions);
  }

  // Home page data
  async getHomePageData(options?: ApiCallOptions): Promise<HomePageResult> {
    const requestOptions: Record<string, unknown> = {};
    if (options?.headers) {
      requestOptions.headers = options.headers;
    }
    return await this.get('/api/home', requestOptions);
  }

  // BFF API - 상품 등록
  async createProduct(formData: any, options?: ApiCallOptions): Promise<any> {
    const requestOptions: Record<string, unknown> = {};
    if (options?.headers) {
      requestOptions.headers = options.headers;
    }
    return await this.post('/api/products', formData, requestOptions);
  }

  // BFF API - 상품 등록 (서버 환경용 멀티파트)
  async createProductMultiPart(formData: FormData, options?: ApiCallOptions): Promise<any> {
    const requestOptions: FetchOptions = {};
    if (options?.headers) {
      requestOptions.headers = options.headers;
    }
    return await this.requestMultiPartServer('/api/products', formData, requestOptions);
  }
}

// 싱글톤 인스턴스 생성
const kongApiClient = new KongApiClient();

export default kongApiClient;
export { KongApiClient };
