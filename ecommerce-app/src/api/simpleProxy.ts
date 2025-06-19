import type { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { KONG_GATEWAY_URL } from './config';
import { BaseError } from '@ecommerce/common';
import {
  ProxyError,
  ProxyValidationError,
  ProxyMethodNotAllowedError,
  createProxyErrorFromAxios,
} from '../utils/proxyErrors';
import { cookieService } from '@/services';

/**
 * 단순화된 프록시 요청 옵션
 */
export interface SimpleProxyOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  targetPath: string;
  requireAuth?: boolean;
  useBasicAuth?: boolean;
  setCookies?: (res: NextApiResponse, responseData: any) => void;
}

/**
 * 미리 정의된 프록시 타입
 */
export type ProxyType = 'public' | 'authenticated' | 'basic-auth' | 'with-cookies';

// 자주 사용되는 프록시 설정 미리 정의
const PROXY_PRESETS: Record<ProxyType, Partial<SimpleProxyOptions>> = {
  public: {
    requireAuth: false,
  },
  authenticated: {
    requireAuth: true,
  },
  'basic-auth': {
    requireAuth: true,
    useBasicAuth: true,
  },
  'with-cookies': {
    requireAuth: true,
    setCookies: (res, data) => {
      // 기본 쿠키 설정 로직
      if (data?.data) {
        cookieService.setAuthCookies(res, data.data);
      }
    },
  },
};

/**
 * 경로 파라미터 교체
 */
function replacePathParams(path: string, params: Record<string, any>): string {
  let result = path;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, String(value));
  });
  return result;
}

/**
 * 인증 헤더 구성
 */
function buildAuthHeaders(
  req: NextApiRequest,
  options: SimpleProxyOptions,
): Record<string, string> {
  const headers: Record<string, string> = {};

  if (options.requireAuth) {
    let authToken: string | null = null;

    if (options.useBasicAuth) {
      // Basic 인증
      const authBasicKey = process.env.AUTH_BASIC_KEY;
      if (authBasicKey) {
        authToken = `Basic ${Buffer.from(authBasicKey).toString('base64')}`;
      }
    } else {
      // Bearer 토큰
      if (req.headers.authorization) {
        authToken = req.headers.authorization as string;
      } else {
        const cookieToken = cookieService.getTokenFromHeader(req.headers.cookie);
        if (cookieToken) {
          authToken = `Bearer ${cookieToken}`;
        }
      }
    }

    if (authToken) {
      headers['Authorization'] = authToken;
    }
  }

  return headers;
}

/**
 * 단순화된 프록시 요청 처리
 */
export async function handleSimpleProxyRequest(
  req: NextApiRequest,
  res: NextApiResponse,
  options: SimpleProxyOptions,
): Promise<void> {
  try {
    // HTTP 메서드 검증
    if (req.method?.toUpperCase() !== options.method.toUpperCase()) {
      throw new ProxyMethodNotAllowedError([options.method], req.method || 'UNKNOWN');
    }

    // 경로 파라미터 교체
    const targetPath = replacePathParams(options.targetPath, req.query as Record<string, any>);

    // 헤더 구성
    const authHeaders = buildAuthHeaders(req, options);
    const headers = {
      'Content-Type': 'application/json',
      ...authHeaders,
    };

    // Axios 설정
    const config: AxiosRequestConfig = {
      method: options.method,
      url: `${KONG_GATEWAY_URL}${targetPath}`,
      headers,
      timeout: 30000,
      validateStatus: () => true,
    };

    // GET 요청은 쿼리 파라미터, 나머지는 바디
    if (options.method.toUpperCase() === 'GET') {
      const { ...queryParams } = req.query;
      // 경로 파라미터 제거
      const pathParamNames = (options.targetPath.match(/:(\w+)/g) || []).map((p) => p.substring(1));
      pathParamNames.forEach((param) => delete queryParams[param]);
      config.params = queryParams;
    } else {
      config.data = req.body;
    }

    // API 요청 실행
    const response: AxiosResponse = await axios(config);

    // 쿠키 설정
    if (options.setCookies && response.status >= 200 && response.status < 300) {
      options.setCookies(res, response.data);
    }

    // 응답 전달
    res.status(response.status).json(response.data);
  } catch (error: any) {
    // 에러 처리
    if (error instanceof BaseError) {
      res.status(error.statusCode).json(error.toResponse());
      return;
    }

    if (axios.isAxiosError(error)) {
      const proxyError = createProxyErrorFromAxios(error, options.targetPath);
      res.status(proxyError.statusCode).json(proxyError.toResponse());
      return;
    }

    // 예상치 못한 에러
    const internalError = new ProxyError('An unexpected error occurred', 500);
    res.status(500).json(internalError.toResponse());
  }
}

/**
 * 단순 프록시 핸들러 생성
 */
export function createSimpleProxyHandler(
  method: SimpleProxyOptions['method'],
  targetPath: string,
  type: ProxyType = 'public',
  customOptions?: Partial<SimpleProxyOptions>,
) {
  const preset = PROXY_PRESETS[type];
  const options: SimpleProxyOptions = {
    method,
    targetPath,
    ...preset,
    ...customOptions,
  };

  return (req: NextApiRequest, res: NextApiResponse) => handleSimpleProxyRequest(req, res, options);
}

/**
 * 멀티 메서드 단순 프록시 핸들러 생성
 */
export function createMultiMethodSimpleProxyHandler(
  targetPath: string,
  methodConfigs: Partial<Record<SimpleProxyOptions['method'], ProxyType>>,
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method?.toUpperCase() as SimpleProxyOptions['method'];
    const proxyType = methodConfigs[method];

    if (!proxyType) {
      const allowedMethods = Object.keys(methodConfigs);
      const error = new ProxyMethodNotAllowedError(allowedMethods, method || 'UNKNOWN');
      res.status(405).json(error.toResponse());
      return;
    }

    const handler = createSimpleProxyHandler(method, targetPath, proxyType);
    await handler(req, res);
  };
}
