export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
export const API_TIMEOUT = 30000; // 30초

// 환경별 설정
export const getApiConfig = () => {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
        useMocks: process.env.NEXT_PUBLIC_USE_MOCKS === 'true',
        logApiCalls: !isProduction,
        retryCount: isProduction ? 2 : 0,
    };
};