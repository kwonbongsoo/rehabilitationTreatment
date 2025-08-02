import { BaseError, ErrorCode } from '@ecommerce/common';

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

class HttpClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(
    baseURL: string,
    options: {
      timeout?: number;
      headers?: Record<string, string>;
    } = {},
  ) {
    this.baseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    this.defaultTimeout = options.timeout || 5000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  }

  async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
    } = options;

    const url = `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const requestHeaders = {
        ...this.defaultHeaders,
        ...headers,
      };

      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
        signal: controller.signal,
      };

      if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 HTTP Request: ${method} ${url}`);
        console.log('📋 Request Headers:', requestHeaders);
        if (body) {
          console.log('📦 Request Body:', body);
        }
      }

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }

        throw new BaseError(
          ErrorCode.EXTERNAL_SERVICE_ERROR,
          `HTTP ${response.status}: ${errorData.message || response.statusText}`,
          {
            reason: 'http_error',
            context: {
              url,
              status: response.status,
              response: errorData,
            },
          },
          response.status
        );
      }

      const responseText = await response.text();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ HTTP Response: ${response.status}`);
        console.log('📄 Response Body:', responseText);
      }

      if (!responseText) {
        return {} as T;
      }

      try {
        return JSON.parse(responseText) as T;
      } catch (parseError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ JSON Parse Error:', parseError);
        }
        throw new BaseError(
          ErrorCode.INTERNAL_ERROR,
          'Failed to parse response JSON',
          {
            reason: 'json_parse_error',
            context: parseError instanceof Error ? parseError.message : 'Unknown error',
          },
          500
        );
      }
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new BaseError(
          ErrorCode.TIMEOUT_ERROR,
          `Request timeout after ${timeout}ms`,
          {
            reason: 'request_timeout',
            context: {
              url,
              timeout,
            },
          },
          408
        );
      }

      throw new BaseError(
        ErrorCode.EXTERNAL_SERVICE_ERROR,
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          reason: 'network_error',
          context: {
            url,
            originalError: error,
          },
        },
        500
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async get<T>(endpoint: string, options?: Omit<FetchOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    body?: any,
    options?: Omit<FetchOptions, 'method' | 'body'>,
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T>(
    endpoint: string,
    body?: any,
    options?: Omit<FetchOptions, 'method' | 'body'>,
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async patch<T>(
    endpoint: string,
    body?: any,
    options?: Omit<FetchOptions, 'method' | 'body'>,
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  async delete<T>(endpoint: string, options?: Omit<FetchOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export default HttpClient;