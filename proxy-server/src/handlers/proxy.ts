import { cookieUtils } from '../utils/cookie';
import { LoggingUtils } from '../utils/logging';
import { authMiddleware } from '../middleware/auth';
import { kongHandler } from './kong';
import { nextJsHandler } from './nextjs';

export class ProxyHandler {
  async handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);

    // Health 체크 요청 감지
    const isHealthCheck = this.isHealthCheckRequest(req, url);

    // 1. 인증 처리 (health 체크가 아닐 때만)
    let accessToken: string | null = null;
    let newTokenData = null;
    
    if (!isHealthCheck) {
      const authResult = await authMiddleware.processAuth(req);
      accessToken = authResult.accessToken;
      newTokenData = authResult.newTokenData;
    }

    // 2. URL 기반 라우팅
    let response: Response;

    if (url.pathname.startsWith('/api/')) {
      // API 요청 -> Kong Gateway로 프록시
      LoggingUtils.logRouting(url.pathname, 'API', '🐉');
      response = await kongHandler.handleRequest(req, accessToken ?? undefined);
    } else {
      // 페이지 요청 -> Next.js로 프록시
      // LoggingUtils.logRouting(url.pathname, 'page', '⚛️');
      response = await nextJsHandler.handleRequest(req, accessToken ?? undefined);
    }

    // 3. 새 토큰 발급 시 쿠키 설정 (health 체크가 아닐 때만)
    if (newTokenData && !isHealthCheck) {
      return cookieUtils.setTokenCookies(response, newTokenData);
    }

    return response;
  }

  /**
   * Health 체크 요청인지 확인
   */
  private isHealthCheckRequest(req: Request, url: URL): boolean {
    // User-Agent 기반 감지
    const userAgent = req.headers.get('User-Agent') || '';
    
    // 일반적인 health check 패턴들
    const healthCheckPatterns = [
      'health',
      'ping',
      'monitor',
      'check',
      'probe',
      'ELB-HealthChecker', // AWS ALB
      'GoogleHC',          // Google Load Balancer
      'kube-probe',        // Kubernetes
      'Warmup-Request'     // 내부 웜업 요청
    ];

    // URL 패턴 체크
    const isHealthPath = url.pathname === '/health' || 
                        url.pathname === '/ping' || 
                        url.pathname === '/_health';

    // User-Agent 패턴 체크
    const isHealthUserAgent = healthCheckPatterns.some(pattern => 
      userAgent.toLowerCase().includes(pattern.toLowerCase())
    );

    return isHealthPath || isHealthUserAgent;
  }
}

export const proxyHandler = new ProxyHandler();
