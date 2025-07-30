export class ProxyHeaderUtils {
  /**
   * Authorization Bearer 헤더 추가
   */
  static addAuthorizationHeader(headers: Headers, token?: string): void {
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  /**
   * 표준 프록시 헤더들 추가
   */
  static addProxyHeaders(headers: Headers, req: Request): void {
    const url = new URL(req.url);

    headers.set('X-Forwarded-For', req.headers.get('x-forwarded-for') || 'unknown');
    headers.set('X-Forwarded-Proto', url.protocol.slice(0, -1));
    headers.set('X-Forwarded-Host', url.host);
  }

  /**
   * 프록시 소스 식별 헤더 추가
   */
  static addProxySourceHeader(headers: Headers, source: string = 'bun-proxy'): void {
    headers.set('X-Proxy-Source', source);
  }

  /**
   * Request에서 새로운 Headers 객체 생성하고 프록시 헤더들 추가
   */
  static createProxyHeaders(
    req: Request,
    token?: string,
    additionalHeaders?: Record<string, string>,
  ): Headers {
    const headers = new Headers(req.headers);

    // Authorization 헤더 추가
    this.addAuthorizationHeader(headers, token);

    // 프록시 헤더들 추가
    this.addProxyHeaders(headers, req);
    this.addProxySourceHeader(headers);

    // 추가 헤더들이 있으면 설정
    if (additionalHeaders) {
      Object.entries(additionalHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }

    return headers;
  }

  /**
   * 토큰 로깅 (보안을 위해 일부만 표시)
   */
  static logAuthorizationHeader(token?: string, target: string = 'target'): void {
    if (token) {
      console.log(
        `🔐 Added Authorization header for ${target}: Bearer ${token.substring(0, 20)}...`,
      );
    } else {
      console.log(`⚠️  No access token available for ${target} request`);
    }
  }
}
