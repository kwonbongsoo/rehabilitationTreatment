import { cookies, headers } from 'next/headers';
import { NextRequest } from 'next/server';

/**
 * 헤더 빌더 인터페이스
 * 단일 책임 원칙: 헤더 생성에만 집중
 */
export interface HeaderBuilder {
  withContentType(contentType?: string): HeaderBuilder;
  withAuth(type: 'bearer' | 'basic', value?: string): HeaderBuilder;
  withIdempotencyKey(key: string): HeaderBuilder;
  withPreviousToken(token?: string): HeaderBuilder;
  withCustomHeader(key: string, value: string): HeaderBuilder;
  build(): Promise<Record<string, string>>;
}

/**
 * 헤더 빌더 구현체
 * Builder 패턴을 사용하여 헤더를 체이닝 방식으로 구성
 */
class HttpHeaderBuilder implements HeaderBuilder {
  private headers: Record<string, string> = {};
  private authType?: 'bearer' | 'basic';
  private authValue?: string;

  withContentType(contentType = 'application/json'): HeaderBuilder {
    this.headers['Content-Type'] = contentType;
    return this;
  }

  withAuth(type: 'bearer' | 'basic', value?: string): HeaderBuilder {
    this.authType = type;
    if (value) {
      this.authValue = value;
    }
    return this;
  }

  withIdempotencyKey(key: string): HeaderBuilder {
    this.headers['X-Idempotency-Key'] = key;
    return this;
  }

  withPreviousToken(token?: string): HeaderBuilder {
    if (token) {
      this.headers['X-Previous-Token'] = token;
    }
    return this;
  }

  withCustomHeader(key: string, value: string): HeaderBuilder {
    this.headers[key] = value;
    return this;
  }

  async build(): Promise<Record<string, string>> {
    // Authorization 헤더 처리
    if (this.authType) {
      const authToken = await this.resolveAuthToken();
      if (authToken) {
        this.headers['Authorization'] = this.formatAuthHeader(authToken);
      }
    }

    return { ...this.headers };
  }

  private async resolveAuthToken(): Promise<string> {
    if (this.authValue) {
      return this.authValue;
    }

    try {
      const headersList = await headers();
      const authHeader = headersList.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7);
      }
    } catch {
      // 헤더 읽기 자체가 실패한 경우는 그냥 넘어감
    }

    // 헤더에서 못 찾았거나 읽기 실패한 경우
    try {
      const cookieStore = await cookies();
      return cookieStore.get('access_token')?.value || '';
    } catch {
      return '';
    }
  }

  private formatAuthHeader(token: string): string {
    switch (this.authType) {
      case 'bearer':
        return `Bearer ${token}`;
      case 'basic':
        return `Basic ${Buffer.from(token).toString('base64')}`;
      default:
        return token;
    }
  }
}

/**
 * 미들웨어용 헤더 빌더 구현체
 * Edge Runtime에서 사용 가능 (cookies() 함수 대신 NextRequest.cookies 사용)
 */
class MiddlewareHeaderBuilder implements HeaderBuilder {
  private headers: Record<string, string> = {};
  private authType?: 'bearer' | 'basic';
  private authValue?: string;
  private request?: NextRequest;

  constructor(request?: NextRequest) {
    if (request) {
      this.request = request;
    }
  }

  withContentType(contentType = 'application/json'): HeaderBuilder {
    this.headers['Content-Type'] = contentType;
    return this;
  }

  withAuth(type: 'bearer' | 'basic', value?: string): HeaderBuilder {
    this.authType = type;
    if (value) {
      this.authValue = value;
    }
    return this;
  }

  withIdempotencyKey(key: string): HeaderBuilder {
    this.headers['X-Idempotency-Key'] = key;
    return this;
  }

  withPreviousToken(token?: string): HeaderBuilder {
    if (token) {
      this.headers['X-Previous-Token'] = token;
    }
    return this;
  }

  withCustomHeader(key: string, value: string): HeaderBuilder {
    this.headers[key] = value;
    return this;
  }

  async build(): Promise<Record<string, string>> {
    // Authorization 헤더 처리
    if (this.authType) {
      const authToken = await this.resolveAuthTokenFromRequest();
      if (authToken) {
        this.headers['Authorization'] = this.formatAuthHeader(authToken);
      }
    }

    return { ...this.headers };
  }

  private async resolveAuthTokenFromRequest(): Promise<string | undefined> {
    if (this.authValue) {
      return this.authValue;
    }

    // NextRequest에서 토큰 추출
    return await this.request?.cookies.get('access_token')?.value;
  }

  private formatAuthHeader(token: string): string {
    switch (this.authType) {
      case 'bearer':
        return `Bearer ${token}`;
      case 'basic':
        return `Basic ${btoa(token)}`;
      default:
        return token;
    }
  }
}

/**
 * 헤더 빌더 팩토리
 * 의존성 주입 원칙: 구체적인 구현체를 숨기고 인터페이스를 제공
 */
export class HeaderBuilderFactory {
  static create(): HeaderBuilder {
    return new HttpHeaderBuilder();
  }

  /**
   * 일반적인 API 요청용 헤더 빌더 프리셋
   */
  static createForApiRequest(): HeaderBuilder {
    return new HttpHeaderBuilder().withContentType().withAuth('bearer');
  }

  /**
   * Basic Auth용 헤더 빌더 프리셋
   */
  static createForBasicAuth(authKey?: string): HeaderBuilder {
    const envKey = authKey || process.env.AUTH_BASIC_KEY;
    if (!envKey) {
      throw new Error('AUTH_BASIC_KEY 환경 변수가 설정되어 있지 않습니다.');
    }

    return new HttpHeaderBuilder().withContentType().withAuth('basic', envKey);
  }

  /**
   * 멱등성 키가 필요한 요청용 헤더 빌더 프리셋
   */
  static createForIdempotentRequest(idempotencyKey: string): HeaderBuilder {
    return new HttpHeaderBuilder()
      .withContentType()
      .withAuth('bearer')
      .withIdempotencyKey(idempotencyKey);
  }

  /**
   * 멀티파트 요청용 헤더 빌더 프리셋 (Content-Type 제외)
   */
  static createForMultipartRequest(idempotencyKey: string): HeaderBuilder {
    return new HttpHeaderBuilder().withAuth('bearer').withIdempotencyKey(idempotencyKey);
  }

  /**
   * 미들웨어용 헤더 빌더 (Edge Runtime 호환)
   */
  static createForMiddleware(request?: NextRequest): HeaderBuilder {
    return new MiddlewareHeaderBuilder(request);
  }

  /**
   * 미들웨어에서 Basic Auth용 헤더 빌더 프리셋
   */
  static createForMiddlewareBasicAuth(request?: NextRequest, authKey?: string): HeaderBuilder {
    const envKey = authKey || process.env.AUTH_BASIC_KEY;
    if (!envKey) {
      throw new Error('AUTH_BASIC_KEY 환경 변수가 설정되어 있지 않습니다.');
    }

    return new MiddlewareHeaderBuilder(request)
      .withContentType()
      .withAuth('basic', envKey)
      .withCustomHeader('User-Agent', 'NextJS-Middleware');
  }
}
