import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from './config';
import { setupInterceptors } from './interceptors';
import { ApiError } from './types';

export class ApiClient {
    private client: AxiosInstance;

    constructor(config?: AxiosRequestConfig) {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: API_TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
                ...(config?.headers || {}) // 헤더 병합
            },
            ...config // 다른 설정 옵션 병합
        });

        setupInterceptors(this.client);
    }

    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.client.get<T>(url, config);
            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.client.post<T>(url, data, config);
            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.client.put<T>(url, data, config);
            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.client.delete<T>(url, config);
            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    // 멱등성을 위한 메서드
    public async postWithIdempotency<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const idempotencyKey = crypto.randomUUID();
        const headers = {
            ...config?.headers,
            'X-Idempotency-Key': idempotencyKey,
        };

        return this.post<T>(url, data, { ...config, headers });
    }

    private handleError(error: unknown): never {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;

            if (axiosError.response) {
                // 서버에서 응답이 왔지만 오류 상태코드
                const status = axiosError.response.status;
                const data = axiosError.response.data as any;

                if (status === 401) {
                    // 로그인 페이지로 리다이렉트 또는 토큰 재발급 시도
                    // window.location.href = '/login';
                }

                throw new ApiError(
                    data.message || '서버에서 오류가 발생했습니다',
                    status,
                    data
                );
            } else if (axiosError.request) {
                // 요청은 보냈지만 응답이 없음
                throw new ApiError('서버에 연결할 수 없습니다', 0);
            }
        }

        // 그 외 모든 오류
        throw new ApiError('알 수 없는 오류가 발생했습니다', 0);
    }
}

// 팩토리 함수 수정 - 설정 객체 매개변수 추가
export const createApiClient = (config?: AxiosRequestConfig) => new ApiClient(config);