import { createProxyHandler } from '../../../api/proxy';

// 멤버 인증 API 프록시 핸들러
export default createProxyHandler({
  method: 'POST',
  targetPath: '/api/members/verify',
  includeAuth: false, // 인증 전이므로 토큰 불필요
  logPrefix: '🔐',
  validateRequest: (req) => {
    const { id, password } = req.body || {};
    if (typeof id !== 'string' || typeof password !== 'string' || !id || !password) {
      return {
        isValid: false,
        error: 'Both id and password are required',
      };
    }
    return { isValid: true };
  },
});
