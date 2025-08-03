import kongApiClient from '@/infrastructure/clients/kongApiClient';
import type { HomePageResponse } from '../types/home';

interface ServiceCallOptions {
  headers?: Record<string, string>;
}

class HomeService {
  async getHomePageData(options?: ServiceCallOptions): Promise<HomePageResponse> {
    try {
      const { data } = await kongApiClient.getHomePageData({
        headers: options?.headers,
      });

      // API 응답을 도메인 모델로 변환
      return {
        components: data?.components || [],
      };
    } catch (error) {
      console.error('Failed to fetch home page data:', error);
      throw new Error('Failed to fetch home page data');
    }
  }
}

// 싱글톤 인스턴스 생성
const homeService = new HomeService();

export default homeService;
export { HomeService };
