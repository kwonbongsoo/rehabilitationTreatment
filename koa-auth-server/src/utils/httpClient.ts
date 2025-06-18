import got, {
  Got,
  Response,
  HTTPError,
  RequestError,
  TimeoutError,
  OptionsOfJSONResponseBody,
} from 'got';
import {
  ApiError,
  ApiTimeoutError,
  ApiUnavailableError,
  ApiResponseFormatError,
  ApiRateLimitError,
} from '../middlewares/errorMiddleware';

/**
 * HTTP 요청을 담당하는 클래스
 * 단일 책임 원칙(SRP) 준수: HTTP 통신만 담당
 */
export class HttpClient {
  private client: Got;
  private readonly serviceName: string;

  constructor(
    baseUrl: string,
    serviceName: string,
    options: Partial<OptionsOfJSONResponseBody> = {},
  ) {
    this.serviceName = serviceName;

    this.client = got.extend({
      prefixUrl: baseUrl,
      timeout: {
        request: options.timeout?.request || 3000,
      },
      headers: {
        'content-type': 'application/json',
        'user-agent': 'koa-auth-server',
        ...options.headers,
      },
      retry: {
        limit: 0,
        methods: ['GET', 'POST', 'PUT'],
        statusCodes: [408, 429, 500, 502, 503, 504],
      },
      responseType: 'json',
      ...options,
    } as OptionsOfJSONResponseBody);
  }

  /**
   * GET 요청 수행
   */
  public async get<T = any>(
    endpoint: string,
    options: Partial<OptionsOfJSONResponseBody> = {},
  ): Promise<T> {
    try {
      const response = await this.client.get<T>(endpoint, options as OptionsOfJSONResponseBody);
      return response.body as T;
    } catch (error) {
      throw this.handleApiError(error, `GET ${endpoint}`);
    }
  }

  /**
   * POST 요청 수행
   */
  public async post<T = any>(
    endpoint: string,
    data?: unknown,
    options: Partial<OptionsOfJSONResponseBody> = {},
  ): Promise<T> {
    try {
      // options에서 json 속성을 제거하고 별도의 객체로 구성
      const { json: _, ...restOptions } = options as any;

      const response = await this.client.post<T>(endpoint, {
        json: data, // 데이터는 json 속성으로 전달
        ...restOptions, // 나머지 옵션들만 전달
      } as OptionsOfJSONResponseBody);

      return response.body as T;
    } catch (error) {
      throw this.handleApiError(error, `POST ${endpoint}`);
    }
  }

  /**
   * PUT 요청 수행
   */
  public async put<T = any>(
    endpoint: string,
    data?: unknown,
    options: Partial<OptionsOfJSONResponseBody> = {},
  ): Promise<T> {
    try {
      const { json: _, ...restOptions } = options as any;

      const response = await this.client.put<T>(endpoint, {
        json: data,
        ...restOptions,
      } as OptionsOfJSONResponseBody);

      return response.body as T;
    } catch (error) {
      throw this.handleApiError(error, `PUT ${endpoint}`);
    }
  }

  /**
   * DELETE 요청 수행
   */
  public async delete<T = any>(
    endpoint: string,
    options: Partial<OptionsOfJSONResponseBody> = {},
  ): Promise<T> {
    try {
      const response = await this.client.delete<T>(endpoint, options as OptionsOfJSONResponseBody);
      return response.body as T;
    } catch (error) {
      throw this.handleApiError(error, `DELETE ${endpoint}`);
    }
  }

  /**
   * API 에러 처리 및 변환
   * @private 내부 구현 상세를 캡슐화
   */
  private handleApiError(error: unknown, operation: string): Error {
    // 타임아웃 에러 처리
    if (error instanceof TimeoutError) {
      return new ApiTimeoutError(`요청 시간이 초과되었습니다 (${operation})`, this.serviceName);
    }

    // HTTP 에러 처리
    if (error instanceof HTTPError) {
      const statusCode = error.response.statusCode;
      let message = this.getErrorMessage(error);

      // HTTP 상태 코드별 처리
      switch (statusCode) {
        case 429:
          return new ApiRateLimitError(`요청 한도를 초과했습니다: ${message}`, this.serviceName);

        case 401:
          return new ApiError('인증에 실패했습니다', statusCode, this.serviceName);

        case 404:
          return new ApiError('요청한 리소스를 찾을 수 없습니다', statusCode, this.serviceName);

        // 서버 오류
        case 500:
        case 502:
        case 503:
        case 504:
          return new ApiUnavailableError(
            `서비스를 일시적으로 사용할 수 없습니다: ${message}`,
            this.serviceName,
          );

        default:
          return new ApiError(message, statusCode, this.serviceName);
      }
    }

    // 네트워크 문제 등
    if (error instanceof RequestError) {
      if (error.code === 'ECONNREFUSED') {
        return new ApiUnavailableError(
          `서비스에 연결할 수 없습니다 (${operation})`,
          this.serviceName,
        );
      }

      return new ApiError(`API 요청 오류: ${error.message}`, 500, this.serviceName);
    }

    // 예상치 못한 에러
    console.error(`[${this.serviceName}] Unexpected error in ${operation}:`, error);
    return new ApiError('예상치 못한 오류가 발생했습니다', 500, this.serviceName);
  }

  /**
   * 에러 메시지 추출 헬퍼
   * @private 내부 구현 상세를 캡슐화
   */
  private getErrorMessage(error: HTTPError): string {
    try {
      // body가 객체인지 확인하고 메시지 추출
      const body = error.response.body;
      if (typeof body === 'object' && body !== null && 'message' in body) {
        return body.message as string;
      }
    } catch (e) {
      // 무시하고 기본 메시지 사용
    }

    // 상태 코드별 기본 메시지
    switch (error.response.statusCode) {
      case 400:
        return '잘못된 요청입니다';
      case 401:
        return '인증이 필요합니다';
      case 403:
        return '권한이 없습니다';
      case 404:
        return '요청한 리소스를 찾을 수 없습니다';
      case 429:
        return '너무 많은 요청을 보냈습니다';
      case 500:
        return '서버 내부 오류가 발생했습니다';
      default:
        return `${error.response.statusCode} 오류가 발생했습니다`;
    }
  }
}
