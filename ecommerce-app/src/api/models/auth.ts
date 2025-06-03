/**
 * 로그인 요청 모델
 */
export interface LoginRequest {
    id: string;
    password: string;
}

export type UserRole = 'guest' | 'user' | 'admin';

/**
 * 로그인 응답 모델
 */
export interface LoginResponse {
    data: {
        token: string;
        role: UserRole;
        exp: number;
        iat: number;
        id?: string;
        email?: string;
        name?: string;
    }
}

export interface SessionInfoResponse {
    data: {
        token: string;
        role: UserRole;
        exp: number;
        iat: number;
        id?: string;
        email?: string;
        name?: string;
    }
}


/**
 * 회원가입 요청 모델
 */
export interface RegisterRequest {
    id: string;
    password: string;
    confirmPassword: string;
    name: string;
    email: string;
}

/**
 * 회원가입 응답 모델
 */
export interface RegisterResponse {
    user: UserResponse;
    message?: string;
}

/**
 * 기존 호환성을 위한 SignupRequest (deprecated)
 * @deprecated Use RegisterRequest instead
 */
export interface SignupRequest {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    marketingConsent?: boolean;
    termsAccepted: boolean;
    privacyPolicyAccepted: boolean;
}

/**
 * 사용자 응답 모델 (민감한 정보 제외)
 */
export interface UserResponse {
    role: UserRole;
    id?: string;
    email?: string;
    name?: string;
}


export interface SessionResponse {
    role: UserRole;
    id?: string;
    email?: string;
    name?: string;
}

/**
 * 비밀번호 변경 요청 모델
 */
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

/**
 * 비밀번호 찾기 요청 모델
 */
export interface ForgotPasswordRequest {
    email: string;
}

/**
 * 비밀번호 찾기 응답 모델
 */
export interface ForgotPasswordResponse {
    message: string;
    success: boolean;
}

/**
 * 비밀번호 재설정 요청 모델
 */
export interface ResetPasswordRequest {
    email: string;
}

/**
 * 비밀번호 재설정 확인 모델
 */
export interface ResetPasswordConfirmRequest {
    token: string;
    newPassword: string;
    confirmNewPassword: string;
}

/**
 * 이메일 인증 요청 모델
 */
export interface VerifyEmailRequest {
    token: string;
}