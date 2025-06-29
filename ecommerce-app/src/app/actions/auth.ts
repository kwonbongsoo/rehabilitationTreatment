'use server';

import { cookies } from 'next/headers';
import {
  LoginRequest,
  LoginResponse,
  ProxyLoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  SessionInfoResponse,
  LogoutResponse,
} from '@/api/models/auth';
import { apiService } from '@/api/apiClient';

/**
 * 로그인 서버 액션
 *
 * 1. 백엔드 API에 로그인 요청을 보낸다.
 * 2. 성공 시 토큰 및 사용자 정보를 쿠키에 저장한다.
 * 3. 클라이언트에는 최소한의 정보만 반환한다.
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  // 1) API 호출
  const response = await apiService.login(credentials);

  // 2) 쿠키 저장
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';
  const { data } = response as unknown as ProxyLoginResponse; // proxy 구조 이용

  // 액세스 토큰 쿠키
  if (data?.access_token) {
    cookieStore.set('access_token', data.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  // 역할 정보 쿠키 (클라이언트 접근 가능)
  if (data?.role) {
    cookieStore.set('access_type', data.role, {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  // 3) 클라이언트로 필요한 정보만 반환
  const { role, id, email, name, exp, iat } = data;
  return {
    data: { role, id, email, name, exp, iat },
  } as LoginResponse;
}

/**
 * 로그아웃 서버 액션
 *
 * 1. 백엔드 API에 로그아웃 요청을 보낸다.
 * 2. 클라이언트 및 서버 쿠키를 삭제한다.
 * 3. 추가 반환값은 없다.
 */
export async function logout(): Promise<LogoutResponse> {
  // 1) 백엔드 로그아웃 호출 (실패해도 쿠키는 삭제)
  try {
    const response = await apiService.logout();
    // 2) 쿠키 삭제
    const cookieStore = await cookies();
    cookieStore.delete('access_token');
    cookieStore.delete('access_type');
    return response;
  } catch (error) {
    return {
      success: false,
      message: '로그아웃에 실패했습니다.',
    };
  }
}

/**
 * 회원가입 서버 액션
 */
export async function register(
  userData: RegisterRequest,
  idempotencyKey?: string,
): Promise<RegisterResponse> {
  // 멱등성 키가 없으면 서버에서 생성 (안전 장치)
  const key = idempotencyKey ?? `register_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  // 1) 백엔드 회원가입 호출
  const response = await apiService.register(userData, key);

  return response as unknown as RegisterResponse;
}

/**
 * 비밀번호 찾기(임시 스텁)
 *
 * 실제 API가 준비되면 구현 예정. 현재는 호출 시 에러를 throw 하여
 * 개발 단계에서 인지할 수 있도록 한다.
 */
export async function forgotPassword(_request: ForgotPasswordRequest): Promise<void> {
  throw new Error('Forgot password API is not implemented yet.');
}

/**
 * 세션 정보 조회 서버 액션
 *
 * 1. 쿠키에서 access_token 추출
 * 2. 인증 서버에 세션 정보 요청
 */
export async function getSessionInfo(): Promise<SessionInfoResponse> {
  const cookieStore = await cookies();
  const tokenExists = Boolean(cookieStore.get('access_token')?.value);

  if (!tokenExists) {
    const { AuthenticationError } = await import('@ecommerce/common');
    throw new AuthenticationError('인증이 필요합니다.'); // 401
  }

  return apiService.getSessionInfo();
}
