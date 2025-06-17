// Proxy 방법 선택
// 'api-routes': /api/proxy/* 경로를 사용한 API Routes 프록시
// 'rewrites': /api/gateway/* 경로를 사용한 Next.js rewrites 프록시
export const PROXY_METHOD = process.env.NEXT_PUBLIC_PROXY_METHOD || 'api-routes';

// 🔒 보안상 모든 환경에서 개별 프록시 함수 사용 (HttpOnly 쿠키 보호)
export const API_BASE_URL = '/api'; // 개발/운영 모든 환경에서 개별 프록시 함수 경로

export const API_TIMEOUT = 5000; // 5초

// 주의: targetPath에는 /api가 포함되지 않음 (Kong Gateway에서 /api 접두사 추가)
export const KONG_GATEWAY_URL = process.env.KONG_GATEWAY_URL || 'http://localhost:8000';

// 환경별 설정
export const getApiConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    useMocks: process.env.NEXT_PUBLIC_USE_MOCKS === 'true',
    logApiCalls: !isProduction,
    retryCount: isProduction ? 2 : 0,
    useIndividualProxies: true, // 🔒 모든 환경에서 개별 프록시 사용 (보안 강화)
  };
};
