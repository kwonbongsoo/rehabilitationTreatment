'use server';

import { CategoryPageActionResult } from '../types';
import { HeaderBuilderFactory } from '@/lib/server/headerBuilder';
import { handleApiResponse, handleActionError } from '@/lib/server/errorHandler';

/**
 * 카테고리 페이지 데이터 조회 서버 액션
 *
 * - Kong API Gateway를 통해 BFF 서버의 카테고리 데이터를 가져옴
 * - 클라이언트에서 호출 가능하지만 서버에서 실행됨
 * - 내부 네트워크 통신으로 Kong에 접근
 */

const KONG_GATEWAY_URL = process.env.KONG_GATEWAY_URL;

export async function getCategoriesAction(): Promise<CategoryPageActionResult> {
  try {
    const headers = await HeaderBuilderFactory.createForApiRequest().build();
    const response = await fetch(`${KONG_GATEWAY_URL}/api/categories`, {
      method: 'GET',
      headers,
      next: { revalidate: 60 }, // 1분 캐시
    });

    const result = await handleApiResponse(response, (json) => {
      if (!json.success || !json.data) {
        throw new Error('Invalid response format');
      }
      return json.data;
    });

    return result as CategoryPageActionResult;
  } catch (error) {
    console.error('[서버액션] 카테고리 조회 에러:', error);
    return handleActionError(error) as CategoryPageActionResult;
  }
}
