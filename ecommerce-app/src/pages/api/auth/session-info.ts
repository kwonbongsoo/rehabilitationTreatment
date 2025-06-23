import { createProxyHandler } from '../../../api/proxy';
import { omitTokens } from '../../../utils/formatters';
import type { ProxySessionInfoResponse, SessionInfoResponse } from '../../../api/models/auth';

// 세션 정보 조회 API 프록시 핸들러
export default createProxyHandler({
  method: 'GET',
  targetPath: '/api/auth/session-info',
  includeAuth: true, // 세션 정보 조회 시 토큰 필요
  logPrefix: 'ℹ️',
  transformResponse: (data: ProxySessionInfoResponse): SessionInfoResponse => {
    // 토큰 관련 데이터를 깊이 있게 제거
    return omitTokens(data) as SessionInfoResponse;
  },
});
