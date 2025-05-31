export interface HttpClient {
    get<T>(url: string, options?: any): Promise<T>;
    post<T>(url: string, options?: any): Promise<T>;
    put<T>(url: string, options?: any): Promise<T>;
    delete<T>(url: string, options?: any): Promise<T>;
}

export interface HttpConfig {
    baseUrl: string;
    timeout: number;
    headers?: Record<string, string>;
    retries?: number;
}

export interface HttpResponse<T> {
    data: T;
    status: number;
    headers: Record<string, string>;
}

export interface ErrorDetails {
    code: string;
    message: string;
    serviceName: string;
    statusCode?: number;
    originalError?: Error;
}