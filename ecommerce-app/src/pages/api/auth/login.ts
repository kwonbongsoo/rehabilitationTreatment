import { createProxyHandler } from '../../../utils/proxyUtils';
import type { ProxyLoginResponse, LoginResponse } from '../../../api/models/auth';

// 로그인 API 프록시 핸들러
export default createProxyHandler({
  method: 'POST',
  targetPath: '/api/auth/login',
  includeAuth: false, // 로그인 시에는 토큰이 없음
  logPrefix: '🔐',
  validateRequest: (req) => {
    const { id, password } = req.body || {};
    if (typeof id !== 'string' || typeof password !== 'string' || !id || !password) {
      return {
        isValid: false,
        error: 'ID and password are required',
      };
    }
    return { isValid: true };
  },
  transformResponse: (data: ProxyLoginResponse): LoginResponse => {
    // 토큰 관련 데이터 제거
    if (data && typeof data === 'object') {
      const { access_token, ...cleanData } = data as any;

      if (cleanData.data && typeof cleanData.data === 'object') {
        const { token, ...cleanNestedData } = cleanData.data;
        cleanData.data = cleanNestedData;
      }

      if (cleanData.user && typeof cleanData.user === 'object') {
        const { access_token: userAccessToken, ...cleanUserData } = cleanData.user;
        cleanData.user = cleanUserData;
      }

      return cleanData as LoginResponse;
    }
    return data as LoginResponse;
  },
});
