import { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getLocalToken, refreshToken, clearToken } from '../store/authStore';
import { getApiConfig } from './config';

export const setupInterceptors = (client: AxiosInstance): void => {
    const apiConfig = getApiConfig();

    // 요청 인터셉터
    client.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            // 로깅 (개발용)
            if (apiConfig.logApiCalls) {
                console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, config);
            }

            // 인증 토큰 추가
            const token = getLocalToken();
            if (token && !config.headers.Authorization) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        },
        (error: AxiosError) => Promise.reject(error)
    );

    // 응답 인터셉터
    client.interceptors.response.use(
        (response: AxiosResponse) => {
            // 로깅 (개발용)
            if (apiConfig.logApiCalls) {
                console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
            }

            return response;
        },
        async (error: AxiosError) => {
            const originalRequest = error.config as any;

            // 토큰 만료 처리 (401)
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    // 토큰 갱신 시도
                    const newToken = await refreshToken();
                    if (newToken) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return client(originalRequest);
                    }
                } catch (refreshError) {
                    // 갱신 실패 시 로그아웃
                    clearToken();
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }

            // 로깅 (개발용)
            if (apiConfig.logApiCalls) {
                console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, error.response?.data || error.message);
            }

            return Promise.reject(error);
        }
    );
};