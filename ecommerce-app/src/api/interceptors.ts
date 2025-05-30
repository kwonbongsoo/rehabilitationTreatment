import { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { tokenUtils } from '../hooks/queries/useAuth';
import { getApiConfig } from './config';
import { createAuthRepository } from './repository/authRepository';
import { createBasicApiClient } from './client';

// 목적별 함수 분리
const createRefreshClient = () => {
    return createBasicApiClient();
};

const refreshApiClient = createRefreshClient();
const authRepo = createAuthRepository(refreshApiClient);

// 순수 함수로 분리하여 테스트 용이성 향상
async function refreshTokenSafe(): Promise<string | null> {
    try {
        const result = await authRepo.getRefreshToken();
        if (!result || !result.token) return null;

        const newToken = result.token;
        tokenUtils.setToken(newToken);
        return newToken;
    } catch (error) {
        tokenUtils.clearToken();
        return null;
    }
}

// 로깅 함수 분리
function logApiRequest(config: InternalAxiosRequestConfig): void {
    if (!getApiConfig().logApiCalls) return;

    console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
        config
    );
}

function logApiResponse(response: AxiosResponse): void {
    if (!getApiConfig().logApiCalls) return;

    console.log(
        `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`,
        response.data
    );
}

function logApiError(request: any, error: unknown): void {
    if (!getApiConfig().logApiCalls) return;

    console.error(
        `❌ API Error: ${request?.method?.toUpperCase()} ${request?.url}`,
        error instanceof AxiosError ? error.response?.data || error.message : error
    );
}

export const setupInterceptors = (client: AxiosInstance): void => {
    // 요청 인터셉터
    client.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            logApiRequest(config);

            const token = tokenUtils.getToken();
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
            logApiResponse(response);
            return response;
        },

        async (error: AxiosError) => {
            const originalRequest = error.config as any;

            // 토큰 갱신 전략 개선 - 명확한 조건 분리
            const isUnauthorized = error.response?.status === 401;
            const isRetryNeeded = !originalRequest._retry;

            if (isUnauthorized && isRetryNeeded) {
                originalRequest._retry = true;

                try {
                    const newToken = await refreshTokenSafe();
                    if (newToken) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return client(originalRequest);
                    }
                } catch (refreshError) {
                    tokenUtils.clearToken();

                    if (typeof window !== 'undefined') {
                        window.location.href = '/login';
                    }
                }
            }

            logApiError(originalRequest, error);
            return Promise.reject(error);
        }
    );
};