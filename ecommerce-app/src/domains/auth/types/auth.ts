/**
 * 로그인 요청 모델
 */
export interface LoginRequest {
  id: string;
  password: string;
}

/**
 * 로그인 응답 모델
 */
export interface ProxyLoginResponse {
  data: {
    access_token: string;
    role: UserRole;
    exp: number;
    iat: number;
    id?: string;
    email?: string;
    name?: string;
  };
}

export interface LoginResponse {
  data: {
    role: UserRole;
    exp: number;
    iat: number;
    id?: string;
    email?: string;
    name?: string;
  };
}

export interface ProxySessionInfoResponse {
  data: {
    access_token: string;
    role: UserRole;
    exp: number;
    iat: number;
    id?: string;
    email?: string;
    name?: string;
  };
}

export interface SessionInfoResponse {
  data: {
    role: UserRole;
    exp: number;
    iat: number;
    id?: string;
    email?: string;
    name?: string;
  };
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

/**
 * 로그아웃 요청 모델
 */
export interface LogoutRequest {
  // 필요시 추가
}

/**
 * 로그아웃 응답 모델
 */
export interface LogoutResponse {
  success: boolean;
  message: string;
}

/**
 * 토큰 응답 모델
 */
export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
}

/**
 * 토큰 갱신 요청 모델
 */
export interface RefreshTokenRequest {
  refresh_token: string;
}

/**
 * 토큰 갱신 응답 모델
 */
export interface RefreshTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
}

export type UserRole = 'guest' | 'user' | 'admin';
