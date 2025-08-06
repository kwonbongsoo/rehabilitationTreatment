'use server';

import { cookies } from 'next/headers';
import {
  LoginRequest,
  LoginActionResult,
  RegisterRequest,
  RegisterResponse,
  RegisterActionResult,
  ForgotPasswordRequest,
  LogoutActionResult,
  ProxyLoginResponse,
} from '@/domains/auth/types/auth';
import { HeaderBuilderFactory } from '@/lib/server/headerBuilder';
import {
  handleApiResponseForServerAction,
  safeServerAction,
} from '@/lib/server/serverActionErrorHandler';
import { ValidationError, AuthenticationError } from '@ecommerce/common';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
const KONG_GATEWAY_URL = process.env.KONG_GATEWAY_URL;

/**
 * 로그인 서버 액션
 *
 * 1. 백엔드 API에 로그인 요청을 보낸다.
 * 2. 성공 시 토큰 및 사용자 정보를 쿠키에 저장한다.
 * 3. 클라이언트에는 최소한의 정보만 반환한다.
 */
export async function login(credentials: LoginRequest): Promise<LoginActionResult> {
  try {
    // 입력 검증
    if (!credentials.id || !credentials.password) {
      throw new ValidationError('아이디와 비밀번호를 입력해주세요.');
    }

    const cookieStore = await cookies();
    const existingToken = cookieStore.get('access_token')?.value;

    const headers = await HeaderBuilderFactory.createForBasicAuth()
      .withPreviousToken(existingToken)
      .build();

    const apiResponse = await fetch(`${AUTH_SERVICE_URL}/api/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify(credentials),
      cache: 'no-store',
    });

    const result = await handleApiResponseForServerAction(apiResponse, '로그인');
    if (!result.success) {
      return result as LoginActionResult;
    }

    const response = result.data;

    // 2) 쿠키 저장
    const isProduction = process.env.NODE_ENV === 'production';
    // Ensure response matches expected structure
    if (!response || typeof response !== 'object' || !('data' in response)) {
      throw new AuthenticationError('유효하지 않은 로그인 응답입니다.');
    }
    const { data } = response as ProxyLoginResponse;

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
    const { role, id = '', email = '', name = '', exp, iat } = data;

    return {
      success: true,
      data: { role, id, email, name, exp, iat },
    };
  } catch (error) {
    const result = await safeServerAction(() => {
      throw error;
    }, '로그인');

    return result as LoginActionResult;
  }
}

/**
 * 로그아웃 서버 액션
 *
 * 1. 백엔드 API에 로그아웃 요청을 보낸다.
 * 2. 클라이언트 및 서버 쿠키를 삭제한다.
 * 3. 추가 반환값은 없다.
 */
export async function logout(): Promise<LogoutActionResult> {
  const result = await safeServerAction(async () => {
    const cookieStore = await cookies();

    try {
      const headers = await HeaderBuilderFactory.createForApiRequest().build();

      const apiResponse = await fetch(`${AUTH_SERVICE_URL}/api/auth/logout`, {
        method: 'POST',
        headers,
        cache: 'no-store',
      });

      // 로그아웃은 성공/실패 관계없이 쿠키 삭제
      cookieStore.delete('access_token');
      cookieStore.delete('access_type');

      if (!apiResponse.ok && apiResponse.status !== 401) {
        const result = await handleApiResponseForServerAction(apiResponse, '로그아웃');
        return result;
      }

      const response = await apiResponse.json();
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      // 로그아웃 실패해도 쿠키는 삭제
      cookieStore.delete('access_token');
      cookieStore.delete('access_type');
      throw error;
    }
  }, '로그아웃');

  return result as LogoutActionResult;
}

/**
 * 회원가입 서버 액션
 */
export async function register(
  userData: RegisterRequest,
  idempotencyKey: string,
): Promise<RegisterActionResult> {
  const result = await safeServerAction(async () => {
    // 입력 검증
    if (!userData.id || !userData.password || !userData.name || !userData.email) {
      throw new ValidationError('모든 필수 정보를 입력해주세요.');
    }

    if (userData.password !== userData.confirmPassword) {
      throw new ValidationError('비밀번호가 일치하지 않습니다.');
    }

    // 클라이언트에서 반드시 멱등성 키를 전달받아야 함
    if (!idempotencyKey) {
      throw new ValidationError('멱등성 키가 누락되었습니다.');
    }

    const headers = await HeaderBuilderFactory.createForIdempotentRequest(idempotencyKey).build();

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

    const result = await handleApiResponseForServerAction<RegisterResponse>(
      apiResponse,
      '회원가입',
    );
    if (!result.success) {
      return result;
    }

    return {
      success: true,
      data: result.data as RegisterResponse,
    };
  }, '회원가입');

  return result as RegisterActionResult;
}

/**
 * 비밀번호 찾기(임시 스텁)
 *
 * 실제 API가 준비되면 구현 예정. 현재는 호출 시 에러를 throw 하여
 * 개발 단계에서 인지할 수 있도록 한다.
 */
export async function forgotPassword(_request: ForgotPasswordRequest): Promise<void> {
  void _request;
  // TODO: 실제 API 구현 시 safeServerAction으로 래핑 필요
  await Promise.resolve();
  throw new ValidationError('비밀번호 찾기 기능은 아직 구현되지 않았습니다.');
}
