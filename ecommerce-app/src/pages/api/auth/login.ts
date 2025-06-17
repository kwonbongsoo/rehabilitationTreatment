import { createProxyHandler } from '../../../utils/proxyUtils';

// 로그인 API 프록시 핸들러
export default createProxyHandler({
  method: 'POST',
  targetPath: '/api/auth/login',
  includeAuth: false, // 로그인 시에는 토큰이 없음
  logPrefix: '🔐',
  validateRequest: (req) => {
    const { id, password } = req.body || {};
    if (!id || !password) {
      return {
        isValid: false,
        error: 'ID and password are required',
      };
    }
    return { isValid: true };
  },
});
