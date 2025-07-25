'use server';

import { HomePageResponse, HomePageActionResult } from '@/types/home';
import { HeaderBuilderFactory } from '@/lib/server/headerBuilder';
import { handleApiResponse, handleActionError } from '@/lib/server/errorHandler';

/**
 * 홈 페이지 데이터 조회 서버 액션
 *
 * - Kong API Gateway를 통해 BFF 서버의 홈 데이터를 가져옴
 * - 클라이언트에서 호출 가능하지만 서버에서 실행됨
 * - 내부 네트워크 통신으로 Kong에 접근
 */

const KONG_GATEWAY_URL = process.env.KONG_GATEWAY_URL;

export async function getHomeDataAction(): Promise<HomePageActionResult> {
  try {
    const headers = await HeaderBuilderFactory.createForApiRequest().build();

    const response = await fetch(`${KONG_GATEWAY_URL}/api/home`, {
      method: 'GET',
      headers,
      cache: 'no-store', // 항상 최신 데이터
    });

    return await handleApiResponse(response, (json) => {
      if (!json.success || !json.data) {
        throw new Error('Invalid response format');
      }
      return json.data as HomePageResponse;
    }) as HomePageActionResult;
  } catch (error) {
    return handleActionError(error) as HomePageActionResult;
  }
}
