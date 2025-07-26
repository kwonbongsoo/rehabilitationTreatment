'use server';

import { cookies } from 'next/headers';
import {
  LoginRequest,
  LoginActionResult,
  RegisterRequest,
  RegisterResponse,
  RegisterActionResult,
  ForgotPasswordRequest,
  LogoutResponse,
} from '@/domains/auth/types/auth';
import { HeaderBuilderFactory } from '@/lib/server/headerBuilder';

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
    const cookieStore = await cookies();
    const existingToken = cookieStore.get('access_token')?.value;

    const headers = await HeaderBuilderFactory.createForBasicAuth()
      .withPreviousToken(existingToken)
      .build();

    console.log('Attempting login for:', credentials.id);

    const apiResponse = await fetch(`${AUTH_SERVICE_URL}/api/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify(credentials),
      cache: 'no-store',
    });

    if (!apiResponse.ok) {
      let errorMessage = `HTTP error! status: ${apiResponse.status}`;

      try {
        const errorResponse = await apiResponse.json();
        console.error('API Error Response:', errorResponse);

        if (errorResponse?.message) {
          errorMessage = errorResponse.message;
        } else if (errorResponse?.error) {
          errorMessage = errorResponse.error;
        }
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
      }

      console.error('Login failed with message:', errorMessage);

      // 사용자 친화적인 에러 메시지로 변환
      if (errorMessage.includes('not found')) {
        errorMessage = '존재하지 않는 사용자입니다.';
      } else if (errorMessage.includes('password')) {
        errorMessage = '비밀번호가 올바르지 않습니다.';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    const response = await apiResponse.json();

    // 2) 쿠키 저장
    const isProduction = process.env.NODE_ENV === 'production';
    // Ensure response matches expected structure
    if (!response || typeof response !== 'object' || !('data' in response)) {
      return {
        success: false,
        error: '유효하지 않은 로그인 응답입니다.',
      };
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
      success: true,
      data: { role, id, email, name, exp, iat },
    };
  } catch (error) {
    console.error('Login action error:', error);

    return {
      success: false,
      error: '로그인 중 오류가 발생했습니다.',
    };
  }
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
    const headers = await HeaderBuilderFactory.createForApiRequest().build();

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
): Promise<RegisterActionResult> {
  try {
    // 멱등성 키가 없으면 서버에서 생성 (안전 장치)
    const key = idempotencyKey ?? `register_${Date.now()}_${crypto.randomUUID()}`;

    const headers = await HeaderBuilderFactory.createForIdempotentRequest(key).build();

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
      let errorMessage = `HTTP error! status: ${apiResponse.status}`;

      try {
        const errorResponse = await apiResponse.json();
        if (errorResponse?.message) {
          errorMessage = errorResponse.message;
        } else if (errorResponse?.error) {
          errorMessage = errorResponse.error;
        }
      } catch {
        // JSON 파싱 실패 시 기본 메시지 사용
      }

      // 사용자 친화적인 메시지로 변환
      if (errorMessage.includes('already exists')) {
        errorMessage = '이미 사용 중인 아이디입니다.';
      } else if (errorMessage.includes('email')) {
        errorMessage = '이미 사용 중인 이메일입니다.';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    const response = await apiResponse.json();
    return {
      success: true,
      data: response.data as RegisterResponse,
    };
  } catch (error) {
    console.error('Register action error:', error);

    return {
      success: false,
      error: '회원가입 중 오류가 발생했습니다.',
    };
  }
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
