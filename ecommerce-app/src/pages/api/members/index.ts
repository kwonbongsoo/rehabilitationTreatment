import { createMultiMethodProxyHandler } from '../../../api/proxy';

// 멤버 목록 조회 및 생성 API 프록시 핸들러
export default createMultiMethodProxyHandler({
  GET: {
    targetPath: '/api/members',
    includeAuth: true,
    logPrefix: '👥',
  },
  POST: {
    targetPath: '/api/members',
    includeAuth: true,
    includeIdempotency: true, // 멤버 생성 시 멱등성 키 필요
    logPrefix: '➕',
    validateRequest: (req) => {
      const { id, email, name, password } = req.body || {};
      if (!id || !email || !name || !password) {
        return {
          isValid: false,
          error: 'id, email, name, and password are required',
        };
      }
      return { isValid: true };
    },
  },
});
