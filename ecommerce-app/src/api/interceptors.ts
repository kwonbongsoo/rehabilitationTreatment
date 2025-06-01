import { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { tokenUtils } from '../hooks/queries/useAuth';
import { getApiConfig } from './config';
import { createAuthRepository } from './repository/authRepository';
import { createBasicApiClient } from './client';

// 멱등성 키 관리 유틸리티
export const idempotencyUtils = {
    /**
     * 요청에 멱등성 키가 필요한지 확인
     */
    needsIdempotencyKey: (method: string, url: string): boolean => {
        const idempotentMethods = ['POST', 'PUT', 'PATCH'];

        // 회원가입, 결제, 주문 등 멱등성이 중요한 엔드포인트
        const criticalEndpoints = [
            '/auth/register',
            '/auth/login'
        ];

        return (
            idempotentMethods.includes(method.toUpperCase()) &&
            criticalEndpoints.some((endpoint) => url.includes(endpoint))
        );
    },

    /**
     * 멱등성 키 헤더 추가
     */
    addIdempotencyHeader: (
        config: InternalAxiosRequestConfig,
        key: string
    ): InternalAxiosRequestConfig => {
        config.headers = config.headers || {};
        config.headers['X-Idempotency-Key'] = key;
        return config;
    },
};

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

            // 멱등성 키 자동 추가 (커스텀 헤더가 없는 경우)
            if (config.method && config.url &&
                idempotencyUtils.needsIdempotencyKey(config.method, config.url) &&
                !config.headers['X-Idempotency-Key']) {

                // 요청 데이터에서 멱등성 키 확인 (임시 해결책)
                const requestData = config.data as any;
                if (requestData && requestData._idempotencyKey) {
                    idempotencyUtils.addIdempotencyHeader(config, requestData._idempotencyKey);
                    // 실제 요청 데이터에서 멱등성 키 제거
                    delete requestData._idempotencyKey;
                }
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