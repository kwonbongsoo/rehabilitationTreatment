# 애플리케이션 메트릭 구현 가이드

## 개요

기존 External Exporter 방식에 **애플리케이션 내장 메트릭**을 추가하여 더 상세하고 비즈니스 중심적인 모니터링을 구현합니다.

## 📦 필요한 패키지 설치

```bash
# Node.js 서비스에 공통 설치 (Fastify, Koa, NestJS, Next.js)
npm install prom-client

# Next.js 전용 (Web Vitals)
npm install web-vitals

# Bun Proxy Server는 패키지 설치 불필요 (커스텀 구현)
# - prom-client가 Bun 런타임과 호환성 이슈 가능성
# - 경량화된 메트릭 수집기 직접 구현
```

## 🐳 Docker 기반 프로젝트 설정

### 메트릭 파일 복사 확인
각 서비스의 Dockerfile에 다음과 같이 메트릭 파일이 복사되어 있는지 확인하세요:

```dockerfile
# Fastify 서버 (Member Server, BFF Server)
COPY monitoring/application-metrics/fastify-metrics.mjs ./monitoring/

# Koa 서버 (Auth Server)
COPY monitoring/application-metrics/koa-metrics.mjs ./monitoring/

# NestJS 서버 (Product Domain Server)
COPY monitoring/application-metrics/nestjs-metrics.mjs ./monitoring/

# Next.js 앱 (Ecommerce App)
COPY monitoring/application-metrics/nextjs-metrics.mjs ./monitoring/

# Bun Proxy Server
COPY monitoring/application-metrics/bun-proxy-metrics.js ./monitoring/
```

### Docker 내부 경로 구조
```
/app/
├── src/              # 애플리케이션 소스
├── dist/             # 빌드된 코드 (Node.js 서비스)
├── monitoring/       # 메트릭 파일들
│   ├── fastify-metrics.mjs
│   ├── koa-metrics.mjs
│   ├── nestjs-metrics.mjs
│   ├── nextjs-metrics.mjs
│   └── bun-proxy-metrics.js
└── node_modules/     # 의존성
```

### 환경변수 설정

#### .env 파일 예시 (각 서비스별)
```bash
# 개발 환경 (로컬)
NODE_ENV=development
METRICS_ENABLED=true

# 프로덕션 환경 (Docker)
NODE_ENV=production
METRICS_ENABLED=true

# 선택적: 커스텀 메트릭 경로 지정
# METRICS_PATH=/custom/path/to/metrics
```

#### Docker Compose 환경변수
```yaml
# docker-compose.yaml
services:
  member-server:
    environment:
      - NODE_ENV=production
      - METRICS_ENABLED=true

  auth-server:
    environment:
      - NODE_ENV=production
      - METRICS_ENABLED=true
```

### 환경별 실행 방법

#### 로컬 개발 환경
```bash
# 각 서비스 디렉토리에서
NODE_ENV=development npm run dev

# 또는 .env 파일에 설정
echo "NODE_ENV=development" > .env
npm run dev
```

#### Docker 환경
```bash
# 전체 스택 실행 (모니터링 포함)
./start-full-stack.sh

# 또는 수동 실행
docker-compose -f docker-compose.yaml -f docker-compose.min.yml -f docker-compose.monitoring.yml up -d
```

### 🔧 개발 팁

#### 1. 메트릭 활성화 확인
```javascript
// 개발 모드에서 메트릭 로딩 확인
if (process.env.NODE_ENV === 'development') {
  console.log('📊 Metrics enabled:', process.env.METRICS_ENABLED);
  console.log('📂 Metrics path:', metricsPath);
}
```

#### 2. 조건부 메트릭 로딩
```javascript
// 메트릭이 비활성화된 경우 스킵
if (process.env.METRICS_ENABLED !== 'true') {
  console.log('📊 Metrics disabled, skipping...');
  // 메트릭 로딩 스킵
} else {
  const { metricsPlugin, metrics } = await import(metricsPath);
  // 메트릭 플러그인 등록
}
```

#### 3. 에러 핸들링
```javascript
// 메트릭 로딩 실패시 graceful fallback
try {
  const { metricsPlugin, metrics } = await import(metricsPath);
  await fastify.register(metricsPlugin);
  console.log('📊 Metrics loaded successfully');
} catch (error) {
  console.warn('⚠️ Failed to load metrics:', error.message);
  console.log('🔄 Application continues without metrics');
}
```

## 서비스별 구현 방법

### 1. Fastify 서버 (Member Server, BFF Server)

#### 로컬 개발 환경
```javascript
// src/app.ts 또는 server.ts
import { metricsPlugin, metrics } from '../monitoring/application-metrics/fastify-metrics.mjs';
```

#### Docker 환경
```javascript
// src/app.ts 또는 server.ts
import { metricsPlugin, metrics } from './monitoring/fastify-metrics.mjs';
```

#### 환경변수 기반 (권장)
```javascript
// src/app.ts 또는 server.ts
// const metricsPath = process.env.NODE_ENV === 'production'
//   ? './monitoring/fastify-metrics.mjs'  // Docker
//   : '../monitoring/application-metrics/fastify-metrics.mjs';  // 로컬
const metricsPath = './monitoring/fastify-metrics.mjs';


const { metricsPlugin, metrics } = await import(metricsPath);

async function createServer() {
  const fastify = Fastify({ logger: true });

  // 메트릭 플러그인 등록
  await fastify.register(metricsPlugin, {
    serviceName: 'member-server' // 또는 'bff-server'
  });

  // 기존 라우트들...

  return fastify;
}

// 비즈니스 로직에서 메트릭 사용 예시
// src/services/memberService.ts

// 환경변수 기반 import (권장)
const metricsPath = process.env.NODE_ENV === 'production'
  ? './monitoring/fastify-metrics.mjs'  // Docker
  : '../monitoring/application-metrics/fastify-metrics.mjs';  // 로컬

const { metrics } = await import(metricsPath);

class MemberService {
  async createMember(memberData) {
    try {
      const member = await this.repository.create(memberData);

      // ✅ 성공 메트릭 기록
      metrics.recordMemberOperation('create', 'success', 'member-server');

      return member;
    } catch (error) {
      // ❌ 실패 메트릭 기록
      metrics.recordMemberOperation('create', 'failure', 'member-server');
      throw error;
    }
  }

  async findById(id) {
    metrics.recordCacheOperation('get', 'attempt', 'member-server');

    // Redis 캐시 확인
    const cached = await this.redis.get(`member:${id}`);
    if (cached) {
      metrics.recordCacheOperation('get', 'hit', 'member-server');
      return JSON.parse(cached);
    }

    metrics.recordCacheOperation('get', 'miss', 'member-server');

    // DB에서 조회
    const member = await this.repository.findById(id);

    // 캐시에 저장
    await this.redis.setex(`member:${id}`, 300, JSON.stringify(member));
    metrics.recordCacheOperation('set', 'success', 'member-server');

    return member;
  }
}
```

### 2. Koa.js 서버 (Auth Server)

#### 환경변수 기반 (권장)
```javascript
// src/app.ts

// 동적 import로 환경에 맞는 경로 사용
const metricsPath = process.env.NODE_ENV === 'production'
  ? './monitoring/koa-metrics.mjs'  // Docker
  : '../monitoring/application-metrics/koa-metrics.mjs';  // 로컬

const { createMetricsMiddleware, createMetricsRoutes, authMetrics } = await import(metricsPath);
import Router from '@koa/router';

const app = new Koa();
const router = new Router();

// 메트릭 미들웨어 등록
app.use(createMetricsMiddleware('auth-server'));

// 메트릭 라우트 등록
createMetricsRoutes(router, 'auth-server');

// 기존 라우트들...
app.use(router.routes());

// 비즈니스 로직에서 메트릭 사용 예시
// src/services/authService.ts

// 환경변수 기반 import
const metricsPath = process.env.NODE_ENV === 'production'
  ? './monitoring/koa-metrics.mjs'  // Docker
  : '../monitoring/application-metrics/koa-metrics.mjs';  // 로컬

const { authMetrics } = await import(metricsPath);

class AuthService {
  async login(email, password) {
    try {
      const user = await this.validateCredentials(email, password);

      if (!user) {
        // ❌ 로그인 실패
        authMetrics.recordLoginFailure('invalid_credentials');
        throw new Error('Invalid credentials');
      }

      const token = this.generateJWT(user);

      // ✅ 로그인 성공
      authMetrics.recordLoginSuccess('password');

      // 세션 저장
      await this.redis.setex(`session:${user.id}`, 3600, token);
      authMetrics.recordRedisOperation('set', 'success');

      return { token, user };
    } catch (error) {
      authMetrics.recordLoginFailure('system_error');
      throw error;
    }
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ 토큰 검증 성공
      authMetrics.recordTokenVerification(true);

      return decoded;
    } catch (error) {
      // ❌ 토큰 검증 실패
      authMetrics.recordTokenVerification(false);
      throw error;
    }
  }
}
```

### 3. NestJS 서버 (Product Domain Server)

```typescript
// src/app.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
// 환경변수 기반 import
const metricsPath = process.env.NODE_ENV === 'production'
  ? './monitoring/nestjs-metrics'  // Docker
  : '../monitoring/application-metrics/nestjs-metrics';  // 로컬

const { MetricsMiddleware, MetricsController, ProductMetricsService } = await import(metricsPath);

@Module({
  controllers: [MetricsController, /* 기존 컨트롤러들 */],
  providers: [ProductMetricsService, /* 기존 서비스들 */],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}

// src/controllers/products.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
// 환경변수 기반 import
const metricsPath = process.env.NODE_ENV === 'production'
  ? './monitoring/nestjs-metrics'  // Docker
  : '../monitoring/application-metrics/nestjs-metrics';  // 로컬

const { ProductMetricsService } = await import(metricsPath);

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly metricsService: ProductMetricsService
  ) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const product = await this.productsService.findOne(id);

      // ✅ 상품 조회 성공
      this.metricsService.recordProductDetailView(id, product.category.name);

      return product;
    } catch (error) {
      this.metricsService.recordProductOperation('read', 'failure');
      throw error;
    }
  }

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    try {
      const product = await this.productsService.create(createProductDto);

      // ✅ 상품 생성 성공
      this.metricsService.recordProductCreated(createProductDto.categoryId);

      return product;
    } catch (error) {
      this.metricsService.recordProductCreationFailed(error.message);
      throw error;
    }
  }

  @Post('images')
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    for (const file of files) {
      try {
        const imageUrl = await this.s3Service.upload(file);

        // ✅ 이미지 업로드 성공
        this.metricsService.recordImageUpload('success', file.size);

      } catch (error) {
        // ❌ 이미지 업로드 실패
        this.metricsService.recordImageUpload('failure', file.size);
        throw error;
      }
    }
  }
}
```

### 4. Bun Proxy Server (Entry Point)

```javascript
// src/index.ts (기존 proxy-server 코드에 통합)

// 환경변수 기반 import (Bun은 동적 import 지원)
const metricsPath = process.env.NODE_ENV === 'production'
  ? './monitoring/bun-proxy-metrics.js'  // Docker
  : '../monitoring/application-metrics/bun-proxy-metrics.js';  // 로컬

const { ProxyMetrics, createMetricsMiddleware, metricsHandler, healthHandler } = await import(metricsPath);

class ProxyServer {
  constructor() {
    this.metricsMiddleware = createMetricsMiddleware();
    this.cacheStats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
  }

  async handleRequest(req, res) {
    // 메트릭 미들웨어 적용
    await this.metricsMiddleware(req, res, async () => {
      if (req.url === '/metrics') return metricsHandler(req, res);
      if (req.url === '/health') return healthHandler(req, res);

      await this.proxyRequest(req, res);
    });
  }

  async proxyRequest(req, res) {
    const startTime = Date.now();
    let cacheStatus = 'miss';

    try {
      // HTML 캐시 확인
      if (this.isHtmlRequest(req)) {
        const cachedResponse = await this.redis.get(this.getCacheKey(req));

        if (cachedResponse) {
          cacheStatus = 'hit';
          this.cacheStats.hits++;

          // 🎯 캐시 HIT 메트릭
          ProxyMetrics.recordCacheOperation('get', 'hit', 'html');

          res.setHeader('X-Cache-Status', 'HIT');
          res.end(cachedResponse);
          return;
        } else {
          this.cacheStats.misses++;
          ProxyMetrics.recordCacheOperation('get', 'miss', 'html');
        }
      }

      // 업스트림 요청
      let upstreamTarget = req.url.startsWith('/api/') ? 'kong-gateway' : 'nextjs';
      const response = await this.forwardRequest(req, upstreamTarget);

      // 🎯 업스트림 메트릭
      const upstreamDuration = (Date.now() - startTime) / 1000;
      ProxyMetrics.recordUpstreamRequest(upstreamTarget, response.status, upstreamDuration, response.ok);

      // HTML 응답 캐싱
      const responseText = await response.text();
      if (this.shouldCache(req, response)) {
        await this.redis.setex(this.getCacheKey(req), 60, responseText);
        ProxyMetrics.recordCacheOperation('set', 'success', 'html');
      }

      res.statusCode = response.status;
      res.setHeader('X-Cache-Status', cacheStatus);
      res.end(responseText);

    } catch (error) {
      console.error('Proxy error:', error);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }

  // 게스트 토큰 발급
  async handleGuestToken(req, res) {
    try {
      const token = await this.authService.generateGuestToken();

      // 게스트 토큰 발급 메트릭
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
      ProxyMetrics.updateCacheStats(this.cacheStats.hits, this.cacheStats.misses, 'html');
    }, 10000); // 10초마다
  }
}
```

### 5. Next.js Frontend

```javascript
// pages/api/metrics.js
// 환경변수 기반 import
const metricsPath = process.env.NODE_ENV === 'production'
  ? './monitoring/nextjs-metrics.mjs'  // Docker
  : '../monitoring/application-metrics/nextjs-metrics.mjs';  // 로컬

const { withMetrics, serverMetrics } = await import(metricsPath);
import client from 'prom-client';

async function handler(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.send(await client.register.metrics());
}

export default withMetrics(handler);

// pages/_app.js
// 환경변수 기반 import
const metricsPath = process.env.NODE_ENV === 'production'
  ? './monitoring/nextjs-metrics.mjs'  // Docker
  : '../monitoring/application-metrics/nextjs-metrics.mjs';  // 로컬

const { initWebVitals, clientMetrics } = await import(metricsPath);

function MyApp({ Component, pageProps }) {
  React.useEffect(() => {
    // Web Vitals 자동 수집 시작
    initWebVitals();

    // 전역 에러 핸들러
    window.addEventListener('error', (event) => {
      clientMetrics.recordError(event.error, window.location.pathname);
    });

    window.addEventListener('unhandledrejection', (event) => {
      clientMetrics.recordError(event.reason, window.location.pathname);
    });
  }, []);

  return <Component {...pageProps} />;
}

// 컴포넌트에서 사용자 상호작용 추적
// components/ProductCard.tsx
// 환경변수 기반 import
const metricsPath = process.env.NODE_ENV === 'production'
  ? './monitoring/nextjs-metrics.mjs'  // Docker
  : '../monitoring/application-metrics/nextjs-metrics.mjs';  // 로컬

const { clientMetrics } = await import(metricsPath);

function ProductCard({ product }) {
  const handleClick = () => {
    // 사용자 상호작용 기록
    clientMetrics.recordUserInteraction('click', 'ProductCard', '/products');

    // 상품 페이지로 이동
    router.push(`/products/${product.id}`);
  };

  return (
    <div onClick={handleClick}>
      {/* 상품 카드 내용 */}
    </div>
  );
}
```


## Proxy Server 특화 메트릭

Proxy Server는 **전체 시스템의 Entry Point**로서 다른 서비스와 차별화된 메트릭을 제공합니다:

### Proxy만 측정 가능한 고유 메트릭
```yaml
✅ 전체 트래픽 진입점: 실제 사용자 경험의 시작점
✅ 캐시 효율성: HTML 캐시 히트율, 응답 속도 개선 효과
✅ 라우팅 분석: API vs 정적 자산 vs HTML 요청 분포
✅ 업스트림 상태: Kong/Next.js 각각의 응답성과 가용성
✅ 게스트 사용자: 비인증 사용자 패턴 및 토큰 발급 추이
✅ 시스템 전체 건강도: 각 업스트림 서비스의 응답 상태
```

### Bun 런타임 고려사항
- **prom-client 호환성**: Node.js 전용 라이브러리로 Bun에서 이슈 가능
- **커스텀 구현**: 경량화된 메트릭 수집기로 성능 최적화
- **Prometheus 호환**: 표준 메트릭 형식으로 기존 대시보드 연동


## 구현 순서

1. **Proxy Server**: 전체 트래픽 Entry Point 메트릭
2. **Auth Server**: 인증 관련 비즈니스 메트릭
3. **Member/BFF Server**: 회원 및 API 메트릭
4. **Product Server**: 상품 관련 비즈니스 메트릭
5. **Frontend**: 사용자 경험 메트릭

모든 서비스에 애플리케이션 메트릭을 추가하여 완전한 옵저빌리티를 확보할 수 있습니다.
