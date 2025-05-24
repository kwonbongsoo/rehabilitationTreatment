// 허용되는 역할 명시
export type UserRole = 'guest' | 'user' | 'admin';

export interface LoginBody {
    username: string;
    password: string;
}

/**
 * JWT 토큰 페이로드 인터페이스
 */
export interface TokenPayload {
    id: string;
    role: UserRole;
    name: string;
    exp?: number;
    iat?: number;
}

/**
 * 토큰 검증 결과 인터페이스
 */
export interface TokenVerificationResult {
    valid: boolean;
    message: string;
    payload?: TokenPayload;
}

/**
 * 인증 응답 인터페이스
 */
export interface AuthResponse {
    success: boolean;
    token?: string;
    message?: string;
}