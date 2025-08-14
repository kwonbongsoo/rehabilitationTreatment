// Bun Proxy Server에 메트릭 통합 예시

import { ProxyMetrics, createMetricsMiddleware, metricsHandler, healthHandler } from './bun-proxy-metrics.js';

// 기존 proxy-server/src/index.ts 에 통합하는 방법

class ProxyServer {
  constructor() {
    this.server = null;
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
    
    // 메트릭 미들웨어 초기화
    this.metricsMiddleware = createMetricsMiddleware();
  }

  async handleRequest(req, res) {
    // 메트릭 미들웨어 적용
    await this.metricsMiddleware(req, res, async () => {
      // 메트릭 엔드포인트 처리
      if (req.url === '/metrics') {
        return metricsHandler(req, res);
      }

      // 헬스체크 엔드포인트 처리
      if (req.url === '/health') {
        return healthHandler(req, res);
      }

      // 기존 프록시 로직
      await this.proxyRequest(req, res);
    });
  }

  async proxyRequest(req, res) {
    const startTime = Date.now();
    let upstreamTarget = '';
    let cacheStatus = 'miss';

    try {
      // 1. 캐시 확인 (HTML 캐싱)
      if (this.isHtmlRequest(req)) {
        const cacheKey = this.getCacheKey(req);
        const cachedResponse = await this.redis.get(cacheKey);
        
        if (cachedResponse) {
          // 🎯 캐시 HIT 메트릭
          cacheStatus = 'hit';
          this.cacheStats.hits++;
          ProxyMetrics.recordCacheOperation('get', 'hit', 'html');
          
          res.setHeader('X-Cache-Status', 'HIT');
          res.setHeader('Content-Type', 'text/html');
          res.end(cachedResponse);
          return;
        } else {
          // 🎯 캐시 MISS 메트릭
          cacheStatus = 'miss';
          this.cacheStats.misses++;
          ProxyMetrics.recordCacheOperation('get', 'miss', 'html');
        }
      }

      // 2. 업스트림 요청
      if (req.url.startsWith('/api/')) {
        // Kong Gateway로 라우팅
        upstreamTarget = 'kong-gateway';
        const response = await this.forwardToKong(req);
        
        // 🎯 업스트림 요청 메트릭
        const upstreamDuration = (Date.now() - startTime) / 1000;
        ProxyMetrics.recordUpstreamRequest(
          upstreamTarget, 
          response.status, 
          upstreamDuration,
          response.ok
        );

        // 응답 전달
        res.statusCode = response.status;
        for (const [key, value] of response.headers) {
          res.setHeader(key, value);
        }
        res.end(await response.text());

      } else {
        // Next.js로 라우팅
        upstreamTarget = 'nextjs';
        const response = await this.forwardToNextJs(req);
        
        const upstreamDuration = (Date.now() - startTime) / 1000;
        ProxyMetrics.recordUpstreamRequest(
          upstreamTarget, 
          response.status, 
          upstreamDuration,
          response.ok
        );

        const responseText = await response.text();

        // 3. HTML 응답 캐싱
        if (this.isHtmlRequest(req) && response.ok && response.headers.get('content-type')?.includes('text/html')) {
          const cacheKey = this.getCacheKey(req);
          
          try {
            await this.redis.setex(cacheKey, 60, responseText); // 1분 TTL
            this.cacheStats.sets++;
            
            // 🎯 캐시 SET 메트릭
            ProxyMetrics.recordCacheOperation('set', 'success', 'html');
          } catch (error) {
            ProxyMetrics.recordCacheOperation('set', 'failure', 'html');
          }
        }

        // 응답 전달
        res.statusCode = response.status;
        for (const [key, value] of response.headers) {
          res.setHeader(key, value);
        }
        res.setHeader('X-Cache-Status', cacheStatus);
        res.end(responseText);
      }

    } catch (error) {
      console.error('Proxy error:', error);
      
      // 🎯 에러 메트릭
      if (upstreamTarget) {
        const errorDuration = (Date.now() - startTime) / 1000;
        ProxyMetrics.recordUpstreamRequest(upstreamTarget, 500, errorDuration, false);
      }

      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }

  async handleGuestToken(req, res) {
    try {
      const token = await this.authService.generateGuestToken();
      
      // 🎯 게스트 토큰 발급 메트릭
      ProxyMetrics.recordGuestToken('issued');
      
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ token }));
      
    } catch (error) {
      ProxyMetrics.recordGuestToken('failed');
      res.statusCode = 500;
      res.end('Failed to generate guest token');
    }
  }

  // 캐시 통계 주기적 업데이트
  startCacheStatsUpdater() {
    setInterval(() => {
      // 🎯 캐시 히트율 업데이트
      ProxyMetrics.updateCacheStats(this.cacheStats.hits, this.cacheStats.misses, 'html');
      
      // 통계 리셋 (1시간마다)
      const now = Date.now();
      if (!this.lastStatsReset || now - this.lastStatsReset > 3600000) {
        this.cacheStats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
        this.lastStatsReset = now;
      }
    }, 10000); // 10초마다 업데이트
  }

  isHtmlRequest(req) {
    const url = new URL(req.url, 'http://localhost');
    return !url.pathname.startsWith('/api/') && 
           !url.pathname.startsWith('/_next/') &&
           !url.pathname.includes('.');
  }

  getCacheKey(req) {
    const url = new URL(req.url, 'http://localhost');
    return `html_cache:${url.host}${url.pathname}`;
  }

  async forwardToKong(req) {
    const kongUrl = `${process.env.KONG_GATEWAY_URL}${req.url}`;
    
    return fetch(kongUrl, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' ? await req.text() : undefined
    });
  }

  async forwardToNextJs(req) {
    const nextUrl = `${process.env.NEXT_SERVER}${req.url}`;
    
    return fetch(nextUrl, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' ? await req.text() : undefined
    });
  }

  start(port = 9000) {
    this.server = Bun.serve({
      port,
      fetch: (req) => this.handleRequest(req, new Response())
    });

    // 캐시 통계 업데이터 시작
    this.startCacheStatsUpdater();

    console.log(`🚀 Proxy Server with Metrics running on http://localhost:${port}`);
    console.log(`📊 Metrics available at: http://localhost:${port}/metrics`);
    console.log(`❤️ Health check at: http://localhost:${port}/health`);
  }
}

// 사용 예시
const proxyServer = new ProxyServer();
proxyServer.start(9000);

export default ProxyServer;