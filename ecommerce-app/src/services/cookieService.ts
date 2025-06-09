/**
 * 쿠키 관리 서비스
 * 
 * 클라이언트/서버 환경에서 토큰 쿠키 관리를 담당합니다.
 * HttpOnly 쿠키를 통한 안전한 토큰 저장 및 조회를 지원합니다.
 * 
 * @example
 * ```typescript
 * // 서버사이드에서 쿠키 생성
 * const cookies = createTokenCookies(tokenResult);
 * res.setHeader('Set-Cookie', cookies);
 * 
 * // 서버에서 토큰 조회
 * const token = cookieService.getToken();
 * ```
 */
import { TokenResult } from "./tokenService";

/**
 * 쿠키 보안 옵션 상수
 */
const COOKIE_CONFIG = {
    PATH: '/',
    SAME_SITE: 'Strict' as const,
    HTTP_ONLY: true
} as const;

/**
 * 쿠키 이름 상수
 */
const COOKIE_NAMES = {
    ACCESS_TOKEN: 'access_token',
    ACCESS_TYPE: 'access_type'
} as const;

/**
 * 프로덕션 환경 여부 확인
 */
const isProduction = (): boolean => process.env.NODE_ENV === 'production';

/**
 * 기본 쿠키 옵션 생성
 */
const createBaseCookieOptions = (): string[] => [
    'HttpOnly',
    `Path=${COOKIE_CONFIG.PATH}`,
    `SameSite=${COOKIE_CONFIG.SAME_SITE}`,
    ...(isProduction() ? ['Secure'] : [])
];

/**
 * 개별 쿠키 문자열 생성
 */
const createCookie = (name: string, value: string, maxAge?: number): string => {
    const baseOptions = createBaseCookieOptions();
    const options = [`${name}=${value}`, ...baseOptions];

    // Max-Age 설정 (토큰 만료 시간)
    if (maxAge && maxAge > 0) {
        options.push(`Max-Age=${maxAge}`);
    }

    return options.join('; ');
};

/**
 * 토큰 쿠키 배열 생성 (서버사이드용)
 * 
 * @description 토큰 데이터를 안전한 HttpOnly 쿠키로 변환합니다
 * @param tokenResult - 토큰 발급 결과
 * @returns 설정할 쿠키 문자열 배열
 */
export function createTokenCookies(tokenResult: TokenResult): string[] {
    const cookies: string[] = [];    // 토큰 만료 시간 계산 (초 단위)
    let maxAge: number | undefined;
    if (tokenResult.data?.exp) {
        const currentTimeInSeconds = Math.floor(Date.now() / 1000);

        // iat(발급시간)가 있으면 토큰의 원래 수명을 기준으로 계산
        if (tokenResult.data.iat) {
            const tokenLifetime = tokenResult.data.exp - tokenResult.data.iat;
            const elapsedTime = currentTimeInSeconds - tokenResult.data.iat;
            maxAge = Math.max(0, tokenLifetime - elapsedTime);
        } else {
            // iat가 없으면 현재 시간 기준으로 계산 (기존 방식)
            maxAge = tokenResult.data.exp - currentTimeInSeconds;
        }

        // 만료 시간이 이미 지났거나 너무 짧은 경우 처리
        if (maxAge <= 0) {
            console.warn('⚠️ 토큰이 이미 만료되었거나 만료 임박:', {
                maxAge,
                fallbackHours: 4
            });
            maxAge = 60 * 60 * 4; // 기본 4시간으로 설정
        }
    }
    // Access Token 쿠키 생성 (만료 시간 포함)
    if (tokenResult.data?.token) {
        cookies.push(createCookie(COOKIE_NAMES.ACCESS_TOKEN, tokenResult.data.token, maxAge));
    }

    // Access Type 쿠키 생성 (만료 시간 포함)
    if (tokenResult.data?.role) {
        cookies.push(createCookie(COOKIE_NAMES.ACCESS_TYPE, tokenResult.data.role, maxAge));
    }

    return cookies;
}

/**
 * 쿠키 문자열을 키-값 객체로 파싱
 */
const parseCookieString = (cookieString: string): [string, string] => {
    const [key, value] = cookieString.trim().split('=');
    return [key, value];
};

/**
 * 쿠키 헤더를 파싱하여 객체로 변환
 */
const parseServerCookies = (cookieHeader: string): Record<string, string> => {
    return cookieHeader
        .split(';')
        .map(parseCookieString)
        .reduce((acc, [key, value]) => {
            if (key && value) {
                acc[key] = decodeURIComponent(value);
            }
            return acc;
        }, {} as Record<string, string>);
};

/**
 * 클라이언트 쿠키에서 특정 쿠키 찾기
 */
const findClientCookie = (cookieName: string): string | null => {
    const cookies = document.cookie.split(';');
    console.warn('현재 쿠키:', cookies);
    const targetCookie = cookies.find(cookie =>
        cookie.trim().startsWith(`${cookieName}=`)
    );

    if (targetCookie) {
        const [, value] = targetCookie.split('=');
        return value || null;
    }

    return null;
};

/**
 * 서버사이드 실행 환경 확인
 */
const isServerSide = (): boolean => typeof window === 'undefined';

/**
 * API 호출 에러 처리
 */
const handleApiError = (error: unknown, context: string): void => {
    console.error(`❌ ${context}:`, error);
};

/**
 * 쿠키 관리 서비스
 * 
 * @description 클라이언트/서버 환경에서 토큰 쿠키 관리
 */
export const cookieService = {
    /**
     * 서버사이드에서 쿠키 헤더로부터 토큰 추출
     * 
     * @description SSR이나 API Route에서 사용
     * @param cookieHeader - HTTP Cookie 헤더 문자열
     * @returns 추출된 액세스 토큰 또는 null
     * 
     * @example
     * ```typescript
     * // API Route에서 사용
     * const token = cookieService.getTokenFromHeader(req.headers.cookie);
     * ```
     */
    getTokenFromHeader(cookieHeader?: string): string | null {
        if (!cookieHeader) {
            return null;
        }

        try {
            const cookies = parseServerCookies(cookieHeader);
            return cookies[COOKIE_NAMES.ACCESS_TOKEN] || null;
        } catch (error) {
            handleApiError(error, '서버사이드 쿠키 파싱 에러');
            return null;
        }
    },

    /**
     * 서버에서 토큰 조회
     * 
     * @description 브라우저 환경에서 document.cookie로부터 토큰 추출
     * @returns 추출된 액세스 토큰 또는 null
     * 
     * @example
     * ```typescript
     * // 서버에서 사용
     * const token = cookieService.getToken();
     * if (token) {
     *   // 인증된 요청 수행
     * }
     * ```
     */
    getToken(): string | null {
        try {
            if (isServerSide()) {
                return findClientCookie(COOKIE_NAMES.ACCESS_TOKEN);
            } else {
                return null;
            }
        } catch (error) {
            handleApiError(error, '클라이언트사이드 쿠키 조회 에러');
            return null;
        }
    },

    /**
     * 사용자 역할(role) 조회
     * 
     * @description 클라이언트사이드에서 사용자 역할 정보 추출
     * @returns 사용자 역할 또는 null
     */
    getUserRole(): string | null {
        if (isServerSide()) {
            return null;
        }

        try {
            return findClientCookie(COOKIE_NAMES.ACCESS_TYPE);
        } catch (error) {
            handleApiError(error, '사용자 역할 조회 에러');
            return null;
        }
    },

    /**
     * 토큰 삭제 (로그아웃)
     * 
     * @description 서버 API를 호출하여 안전하게 토큰 쿠키 삭제
     * @returns 삭제 성공 여부
     * 
     * @example
     * ```typescript
     * // 로그아웃 처리
     * const success = await cookieService.clearToken();
     * if (success) {
     *   router.push('/login');
     * }
     * ```
     */
    async clearToken(): Promise<boolean> {
        try {
            const response = await fetch('/api/auth/clear-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`토큰 삭제 API 응답 오류: ${response.status}`);
            }

            return true;
        } catch (error) {
            handleApiError(error, '토큰 삭제');
            return false;
        }
    },

    /**
     * 토큰 존재 여부 확인
     * 
     * @description 현재 환경에서 유효한 토큰이 있는지 확인
     * @returns 토큰 존재 여부
     */
    hasToken(): boolean {
        const token = this.getToken();
        return Boolean(token && token.length > 0);
    }
};
