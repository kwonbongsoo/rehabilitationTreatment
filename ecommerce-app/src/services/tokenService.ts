/**
 * 토큰 관리 서비스
 * 
 * 서버사이드 전용 토큰 발급 및 쿠키 설정 담당
 * 
 * @example
 * ```typescript
 * // SSR에서 사용
 * const result = await issueGuestTokenWithCookieSSR(res);
 * ```
 */
import { ServerResponse } from 'http';
import { createTokenCookies } from './cookieService';

/**
 * Auth 서비스 응답 타입
 */
interface AuthServiceResponse {
    success: boolean;
    data: AuthTokenData;
}

/**
 * 토큰 데이터 구조
 */
interface AuthTokenData {
    token: string;
    role: string;
    exp: number;
    iat: number;
}

/**
 * 토큰 발급 결과
 */
export interface TokenResult {
    success: boolean;
    data?: AuthTokenData;
    message?: string;
    error?: string;
}

/**
 * 쿠키 설정을 포함한 토큰 발급 결과
 */
export interface TokenWithCookieResult extends TokenResult {
    cookieSet?: boolean;
}

/**
 * 환경 변수 검증
 */
const validateEnvironmentVariables = (): { authServiceUrl: string; authPrefix: string } => {
    const authServiceUrl = process.env.AUTH_SERVICE_URL;
    const authPrefix = process.env.AUTH_PREFIX;

    if (!authServiceUrl) {
        throw new Error('AUTH_SERVICE_URL 환경 변수가 설정되지 않았습니다');
    }

    if (!authPrefix) {
        throw new Error('AUTH_PREFIX 환경 변수가 설정되지 않았습니다');
    }

    return { authServiceUrl, authPrefix };
};

/**
 * Auth 서비스 URL 생성
 */
const buildAuthServiceUrl = (): string => {
    const { authServiceUrl, authPrefix } = validateEnvironmentVariables();
    return `${authServiceUrl}${authPrefix}/guest-token`;
};

/**
 * HTTP 요청 헤더 생성
 */
const createRequestHeaders = (): Record<string, string> => ({
    'Content-Type': 'application/json',
    'User-Agent': 'NextJS-SSR'
});

/**
 * Auth 서비스 API 호출
 */
const callAuthService = async (url: string): Promise<AuthServiceResponse> => {
    const response = await fetch(url, {
        method: 'POST',
        headers: createRequestHeaders()
    });

    if (!response.ok) {
        throw new Error(`Auth 서비스 응답 오류: ${response.status} ${response.statusText}`);
    }

    return response.json();
};

/**
 * 에러를 TokenResult 형태로 변환
 */
const createErrorResult = (error: unknown, context: string): TokenResult => {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    console.error(`❌ ${context}:`, error);

    return {
        success: false,
        error: errorMessage
    };
};

/**
 * 게스트 토큰 발급 (내부 함수)
 * 
 * @private
 * @description 직접 사용하지 말고 issueGuestTokenWithCookieSSR() 사용 권장
 */
async function fetchGuestTokenServer(): Promise<TokenResult> {
    try {
        const authUrl = buildAuthServiceUrl();
        const { data, success } = await callAuthService(authUrl);

        return {
            success,
            data
        };

    } catch (error) {
        return createErrorResult(error, 'Server: 게스트 토큰 발급 에러');
    }
}

/**
 * 토큰 발급 결과 검증
 */
const isValidTokenResult = (tokenResult: TokenResult): boolean => {
    return tokenResult.success && Boolean(tokenResult.data?.token);
};

/**
 * 응답 헤더 설정
 */
const setResponseHeaders = (res: ServerResponse, tokenResult: TokenResult): void => {
    const cookieHeaders = createTokenCookies(tokenResult);
    const bearerToken = `Bearer ${tokenResult.data?.token || ''}`;

    res.setHeader('Set-Cookie', cookieHeaders);
    res.setHeader('Authorization', bearerToken);
};

/**
 * 실패 결과 생성
 */
const createFailureResult = (tokenResult: TokenResult): TokenWithCookieResult => ({
    ...tokenResult,
    cookieSet: false
});

/**
 * 성공 결과 생성
 */
const createSuccessResult = (tokenResult: TokenResult): TokenWithCookieResult => ({
    ...tokenResult,
    cookieSet: true
});

/**
 * 토큰 발급 + 쿠키 설정 통합 함수
 * 
 * @description SSR 환경에서 게스트 토큰을 발급하고 쿠키로 설정합니다
 * @param res - ServerResponse 객체
 * @returns 토큰 발급 및 쿠키 설정 결과
 * 
 * @example
 * ```typescript
 * // _app.tsx의 getInitialProps에서 사용
 * const result = await issueGuestTokenWithCookieSSR(ctx.res);
 * if (result.success && result.cookieSet) {
 *   console.log('토큰 발급 및 쿠키 설정 완료');
 * }
 * ```
 */
export async function issueGuestTokenWithCookieSSR(res: ServerResponse): Promise<TokenWithCookieResult> {
    try {
        // 1. 토큰 발급
        const tokenResult = await fetchGuestTokenServer();

        // 2. 토큰 발급 실패 시 조기 반환
        if (!isValidTokenResult(tokenResult)) {
            return createFailureResult(tokenResult);
        }

        // 3. 쿠키 및 헤더 설정
        setResponseHeaders(res, tokenResult);

        // 4. 성공 결과 반환
        return createSuccessResult(tokenResult);

    } catch (error) {
        return {
            success: false,
            message: '토큰 발급 및 쿠키 설정에 실패했습니다',
            error: error instanceof Error ? error.message : '알 수 없는 오류',
            cookieSet: false
        };
    }
}