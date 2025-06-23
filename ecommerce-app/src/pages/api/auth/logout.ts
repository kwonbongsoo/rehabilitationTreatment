import { clearAuthCookies } from '@/services';
import type { LogoutResponse } from '../../../api/models/auth';
import { createProxyHandler } from '../../../api/proxy';

// 로그아웃 API 프록시 핸들러
export default createProxyHandler({
  method: 'POST',
  targetPath: '/api/auth/logout',
  includeAuth: true, // 로그아웃 시 토큰 필요
  logPrefix: '🚪',
  transformResponse: (data: LogoutResponse): LogoutResponse => {
    return {
      success: data.success,
      message: '로그아웃되었습니다.',
    };
  },
  setCookies: (res, originalData) => {
    // 로그아웃 시 인증 쿠키 제거
    clearAuthCookies(res);
  },
});
