import got, { HTTPError, RequestError, TimeoutError } from 'got';
import { HttpClient, HttpConfig } from '../interfaces/http';

export class GotHttpAdapter implements HttpClient {
    private client: typeof got;

    constructor(private config: HttpConfig) {
        this.client = got.extend({
            prefixUrl: config.baseUrl,
            timeout: { request: config.timeout },
            headers: config.headers || {
                'content-type': 'application/json',
                'user-agent': 'koa-auth-server'
            },
            retry: {
                limit: config.retries || 2,
                methods: ['GET', 'POST', 'PUT'],
                statusCodes: [408, 429, 500, 502, 503, 504]
            },
            responseType: 'json'
        });
    }

    async get<T>(url: string, options?: any): Promise<T> {
        try {
            const response = await this.client.get(url, options);
            return response.body as T;
        } catch (error) {
            throw this.transformError(error);
        }
    }

    async post<T>(url: string, options?: any): Promise<T> {
        try {
            const response = await this.client.post(url, options);
            return response.body as T;
        } catch (error) {
            throw this.transformError(error);
        }
    }

    async put<T>(url: string, options?: any): Promise<T> {
        try {
            const response = await this.client.post(url, options);
            return response.body as T;
        } catch (error) {
            throw this.transformError(error);
        }
    }

    async delete<T>(url: string, options?: any): Promise<T> {
        try {
            const response = await this.client.post(url, options);
            return response.body as T;
        } catch (error) {
            throw this.transformError(error);
        }
    }

    // put, delete 메서드도 유사하게 구현...

    private transformError(error: unknown): Error {
        // GotHttpAdapter에 특화된 오류 변환 로직
        // HttpServiceError로 래핑하여 반환
        // 이 부분은 ApiErrorHandler로 이동할 수도 있음
        return new Error('HTTP request failed');
    }
}