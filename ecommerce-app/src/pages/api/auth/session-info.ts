import { createProxyHandler } from '../../../utils/proxyUtils';
import type { ProxySessionInfoResponse, SessionInfoResponse } from '../../../api/models/auth';

// 세션 정보 조회 API 프록시 핸들러
export default createProxyHandler({
  method: 'GET',
  targetPath: '/api/auth/session-info',
  includeAuth: true, // 세션 정보 조회 시 토큰 필요
  logPrefix: 'ℹ️',
  transformResponse: (data: ProxySessionInfoResponse): SessionInfoResponse => {
    // 토큰 관련 데이터 제거
    if (data && typeof data === 'object') {
      const { access_token, ...cleanData } = data as any;

      if (cleanData.data && typeof cleanData.data === 'object') {
        const { access_token: dataAccessToken, token, ...cleanNestedData } = cleanData.data;
        cleanData.data = cleanNestedData;
      }

      if (cleanData.user && typeof cleanData.user === 'object') {
        const { access_token: userAccessToken, ...cleanUserData } = cleanData.user;
        cleanData.user = cleanUserData;
      }

      return cleanData as SessionInfoResponse;
    }
    return data as SessionInfoResponse;
  },
});
