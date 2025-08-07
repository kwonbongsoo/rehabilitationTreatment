import { BaseError, ErrorCode } from '../errors';

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
    const { method = 'GET', headers = {}, body, timeout = this.defaultTimeout } = options;

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
          response.status,
        );
      }

      const responseText = await response.text();

      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ HTTP Response: ${response.status}`);
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
          500,
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
          408,
        );
      }

      // 연결 오류인지 확인
      if (
        error instanceof Error &&
        (error.message.includes('ECONNREFUSED') ||
          error.message.includes('ENOTFOUND') ||
          error.message.includes('ECONNRESET'))
      ) {
        throw new BaseError(
          ErrorCode.CONNECTION_ERROR,
          `Connection error: ${error.message}`,
          {
            reason: 'connection_error',
            context: {
              url,
              originalError: error,
            },
          },
          503,
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
        500,
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

  async requestMultiPartServer<T>(
    endpoint: string,
    formData: FormData,
    options: FetchOptions = {},
  ): Promise<T> {
    const { method = 'POST', headers = {}, timeout = this.defaultTimeout } = options;

    const url = `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // 서버 환경에서 form-data 라이브러리 사용
      const FormDataLib = await import('form-data');
      const form = new FormDataLib.default();

      let fieldCount = 0;
      for (const [key, value] of formData.entries()) {
        fieldCount++;

        if (value instanceof File) {
          // File 객체는 Buffer와 옵션으로 변환
          const buffer = Buffer.from(await value.arrayBuffer());
          form.append(key, buffer, {
            filename: value.name,
            contentType: value.type,
          });
        } else {
          form.append(key, value?.toString() || '');
        }
      }

      // form-data의 헤더와 사용자 헤더 병합 (Content-Type 충돌 방지)
      const customHeaders = { ...headers };
      delete customHeaders['Content-Type']; // form-data가 자동 설정

      // 기본 헤더에서 Content-Type 제거 후 병합
      const baseHeaders = { ...this.defaultHeaders };
      delete baseHeaders['Content-Type']; // 기본 JSON Content-Type 제거

      const requestHeaders = {
        ...baseHeaders,
        ...form.getHeaders(), // boundary 포함된 Content-Type만 사용
        ...customHeaders,
      };

      // form-data를 Buffer로 변환 (BodyInit 호환)
      let bodyData: BodyInit;

      try {
        if (form.getBuffer && typeof form.getBuffer === 'function') {
          bodyData = await form.getBuffer();
        } else {
          bodyData = form as any;
        }
      } catch (error) {
        console.error('Form conversion error:', error);
        bodyData = form as any;
      }

      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
        body: bodyData,
        signal: controller.signal,
      };

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
          response.status,
        );
      }

      const responseText = await response.text();

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
          500,
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
          408,
        );
      }

      if (
        error instanceof Error &&
        (error.message.includes('ECONNREFUSED') ||
          error.message.includes('ENOTFOUND') ||
          error.message.includes('ETIMEDOUT'))
      ) {
        throw new BaseError(
          ErrorCode.CONNECTION_ERROR,
          `Connection error: ${error.message}`,
          {
            reason: 'connection_error',
            context: {
              url,
              originalError: error,
            },
          },
          503,
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
        500,
      );
    } finally {
      clearTimeout(timeoutId);
    }
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
export { HttpClient, FetchOptions, ApiResponse };
