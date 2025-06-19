import { apiClient } from '../api/apiClient';
import { getApiConfig } from '../api/config';
import { BaseError } from '@ecommerce/common';

export interface ProxyTestResult {
  success: boolean;
  method: string;
  url: string;
  status?: number;
  data?: any;
  error?: string;
  errorDetails?: any;
  duration: number;
  proxyType: string;
}

export class IndividualProxyTester {
  private apiClient = apiClient;

  /**
   * 로그인 API 테스트 (개별 프록시)
   */
  async testLoginAPI(credentials: { id: string; password: string }): Promise<ProxyTestResult> {
    const startTime = Date.now();

    try {
      console.log('🔐 Testing Login API via individual proxy...');

      const data = await this.apiClient.post('/auth/login', credentials);
      const duration = Date.now() - startTime;

      return {
        success: true,
        method: 'POST',
        url: '/auth/login',
        status: 200, // 성공 시 200으로 가정
        data: data,
        duration,
        proxyType: 'individual',
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        method: 'POST',
        url: '/auth/login',
        status: error.response?.status,
        error: error.message,
        errorDetails: this.extractErrorDetails(error),
        duration,
        proxyType: 'individual',
      };
    }
  }

  /**
   * 세션 정보 조회 API 테스트 (개별 프록시)
   */
  async testSessionInfoAPI(): Promise<ProxyTestResult> {
    const startTime = Date.now();

    try {
      console.log('ℹ️ Testing Session Info API via individual proxy...');

      const response = await this.apiClient.get('/auth/session-info');
      const duration = Date.now() - startTime;

      return {
        success: true,
        method: 'GET',
        url: '/auth/session-info',
        status: response.status,
        data: response.data,
        duration,
        proxyType: 'individual',
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        method: 'GET',
        url: '/auth/session-info',
        status: error.response?.status,
        error: error.message,
        errorDetails: this.extractErrorDetails(error),
        duration,
        proxyType: 'individual',
      };
    }
  }

  /**
   * 멤버 목록 조회 API 테스트 (개별 프록시)
   */
  async testMembersListAPI(): Promise<ProxyTestResult> {
    const startTime = Date.now();

    try {
      console.log('👥 Testing Members List API via individual proxy...');

      const response = await this.apiClient.get('/members');
      const duration = Date.now() - startTime;

      return {
        success: true,
        method: 'GET',
        url: '/members',
        status: response.status,
        data: response.data,
        duration,
        proxyType: 'individual',
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        method: 'GET',
        url: '/members',
        status: error.response?.status,
        error: error.message,
        errorDetails: this.extractErrorDetails(error),
        duration,
        proxyType: 'individual',
      };
    }
  }

  /**
   * 멤버 생성 API 테스트 (개별 프록시)
   */
  async testMemberCreateAPI(memberData: {
    id: string;
    email: string;
    name: string;
    password: string;
  }): Promise<ProxyTestResult> {
    const startTime = Date.now();

    try {
      console.log('➕ Testing Member Create API via individual proxy...');

      const response = await this.apiClient.post('/members', memberData);
      const duration = Date.now() - startTime;

      return {
        success: true,
        method: 'POST',
        url: '/members',
        status: response.status,
        data: response.data,
        duration,
        proxyType: 'individual',
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        method: 'POST',
        url: '/members',
        status: error.response?.status,
        error: error.message,
        errorDetails: this.extractErrorDetails(error),
        duration,
        proxyType: 'individual',
      };
    }
  }

  /**
   * 멤버 인증 API 테스트 (개별 프록시)
   */
  async testMemberVerifyAPI(credentials: {
    id: string;
    password: string;
  }): Promise<ProxyTestResult> {
    const startTime = Date.now();

    try {
      console.log('🔐 Testing Member Verify API via individual proxy...');

      const response = await this.apiClient.post('/members/verify', credentials);
      const duration = Date.now() - startTime;

      return {
        success: true,
        method: 'POST',
        url: '/members/verify',
        status: response.status,
        data: response.data,
        duration,
        proxyType: 'individual',
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        method: 'POST',
        url: '/members/verify',
        status: error.response?.status,
        error: error.message,
        errorDetails: this.extractErrorDetails(error),
        duration,
        proxyType: 'individual',
      };
    }
  }

  /**
   * 개별 멤버 조회 API 테스트 (개별 프록시)
   */
  async testMemberByIdAPI(memberId: string): Promise<ProxyTestResult> {
    const startTime = Date.now();

    try {
      console.log(`👤 Testing Member By ID API via individual proxy for ID: ${memberId}...`);

      const response = await this.apiClient.get(`/members/${memberId}`);
      const duration = Date.now() - startTime;

      return {
        success: true,
        method: 'GET',
        url: `/members/${memberId}`,
        status: response.status,
        data: response.data,
        duration,
        proxyType: 'individual',
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        method: 'GET',
        url: `/members/${memberId}`,
        status: error.response?.status,
        error: error.message,
        errorDetails: this.extractErrorDetails(error),
        duration,
        proxyType: 'individual',
      };
    }
  }

  /**
   * 에러에서 상세 정보 추출
   */
  private extractErrorDetails(error: any): any {
    if (error.response?.data) {
      // 공통 에러 모듈의 ErrorResponse 형식인 경우
      const responseData = error.response.data;
      if (responseData.error) {
        return {
          code: responseData.error.code,
          message: responseData.error.message,
          details: responseData.error.details,
          timestamp: responseData.timestamp,
        };
      }
      return responseData;
    }

    // 기타 에러 정보
    return {
      name: error.name,
      message: error.message,
      code: error.code,
      status: error.response?.status,
    };
  }

  /**
   * 전체 개별 프록시 테스트 실행
   */
  async runFullIndividualProxyTest(): Promise<void> {
    console.log('🚀 Starting Individual Proxy API Tests...');
    console.log(
      `📍 API Base URL: ${process.env.NODE_ENV === 'development' ? '/api (dev proxy)' : '/api (production proxy)'}`,
    );
    console.log('🔒 Using individual proxy functions for security (HttpOnly cookies)');

    const results: ProxyTestResult[] = [];
    const config = getApiConfig();

    // 1. 로그인 테스트
    const loginResult = await this.testLoginAPI({
      id: 'test@example.com',
      password: 'password123',
    });
    results.push(loginResult);

    // 2. 세션 정보 테스트
    const sessionResult = await this.testSessionInfoAPI();
    results.push(sessionResult);

    // 3. 멤버 목록 테스트
    const membersResult = await this.testMembersListAPI();
    results.push(membersResult);

    // 4. 멤버 인증 테스트
    const verifyResult = await this.testMemberVerifyAPI({
      id: 'testuser',
      password: 'password123',
    });
    results.push(verifyResult);

    // 5. 멤버 생성 테스트
    const createResult = await this.testMemberCreateAPI({
      id: 'newuser',
      email: 'newuser@example.com',
      name: 'New User',
      password: 'password123',
    });
    results.push(createResult);

    // 6. 개별 멤버 조회 테스트
    const memberByIdResult = await this.testMemberByIdAPI('testuser');
    results.push(memberByIdResult);

    // 결과 출력
    this.printTestResults(results);
  }

  /**
   * 테스트 결과 출력
   */
  private printTestResults(results: ProxyTestResult[]): void {
    console.log('\n📊 Individual Proxy Test Results:');
    console.log('================================');

    results.forEach((result, index) => {
      const status = result.success ? '✅ SUCCESS' : '❌ FAILED';
      const statusCode = result.status ? `(${result.status})` : '';

      console.log(`${index + 1}. ${result.method} ${result.url} - ${status} ${statusCode}`);
      console.log(`   Duration: ${result.duration}ms | Proxy: ${result.proxyType}`);

      if (result.error) {
        console.log(`   Error: ${result.error}`);

        // 공통 에러 모듈의 에러 정보 표시
        if (result.errorDetails?.code) {
          console.log(`   Error Code: ${result.errorDetails.code}`);
          if (result.errorDetails.details?.reason) {
            console.log(`   Error Reason: ${result.errorDetails.details.reason}`);
          }
          if (result.errorDetails.details?.context) {
            console.log(`   Error Context:`, result.errorDetails.details.context);
          }
        }
      }

      console.log('');
    });

    const successCount = results.filter((r) => r.success).length;
    const totalCount = results.length;

    console.log(`Summary: ${successCount}/${totalCount} individual proxy tests passed`);
    console.log('================================\n');
  }
}

// 전역 인스턴스
export const individualProxyTester = new IndividualProxyTester();

/**
 * 쿠키 토큰 테스트
 */
export function testCookieToken() {
  if (typeof window === 'undefined') {
    console.log('❌ 서버사이드에서는 document.cookie에 접근할 수 없습니다');
    return;
  }

  console.log('🍪 현재 브라우저 쿠키 상태:');
  console.log('전체 쿠키:', document.cookie);

  // access_token 쿠키 확인
  const cookies = document.cookie.split(';');
  const accessTokenCookie = cookies.find((cookie) => cookie.trim().startsWith('access_token='));

  if (accessTokenCookie) {
    const [, token] = accessTokenCookie.split('=');
    console.log('✅ access_token 쿠키 발견:', token.substring(0, 20) + '...');
  } else {
    console.log('❌ access_token 쿠키를 찾을 수 없습니다');
  }
}

/**
 * 프록시 API 테스트 함수
 */
export async function testProxyAPI(endpoint: string, options: RequestInit = {}) {
  console.log(`🧪 Testing proxy API: ${endpoint}`);

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    let data: unknown = null;
    const text = await response.text();
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    console.log(`📊 Response Status: ${response.status}`);
    console.log('📋 Response Data:', data);

    if (response.ok) {
      console.log('✅ API 호출 성공');
    } else {
      console.log('❌ API 호출 실패');
    }

    return { response, data };
  } catch (error) {
    console.error('💥 API 호출 중 에러:', error);
    throw error;
  }
}

/**
 * 인증이 필요한 API 테스트
 */
export async function testAuthenticatedAPI(endpoint: string, options: RequestInit = {}) {
  console.log(`🔐 Testing authenticated API: ${endpoint}`);

  // 쿠키 토큰 상태 확인
  testCookieToken();

  return testProxyAPI(endpoint, options);
}

/**
 * 세션 정보 테스트
 */
export async function testSessionInfo() {
  return testAuthenticatedAPI('/api/auth/session-info', {
    method: 'GET',
  });
}

/**
 * 멤버 목록 조회 테스트
 */
export async function testMemberList() {
  return testAuthenticatedAPI('/api/members', {
    method: 'GET',
  });
}

/**
 * 로그인 테스트
 */
export async function testLogin(id: string, password: string) {
  console.log('🔑 Testing login...');

  const result = await testProxyAPI('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ id, password }),
  });

  // 로그인 성공 후 쿠키 상태 재확인
  if (result.response.ok) {
    console.log('🍪 로그인 후 쿠키 상태 확인:');
    setTimeout(() => testCookieToken(), 100); // 쿠키 설정 대기
  }

  return result;
}

/**
 * 개발자 도구 콘솔용 테스트 함수들을 전역에 등록
 */
export function registerGlobalTestFunctions() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (window as any).proxyTest = {
      testCookieToken,
      testProxyAPI,
      testAuthenticatedAPI,
      testSessionInfo,
      testMemberList,
      testLogin,
    };

    console.log('🧪 프록시 테스트 함수들이 window.proxyTest에 등록되었습니다:');
    console.log('- proxyTest.testCookieToken()');
    console.log('- proxyTest.testSessionInfo()');
    console.log('- proxyTest.testMemberList()');
    console.log('- proxyTest.testLogin("user_id", "password")');
  }
}
