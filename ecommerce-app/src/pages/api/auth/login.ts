import { createProxyHandler } from '../../../utils/proxyUtils';
import { omitTokens } from '../../../utils/formatters';
import { setLoginCookies } from '@/services';
import type { ProxyLoginResponse, LoginResponse } from '../../../api/models/auth';

// 로그인 API 프록시 핸들러
export default createProxyHandler({
  method: 'POST',
  targetPath: '/api/auth/login',
  includeAuth: true, // 인증 헤더 포함
  useBasicAuth: true, // Basic 인증 사용 (미들웨어와 동일)
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
    // 토큰 관련 데이터를 깊이 있게 제거 (클라이언트로 전송하지 않음)
    return omitTokens(data) as LoginResponse;
  },
  setCookies: (res, originalData) => {
    // 공통 유틸리티를 사용하여 쿠키 설정
    setLoginCookies(res, originalData);
  },
});
