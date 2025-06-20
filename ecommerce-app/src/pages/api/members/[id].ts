import { createMultiMethodProxyHandler } from '../../../api/proxy';

// 개별 멤버 조회, 수정, 삭제 API 프록시 핸들러
export default createMultiMethodProxyHandler({
  GET: {
    targetPath: '/api/members/:id',
    includeAuth: true,
    logPrefix: '👤',
    transformRequest: (body) => body,
    // URL에서 ID를 추출하여 경로에 삽입
    validateRequest: (req) => {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return {
          isValid: false,
          error: 'Invalid member ID',
        };
      }
      return { isValid: true };
    },
  },
  PUT: {
    targetPath: '/api/members/:id',
    includeAuth: true,
    includeIdempotency: true,
    logPrefix: '✏️',
    validateRequest: (req) => {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return {
          isValid: false,
          error: 'Invalid member ID',
        };
      }
      return { isValid: true };
    },
  },
  DELETE: {
    targetPath: '/api/members/:id',
    includeAuth: true,
    logPrefix: '🗑️',
    validateRequest: (req) => {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return {
          isValid: false,
          error: 'Invalid member ID',
        };
      }
      return { isValid: true };
    },
  },
});
