import kongApiClient from '@/infrastructure/clients/kongApiClient';
import type { CategoryPageData } from '../types/categories';
import { BaseError, ErrorCode } from '@ecommerce/common';

interface ServiceCallOptions {
  headers?: Record<string, string>;
}

interface CategoryOption {
  id: number;
  name: string;
  slug: string;
  iconCode: string;
}

interface CategoriesResponse {
  success: boolean;
  data?: CategoryOption[];
  error?: string;
}

class CategoriesService {
  async getCategoriesPageData(options?: ServiceCallOptions): Promise<CategoryPageData> {
    try {
      const response = await kongApiClient.getCategories({
        headers: options?.headers,
      });
      // API 응답을 도메인 모델로 변환
      return {
        components: response.data.components || [],
      };
    } catch (error) {
      console.error('Failed to fetch categories page data:', error);
      throw new Error('Failed to fetch categories page data');
    }
  }

  async getCategoriesForProductForm(options?: ServiceCallOptions): Promise<CategoriesResponse> {
    try {
      const categories = await kongApiClient.getCategoriesForProductForm({
        headers: options?.headers,
      });

      return {
        success: true,
        data: categories,
      };
    } catch (error) {
      console.error('Failed to fetch categories:', error);

      // @ecommerce/common 에러 처리 사용
      const userMessage =
        error instanceof BaseError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Failed to fetch categories';

      return {
        success: false,
        error: userMessage,
      };
    }
  }
}

// 싱글톤 인스턴스 생성
const categoriesService = new CategoriesService();

// 기존 함수형 API 유지 (하위 호환성) - 클라이언트용
export async function fetchCategories(): Promise<CategoriesResponse> {
  try {
    const response = await fetch(`/next-api/account/add-product/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      // 서버 에러 메시지를 가져와서 BaseError로 throw
      const errorData = await response
        .json()
        .catch(() => ({ error: 'Failed to fetch categories' }));
      if (process.env.NODE_ENV === 'development') {
        console.log(errorData);
      }
      throw new BaseError(
        ErrorCode.EXTERNAL_SERVICE_ERROR,
        errorData.error || 'Failed to fetch categories',
        undefined,
        response.status,
      );
    }

    const categories: CategoryOption[] = await response.json();

    return {
      success: true,
      data: categories,
    };
  } catch (error) {
    console.error('Error fetching categories:', error);

    // 에러 타입별 메시지 처리
    let errorMessage: string;
    if (error instanceof Error) {
      // 서버에서 내려준 에러 메시지 (throw된 Error)
      errorMessage = error.message;
    } else {
      // 기타 에러
      errorMessage = 'Failed to fetch categories';
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export default categoriesService;
export { CategoriesService };
export type { CategoryOption, CategoriesResponse };
