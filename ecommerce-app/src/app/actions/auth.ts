'use server';

import { cookies } from 'next/headers';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  LogoutResponse,
} from '@/domains/auth/types/auth';
import { AUTH_SERVICE_URL, KONG_GATEWAY_URL } from '@/api/config';

/**
 * 로그인 서버 액션
 *
 * 1. 백엔드 API에 로그인 요청을 보낸다.
 * 2. 성공 시 토큰 및 사용자 정보를 쿠키에 저장한다.
 * 3. 클라이언트에는 최소한의 정보만 반환한다.
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  // 1) API 호출 - Basic Auth 사용
  const authBasicKey = process.env.AUTH_BASIC_KEY;
  if (!authBasicKey) {
    throw new Error('AUTH_BASIC_KEY 환경 변수가 설정되어 있지 않습니다.');
  }

  const cookieStore = await cookies();
  const existingToken = cookieStore.get('access_token')?.value;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${Buffer.from(authBasicKey).toString('base64')}`,
  };
  
  // 기존 게스트 토큰이 있으면 X-Previous-Token으로 전달 (게스트 토큰 만료용)
  if (existingToken) {
    headers['X-Previous-Token'] = existingToken;
  }

  const apiResponse = await fetch(`${AUTH_SERVICE_URL}/api/auth/login`, {
    method: 'POST',
    headers,
    body: JSON.stringify(credentials),
    cache: 'no-store',
  });

  if (!apiResponse.ok) {
    throw new Error(`HTTP error! status: ${apiResponse.status}`);
  }

  const response = await apiResponse.json();

  // 2) 쿠키 저장
  const isProduction = process.env.NODE_ENV === 'production';
  // Ensure response matches expected structure
  if (!response || typeof response !== 'object' || !('data' in response)) {
    throw new Error('Invalid login response structure');
  }
  const { data } = response;

  // 액세스 토큰 쿠키
  if (data?.access_token) {
    const maxAge = data.exp
      ? Math.max(0, data.exp - Math.floor(Date.now() / 1000))
      : 60 * 60 * 24 * 7;
    cookieStore.set('access_token', data.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: maxAge,
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
  const cookieStore = await cookies();
  try {
    const accessToken = cookieStore.get('access_token')?.value;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const apiResponse = await fetch(`${AUTH_SERVICE_URL}/api/auth/logout`, {
      method: 'POST',
      headers,
      cache: 'no-store',
    });

    if (!apiResponse.ok && apiResponse.status !== 401) {
      throw new Error(`HTTP error! status: ${apiResponse.status}`);
    }

    const response = await apiResponse.json();
    return response;
  } catch (error) {
    console.error('logout error', error);
    return {
      success: false,
      message: '로그아웃에 실패했습니다.',
    };
  } finally {
    cookieStore.delete('access_token');
    cookieStore.delete('access_type');
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
  const key = idempotencyKey ?? `register_${Date.now()}_${crypto.randomUUID()}`;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Idempotency-Key': key,
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // 1) Kong Gateway를 통한 회원가입 호출
  const apiResponse = await fetch(`${KONG_GATEWAY_URL}/api/members`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      id: userData.id,
      password: userData.password,
      name: userData.name,
      email: userData.email,
    }),
    cache: 'no-store',
  });

  if (!apiResponse.ok) {
    throw new Error(`HTTP error! status: ${apiResponse.status}`);
  }

  const response = await apiResponse.json();
  return response.data as RegisterResponse;
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

