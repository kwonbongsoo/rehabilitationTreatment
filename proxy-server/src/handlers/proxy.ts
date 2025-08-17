import { cookieUtils } from '../utils/cookie';
import { LoggingUtils } from '../utils/logging';
import { authMiddleware } from '../middleware/auth';
import { kongHandler } from './kong';
import { nextJsHandler } from './nextjs';

// 메트릭 시스템 import
const metricsPath = '../../monitoring/bun-proxy-metrics.js';
let ProxyMetrics: any = null;

// 메트릭 서비스 동적 로딩
async function loadProxyMetrics() {
  try {
    if (process.env.METRICS_ENABLED === 'true' && !ProxyMetrics) {
      const metricsModule = await import(metricsPath);
      ProxyMetrics = metricsModule.ProxyMetrics;
      console.log('Proxy Handler metrics loaded');
    }
  } catch (error) {
    console.warn('Failed to load proxy metrics:', error instanceof Error ? error.message : error);
  }
}

// 메트릭 로딩 실행
loadProxyMetrics();

export class ProxyHandler {
  async handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const startTime = Date.now();

    // Health 체크 요청 감지
    const isHealthCheck = this.isHealthCheckRequest(req, url);

    // 메트릭 수집: 라우팅 결정 기록
    if (ProxyMetrics && !isHealthCheck) {
      const routeType = url.pathname.startsWith('/api/') ? 'api' : 'html';
      const target = url.pathname.startsWith('/api/') ? 'kong-gateway' : 'nextjs';
      ProxyMetrics.recordRouting(routeType, target);
    }

    try {
      // 1. 인증 처리 (health 체크가 아닐 때만)
      let accessToken: string | null = null;
      let newTokenData = null;
      let authTimer = null;

      if (!isHealthCheck) {
        const authResult = await authMiddleware.processAuth(req);
        accessToken = authResult.accessToken;
        newTokenData = authResult.newTokenData ?? null;
      }

      // 2. URL 기반 라우팅
      let response: Response;

      if (url.pathname.startsWith('/api/')) {
        // API 요청 -> Kong Gateway로 프록시
        const upstreamStartTime = Date.now();
        response = await kongHandler.handleRequest(req, accessToken ?? undefined);
        
        // 업스트림 요청 메트릭 기록
        if (ProxyMetrics && !isHealthCheck) {
          const duration = (Date.now() - upstreamStartTime) / 1000;
          ProxyMetrics.recordUpstreamRequest('kong-gateway', response.status, duration, response.ok);
        }
      } else {
        // 페이지 요청 -> Next.js로 프록시
        const upstreamStartTime = Date.now();
        response = await nextJsHandler.handleRequest(req, accessToken ?? undefined);
        
        // 업스트림 요청 메트릭 기록
        if (ProxyMetrics && !isHealthCheck) {
          const duration = (Date.now() - upstreamStartTime) / 1000;
          ProxyMetrics.recordUpstreamRequest('nextjs', response.status, duration, response.ok);
        }
      }

      // 3. 새 토큰 발급 시 쿠키 설정 (health 체크가 아닐 때만)
      if (newTokenData && !isHealthCheck) {
        response = cookieUtils.setTokenCookies(response, newTokenData);
        
        // 토큰 갱신 기록
        if (ProxyMetrics) {
          ProxyMetrics.recordGuestToken('refreshed', 'success');
        }
      }

      return response;
    } catch (error) {
      // 에러 메트릭 기록
      if (ProxyMetrics && !isHealthCheck) {
        ProxyMetrics.recordError(error instanceof Error ? error.name : 'UnknownError', 'proxy');
      }
      throw error;
    }
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
      'GoogleHC', // Google Load Balancer
      'kube-probe', // Kubernetes
      'Warmup-Request', // 내부 웜업 요청
    ];

    // URL 패턴 체크
    const isHealthPath =
      url.pathname === '/health' || url.pathname === '/ping' || url.pathname === '/_health';

    // User-Agent 패턴 체크
    const isHealthUserAgent = healthCheckPatterns.some((pattern) =>
      userAgent.toLowerCase().includes(pattern.toLowerCase()),
    );

    return isHealthPath || isHealthUserAgent;
  }
}

export const proxyHandler = new ProxyHandler();
