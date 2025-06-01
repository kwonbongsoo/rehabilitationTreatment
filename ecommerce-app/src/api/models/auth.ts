/**
 * 로그인 요청 모델
 */
export interface LoginRequest {
    id: string;
    password: string;
    rememberMe?: boolean;
}

/**
 * 로그인 응답 모델
 */
export interface LoginResponse {
    token: string;
    refreshToken?: string;
    expiresIn: number;
    user: UserResponse;
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
    id: string;
    email: string;
    name: string;
    lastName: string;
    fullName: string; // firstName + lastName
    phoneNumber?: string;
    profileImageUrl?: string;
    role: 'customer' | 'admin' | 'guest';
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
    addressCount?: number; // 저장된 주소 수
    defaultAddressId?: string;
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