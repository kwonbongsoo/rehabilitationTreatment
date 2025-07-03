# E-Commerce 플랫폼

마이크로서비스 아키텍처 기반의 이커머스 플랫폼입니다.

## 시스템 아키텍처

```
┌──────────────┐     HTTP 요청     ┌──────────────────────────────────┐
│              │ ─────────────────►│                                  │
│   클라이언트  │                   │         Next.js                  │
│  (브라우저/앱) │ ◄─────────────── │    (프론트엔드 Proxy)             │
└──────────────┘     HTTP 응답     └────────────┬─────────────────────┘
                                                                                   │
                                                                                   │ API Routes (/api/*)
                                                                                   │ HttpOnly 쿠키 → Bearer 토큰 변환
                                                                                   │
                ┌───────────────────────────────┼─────────────────────────────────┐
                │ 내부 도커 네트워크 (외부 접근 차단) │                                 │
                │                               ▼                                 │
                │         ┌──────────────┐     직접     ┌──────────────┐          │
                │         │              │◄────────────┤              │          │
                │         │  Auth 서비스  │     통신     │              │          │
                │         │   (Koa)      │             │              │          │
                │         └──────┬───────┘             │              │          │
                │                │                     │   Next.js    │          │
                │                ▼                     │  API Routes  │          │
                │         ┌──────────────┐             │              │──────────┼───┐
                │         │    Redis     │             │              │          │   │
                │         │  (토큰/캐시)  │             └──────────────┘          │   │
                │         └──────────────┘                      │                │   │
                │                                               │ Kong API       │   │
                │                                               ▼ Gateway       │   │
                │                                        ┌──────────────┐       │   │
                │                                        │              │       │   │
                │ ┌──────────────┐                       │     Kong     │       │   │
                │ │              │◄──────────────────────┤ API Gateway  │       │   │
                │ │ Member 서비스 │                       │              │       │   │
                │ │  (Fastify)   │                       └─────┬────────┘       │   │
                │ └──────┬───────┘                             │                │   │
                │        │                                     │                │   │
                │        ▼                                     ▼                │   │
                │ ┌──────────────┐                      ┌──────────────┐       │   │
                │ │  PostgreSQL  │                      │ 기타 서비스들 │◄──────┼───┘
                │ │  (Database)  │                      │(Order,Product│       │
                │ └──────────────┘                      │ Payment 등)  │       │
                │                                       └──────────────┘       │
                └─────────────────────────────────────────────────────────────────┘
```

## 주요 특징

### 보안
- Kong Gateway를 통한 API 게이트웨이 구현
- JWT 기반 인증
- Redis를 활용한 세션 관리
- 멱등성 보장을 위한 요청 처리

### 서비스 구성
- **인증 서버** (koa-auth-server)
  - Koa.js 기반 인증 서비스
  - JWT 토큰 발급 및 검증
  - Redis 세션 관리

- **회원 서버** (fastify-member-server)
  - Fastify 기반 회원 관리
  - Prisma ORM
  - 멱등성 처리

- **프론트엔드** (ecommerce-app)
  - Next.js 14 App Router
  - 도메인 주도 설계(DDD) 패턴
  - TypeScript

## 시작하기

### 요구사항
- Node.js 18+
- npm 9+
- Docker & Docker Compose
- Redis

### 설치 및 실행

1. 저장소 클론
```bash
git clone [repository-url]
cd [repository-name]
```

2. 의존성 설치
```bash
# 공통 모듈 설치
cd common
npm install
cd ..

# 인증 서버 설치
cd koa-auth-server
npm install
cd ..

# 회원 서버 설치
cd fastify-member-server
npm install
cd ..

# 프론트엔드 설치
cd ecommerce-app
npm install
cd ..
```

3. 환경 변수 설정
```bash
# 각 서비스 디렉토리에서
cp .env.example .env
```

4. Docker Compose로 실행
```bash
docker-compose up
```

## 서비스 포트

- Kong Gateway: 8000
- 인증 서버: 4000
- 회원 서버: 5000
- 프론트엔드: 3000

## API 문서

- 인증 서버: http://localhost:4000/docs
- 회원 서버: http://localhost:5000/docs

## 테스트

각 서비스 디렉토리에서:
```bash
npm test
```

## 라이선스

MIT

## 향후 계획

### 아키텍처 개선

#### BFF (Backend for Frontend) 도입
- 프론트엔드 전용 API 게이트웨이 구축
- GraphQL 기반 데이터 집계 최적화
- 클라이언트별 맞춤형 API 제공

#### 장애 격리 시스템 구축
- Circuit Breaker 패턴 적용
- S3 기반 정적 폴백 데이터 관리
- 컴포넌트별 독립적인 장애 복구 전략
- SSR 환경에서의 안정성 확보

#### 성능 최적화
- Kong Gateway 캐싱 전략 고도화
  - Full Route Cache 적용
  - 세분화된 캐시 정책 수립
- 성능 테스트 및 규격 산정
  - TPS(Transaction Per Second) 측정
  - 부하 테스트 기반 인프라 규격 최적화
  - 병목 구간 식별 및 개선

#### 모니터링 체계 구축
- Prometheus + Grafana 기반 메트릭 수집
  - 실시간 성능 모니터링
  - 서비스별 핵심 지표 대시보드
  - 알림 체계 구축
- 분산 추적 시스템 도입
  - 서비스간 호출 추적
  - 병목 구간 시각화

### 구현 로드맵

1. Phase 1: BFF 및 장애 격리
   - BFF 서버 구축
   - Circuit Breaker 구현
   - 폴백 시스템 구축

2. Phase 2: 성능 최적화
   - Kong 캐싱 전략 수립
   - 성능 테스트 진행
   - 규격 최적화

3. Phase 3: 모니터링
   - 메트릭 수집 파이프라인 구축
   - 대시보드 구성
   - 알림 체계 구축
