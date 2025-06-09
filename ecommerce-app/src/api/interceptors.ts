/**
 * API 인터셉터 서비스
 * 
 * @example
 * ```typescript
 * const interceptorManager = new InterceptorManager(logger, authService, idempotencyService);
 * interceptorManager.setupInterceptors(axiosInstance);
 * ```
 */
import { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getApiConfig } from './config';
import { cookieService } from '../services/cookieService';

/**
 * HTTP 메서드 타입
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * 로깅 인터페이스 (의존성 역전 원칙)
 */
interface ILogger {
    logRequest(config: InternalAxiosRequestConfig): void;
    logResponse(response: AxiosResponse): void;
    logError(request: any, error: unknown): void;
}

/**
 * 인증 서비스 인터페이스 (의존성 역전 원칙)
 */
interface IAuthService {
    getToken(): string | null;
    handleUnauthorized(): void;
}

/**
 * 멱등성 서비스 인터페이스 (의존성 역전 원칙)
 */
interface IIdempotencyService {
    needsIdempotencyKey(method: string, url: string): boolean;
    addIdempotencyHeader(config: InternalAxiosRequestConfig, key: string): InternalAxiosRequestConfig;
    extractIdempotencyKey(requestData: any): string | null;
    cleanupRequestData(requestData: any): void;
}

/**
 * API 로거 구현체 (단일 책임 원칙)
 */
class ApiLogger implements ILogger {
    private readonly isLoggingEnabled: boolean;

    constructor() {
        this.isLoggingEnabled = getApiConfig().logApiCalls;
    } logRequest(config: InternalAxiosRequestConfig): void {
        if (!this.isLoggingEnabled) return;

        console.warn(
            `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
            this.sanitizeConfig(config)
        );
    }

    logResponse(response: AxiosResponse): void {
        if (!this.isLoggingEnabled) return;

        console.warn(
            `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`,
            response.data
        );
    }

    logError(request: any, error: unknown): void {
        if (!this.isLoggingEnabled) return;

        const errorData = error instanceof AxiosError
            ? error.response?.data || error.message
            : error;

        console.error(
            `❌ API Error: ${request?.method?.toUpperCase()} ${request?.url}`,
            errorData
        );
    }

    private sanitizeConfig(config: InternalAxiosRequestConfig): object {
        const { headers, ...sanitized } = config;
        return {
            ...sanitized,
            headers: this.sanitizeHeaders(headers)
        };
    }

    private sanitizeHeaders(headers: any): object {
        if (!headers) return {};

        const sanitized = { ...headers };
        // 민감한 정보 마스킹
        if (sanitized.Authorization) {
            sanitized.Authorization = 'Bearer [MASKED]';
        }
        return sanitized;
    }
}

/**
 * 인증 서비스 구현체 (단일 책임 원칙)
 */
class AuthService implements IAuthService {
    getToken(): string | null {
        return cookieService.getToken();
    }

    handleUnauthorized(): void {
        // 홈페이지로 리다이렉트하여 새로운 게스트 토큰 발급
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
    }
}

/**
 * 멱등성 서비스 구현체 (도메인 로직 분리)
 */
class IdempotencyService implements IIdempotencyService {
    private readonly idempotentMethods: HttpMethod[] = ['POST', 'PUT', 'PATCH'];
    private readonly criticalEndpoints: string[] = [
        '/api/members',
        '/api/orders',
        '/api/payments'
    ];

    needsIdempotencyKey(method: string, url: string): boolean {
        return (
            this.isIdempotentMethod(method) &&
            this.isCriticalEndpoint(url)
        );
    }

    addIdempotencyHeader(
        config: InternalAxiosRequestConfig,
        key: string
    ): InternalAxiosRequestConfig {
        config.headers = config.headers || {};
        config.headers['X-Idempotency-Key'] = key;
        return config;
    }

    extractIdempotencyKey(requestData: any): string | null {
        return requestData?._idempotencyKey || null;
    }

    cleanupRequestData(requestData: any): void {
        if (requestData && '_idempotencyKey' in requestData) {
            delete requestData._idempotencyKey;
        }
    }

    private isIdempotentMethod(method: string): boolean {
        return this.idempotentMethods.includes(method.toUpperCase() as HttpMethod);
    }

    private isCriticalEndpoint(url: string): boolean {
        return this.criticalEndpoints.some(endpoint => url.includes(endpoint));
    }
}

/**
 * 요청 인터셉터 (단일 책임 원칙)
 */
class RequestInterceptor {
    constructor(
        private readonly logger: ILogger,
        private readonly authService: IAuthService,
        private readonly idempotencyService: IIdempotencyService
    ) { }

    handle = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        this.logger.logRequest(config);
        this.addAuthenticationHeader(config);
        this.handleIdempotency(config);
        return config;
    };

    private addAuthenticationHeader(config: InternalAxiosRequestConfig): void {
        const token = this.authService.getToken();
        if (token && !config.headers?.Authorization) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    private handleIdempotency(config: InternalAxiosRequestConfig): void {
        if (!this.shouldAddIdempotencyKey(config)) return;

        const requestData = config.data as any;
        const idempotencyKey = this.idempotencyService.extractIdempotencyKey(requestData);

        if (idempotencyKey) {
            this.idempotencyService.addIdempotencyHeader(config, idempotencyKey);
            this.idempotencyService.cleanupRequestData(requestData);
        }
    }

    private shouldAddIdempotencyKey(config: InternalAxiosRequestConfig): boolean {
        return !!(
            config.method &&
            config.url &&
            this.idempotencyService.needsIdempotencyKey(config.method, config.url) &&
            !config.headers?.['X-Idempotency-Key']
        );
    }
}

/**
 * 응답 인터셉터 (단일 책임 원칙)
 */
class ResponseInterceptor {
    constructor(
        private readonly logger: ILogger,
        private readonly authService: IAuthService
    ) { }

    handleSuccess = (response: AxiosResponse): AxiosResponse => {
        this.logger.logResponse(response);
        return response;
    };

    handleError = async (error: AxiosError): Promise<never> => {
        const originalRequest = error.config;

        if (this.isUnauthorizedError(error)) {
            this.authService.handleUnauthorized();
        }

        this.logger.logError(originalRequest, error);
        return Promise.reject(error);
    };

    private isUnauthorizedError(error: AxiosError): boolean {
        return error.response?.status === 401;
    }
}

/**
 * 인터셉터 관리자 (조합 패턴, 의존성 주입)
 */
class InterceptorManager {
    private readonly requestInterceptor: RequestInterceptor;
    private readonly responseInterceptor: ResponseInterceptor;

    constructor(
        logger: ILogger,
        authService: IAuthService,
        idempotencyService: IIdempotencyService
    ) {
        this.requestInterceptor = new RequestInterceptor(logger, authService, idempotencyService);
        this.responseInterceptor = new ResponseInterceptor(logger, authService);
    }

    setupInterceptors(client: AxiosInstance): void {
        this.setupRequestInterceptor(client);
        this.setupResponseInterceptor(client);
    }

    private setupRequestInterceptor(client: AxiosInstance): void {
        client.interceptors.request.use(
            this.requestInterceptor.handle,
            (error: AxiosError) => Promise.reject(error)
        );
    }

    private setupResponseInterceptor(client: AxiosInstance): void {
        client.interceptors.response.use(
            this.responseInterceptor.handleSuccess,
            this.responseInterceptor.handleError
        );
    }
}

/**
 * 팩토리 함수 (의존성 주입 컨테이너 역할)
 */
const createInterceptorManager = (): InterceptorManager => {
    const logger = new ApiLogger();
    const authService = new AuthService();
    const idempotencyService = new IdempotencyService();

    return new InterceptorManager(logger, authService, idempotencyService);
};

/**
 * 공개 API - 하위 호환성을 위한 래퍼 함수
 * 
 * @description Axios 인스턴스에 모든 필요한 인터셉터를 설정합니다
 * @param client - 설정할 Axios 인스턴스
 * 
 * @example
 * ```typescript
 * const apiClient = axios.create(config);
 * setupInterceptors(apiClient);
 * ```
 */
export const setupInterceptors = (client: AxiosInstance): void => {
    const interceptorManager = createInterceptorManager();
    interceptorManager.setupInterceptors(client);
};

/**
 * 레거시 지원을 위한 유틸리티 (하위 호환성)
 * @deprecated 새로운 코드에서는 InterceptorManager 사용 권장
 */
export const idempotencyUtils = {
    needsIdempotencyKey: (method: string, url: string): boolean => {
        const service = new IdempotencyService();
        return service.needsIdempotencyKey(method, url);
    },
    addIdempotencyHeader: (config: InternalAxiosRequestConfig, key: string): InternalAxiosRequestConfig => {
        const service = new IdempotencyService();
        return service.addIdempotencyHeader(config, key);
    }
};