import { createProxyHandler } from '../../../utils/proxyUtils';

// 로그아웃 API 프록시 핸들러
export default createProxyHandler({
  method: 'POST',
  targetPath: '/api/auth/logout',
  includeAuth: true, // 로그아웃 시 토큰 필요
  logPrefix: '🚪',
});
