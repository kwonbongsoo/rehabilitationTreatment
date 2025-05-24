// 허용되는 역할 명시
export type UserRole = 'guest' | 'user' | 'admin';

// 공통 User 타입 정의 (role을 구체적인 타입으로)
export interface User {
    id: string;
    role: UserRole; // 문자열에서 구체적인 타입으로 변경
    name: string;
}

// JWT 토큰에 포함되는 추가 필드와 함께 정의
export interface TokenPayload extends User {
    exp?: number;  // 만료 시간
    iat?: number;  // 발급 시간
}

export interface TokenResponse {
    token: string;
}

export interface TokenVerificationResult {
    status: number;
    message: string;
}

// 사용자 상태 확장을 위한 타입 정의
declare module 'koa' {
    interface DefaultState {
        user?: TokenPayload; // User보다 완전한 토큰 페이로드 사용
    }
}

export interface LoginBody {
    username: string;
    password: string;
}