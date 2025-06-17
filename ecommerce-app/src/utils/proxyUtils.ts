import type { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { KONG_GATEWAY_URL } from '../api/config';
import { BaseError } from '@ecommerce/common';
import {
  ProxyError,
  BackendConnectionError,
  ProxyValidationError,
  GatewayError,
  isProxyError,
  createProxyErrorFromAxios,
} from './proxyErrors';
import { cookieService } from '../services/cookieService';

/**
 * 프록시 요청 옵션 인터페이스
 */
export interface ProxyOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  targetPath: string;
  includeAuth?: boolean;
  includeIdempotency?: boolean;
  validateRequest?: (req: NextApiRequest) => { isValid: boolean; error?: string };
  transformRequest?: (body: any) => any;
  transformResponse?: (data: any) => any;
  logPrefix?: string;
}

/**
 * URL 경로에서 파라미터를 교체하는 함수
 * 예: "/api/members/{{id}}" + { id: "123" } -> "/api/members/123"
 */
function replacePathParameters(path: string, params: Record<string, any>): string {
  let result = path;

  // {{param}} 형태의 파라미터를 실제 값으로 교체
  Object.entries(params).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    if (result.includes(placeholder)) {
      result = result.replace(placeholder, String(value));
    }
  });

  return result;
}

/**
 * HTTP 메서드 검증
 */
function validateHttpMethod(requestMethod: string | undefined, allowedMethod: string): void {
  if (requestMethod !== allowedMethod) {
    throw new ProxyValidationError(
      `Method ${requestMethod || 'UNKNOWN'} not allowed. Only ${allowedMethod} is supported`,
      'http_method',
      'method_not_allowed',
    );
  }
}

/**
 * 쿠키에서 액세스 토큰 추출
 */
function extractTokenFromCookies(req: NextApiRequest): string | null {
  try {
    const token = cookieService.getTokenFromHeader(req.headers.cookie);
    return token || null;
  } catch (error) {
    return null;
  }
}

/**
 * 요청 헤더 구성
 */
function buildRequestHeaders(req: NextApiRequest, options: ProxyOptions): Record<string, string> {
  const headers: Record<string, string> = {};

  // Content-Type 설정
  if (['POST', 'PUT', 'PATCH'].includes(options.method)) {
    headers['Content-Type'] = 'application/json';
  }

  // 인증 헤더 처리 - 우선순위: 요청 헤더 > 쿠키
  if (options.includeAuth) {
    let authToken: string | null = null;

    // 1순위: 요청 헤더의 Authorization
    if (req.headers.authorization) {
      authToken = req.headers.authorization as string;
    }
    // 2순위: HttpOnly 쿠키의 access_token
    else {
      const cookieToken = extractTokenFromCookies(req);
      if (cookieToken) {
        authToken = `Bearer ${cookieToken}`;
      }
    }

    if (authToken) {
      headers['Authorization'] = authToken;
    }
  }

  // 멱등성 키
  if (options.includeIdempotency && req.headers['x-idempotency-key']) {
    headers['X-Idempotency-Key'] = req.headers['x-idempotency-key'] as string;
  }

  return headers;
}

/**
 * Axios 요청 설정 구성
 */
function buildAxiosConfig(
  req: NextApiRequest,
  options: ProxyOptions,
  targetPath: string,
  headers: Record<string, string>,
): AxiosRequestConfig {
  const config: AxiosRequestConfig = {
    method: options.method,
    url: `${KONG_GATEWAY_URL}${targetPath}`,
    headers,
    timeout: 30000,
    validateStatus: () => true, // 모든 상태 코드 허용
  };

  if (options.method === 'GET') {
    // GET 요청 - 쿼리 파라미터 처리
    const queryParams = { ...req.query };

    // 경로 파라미터 제거
    if (options.targetPath.includes('{{')) {
      const pathParamMatches = options.targetPath.match(/\{\{(\w+)\}\}/g);
      pathParamMatches?.forEach((match) => {
        const paramName = match.replace(/[{}]/g, '');
        delete queryParams[paramName];
      });
    }

    config.params = queryParams;
  } else if (['POST', 'PUT', 'PATCH'].includes(options.method)) {
    // POST/PUT/PATCH 요청 - 바디 데이터 처리
    let requestData = req.body;
    if (options.transformRequest) {
      requestData = options.transformRequest(req.body);
    }
    config.data = requestData;
  }

  return config;
}

/**
 * 에러 응답 전송
 */
function sendErrorResponse(res: NextApiResponse, error: BaseError): void {
  const errorResponse = error.toResponse();
  res.status(error.statusCode).json(errorResponse);
}

/**
 * 공통 프록시 요청 처리 함수
 */
export async function handleProxyRequest(
  req: NextApiRequest,
  res: NextApiResponse,
  options: ProxyOptions,
): Promise<void> {
  const logPrefix = options.logPrefix || '🔄';

  try {
    // 1. HTTP 메서드 검증
    validateHttpMethod(req.method, options.method);

    // 2. 커스텀 요청 검증
    if (options.validateRequest) {
      const validation = options.validateRequest(req);
      if (!validation.isValid) {
        throw new ProxyValidationError(
          validation.error || 'Invalid request',
          'request_body',
          'validation_failed',
        );
      }
    }

    // 3. 요청 파라미터 및 설정 구성
    const targetPath = replacePathParameters(options.targetPath, req.query as Record<string, any>);
    const headers = buildRequestHeaders(req, options);
    const axiosConfig = buildAxiosConfig(req, options, targetPath, headers);

    // 4. Kong Gateway로 요청 전송
    const response: AxiosResponse = await axios(axiosConfig);

    // 5. 응답 데이터 변환
    let responseData = response.data;
    if (options.transformResponse) {
      responseData = options.transformResponse(response.data);
    }

    // 6. 성공 응답 전달
    res.status(response.status).json(responseData);
  } catch (error: any) {
    // BaseError 타입의 에러인 경우 바로 응답
    if (error instanceof BaseError) {
      return sendErrorResponse(res, error);
    }

    // Axios 에러인 경우 변환 후 응답
    if (axios.isAxiosError(error)) {
      const proxyError = createProxyErrorFromAxios(error, options.targetPath);
      return sendErrorResponse(res, proxyError);
    }

    // 예상치 못한 에러의 경우 내부 서버 에러로 처리
    const internalError = new ProxyError('An unexpected error occurred', 500, undefined, {
      reason: 'unexpected_error',
      context: { originalError: error.message, targetPath: options.targetPath },
    });
    sendErrorResponse(res, internalError);
  }
}

/**
 * 단일 메서드 프록시 핸들러 생성
 */
export function createProxyHandler(options: ProxyOptions) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    await handleProxyRequest(req, res, options);
  };
}

/**
 * 멀티 메서드 프록시 핸들러 생성
 */
export function createMultiMethodProxyHandler(
  methodOptions: Record<string, Omit<ProxyOptions, 'method'>>,
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method as string;
    const options = methodOptions[method];

    if (!options) {
      const allowedMethods = Object.keys(methodOptions);
      const error = new ProxyValidationError(
        `Method ${method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`,
        'http_method',
        'method_not_allowed',
      );
      return sendErrorResponse(res, error);
    }

    await handleProxyRequest(req, res, { ...options, method: method as any });
  };
}
