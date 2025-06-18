import { MemberBase } from './member';

// 허용되는 역할 명시
export type UserRole = 'guest' | 'user' | 'admin';

export interface LoginBody {
  id: string;
  password: string;
}

// 기본 토큰 페이로드 (공통 속성)
export interface BaseTokenPayload {
  role: UserRole;
  exp: number;
  iat: number;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
}

// 유저 토큰 페이로드 (유저 속성 추가)
export interface UserTokenPayload extends BaseTokenPayload {
  id: string;
  email: string;
  name: string;
}

export interface UserToken {
  id: string;
  email: string;
  name: string;
}

// 게스트 토큰 페이로드 (추가 속성 없음)
export interface GuestTokenPayload extends BaseTokenPayload {}

// TokenPayload는 유니온 타입으로 통합
export type TokenPayload = UserTokenPayload | GuestTokenPayload;

/**
 * 토큰 응답 인터페이스
 */
export interface TokenPayloadI {
  token: string;
  payload: TokenPayload;
}

export interface TokenResponseDataI {
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
