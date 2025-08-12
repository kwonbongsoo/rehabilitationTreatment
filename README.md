# E-Commerce 플랫폼

마이크로서비스 아키텍처 기반의 이커머스 플랫폼으로, Kong API Gateway, BFF(Backend for Frontend) 패턴, 그리고 Redis 기반 HTML 캐싱 프록시 서버를 적용한 현대적인 웹 애플리케이션입니다.

## 목차

- [UI 데모](#UI-데모)
- [성능 지표](#성능-지표)
- [테스트 코드](#테스트-코드)
- [이미지 최적화 성능 비교](#이미지-최적화-성능-비교)
- [시스템 아키텍처](#시스템-아키텍처)
- [데이터 플로우](#데이터-플로우)
- [Kong Gateway 플러그인 구성](#kong-gateway-플러그인-구성)
- [주요 특징](#주요-특징)
- [서비스 구성](#서비스-구성)
- [네트워크 구성](#네트워크-구성)
- [시작하기](#시작하기)
- [서비스 엔드포인트](#서비스-엔드포인트)
- [API 사용 예시](#api-사용-예시)
- [테스트 구현 현황](#테스트-구현-현황)
- [이미지 압축 기능](#이미지-압축-기능)
- [개발 가이드](#-개발-가이드)
- [프록시 서버 성능 테스트](#-프록시-서버-성능-테스트-결과)
- [향후 계획](#향후-계획)
- [참고 문서](#참고-문서)
- [라이선스](#-라이선스)

## UI 데모
![UI](커머스.png)

## 성능 지표
![Performance](lighthouse.png)

## 테스트 코드
  - 이커머스앱
   ![이커머스앱 테스트코드](test.png)

## 이미지 최적화 성능 비교

### Cloudflare Workers vs Next.js Image 응답속도 테스트

로컬 환경에서 동일한 이미지(120x120px WebP)에 대한 응답속도 측정 결과, **Next.js Image가 압도적으로 빠른 성능**을 보였습니다.

> **참고**: Cloudflare Workers는 직접 구현한 이미지 리사이저 API(`image-resizer.star1231076.workers.dev`)를 사용하며, 내부적으로 3개의 무료 이미지 리사이징 서비스를 순차적으로 시도합니다:
> 1. **WSrv.nl** - 첫 번째 우선순위 서비스
> 2. **Statically** - 백업 서비스 #1
> 3. **Images.weserv.nl** - 백업 서비스 #2
>
> Next.js Image는 내장 최적화 엔진을 사용합니다.

#### 응답속도 측정 결과 (5회 평균)

| 서비스 | 평균 응답시간 | 성능 차이 |
|--------|--------------|----------|
| **Cloudflare Workers** | **0.181초** | 기준 |
| **Next.js Image** | **0.0038초** | **47배 빠름** 🏆 |

#### 상세 측정 데이터

**Cloudflare Workers 응답시간:**
```
0.149s → 0.176s → 0.210s → 0.192s → 0.177s
평균: 0.181초
```

**Next.js Image 응답시간 (공인 IP 접근):**
```
0.0040s → 0.0039s → 0.0037s → 0.0038s → 0.0040s
평균: 0.0038초
```

#### 테스트 조건
- **환경**: 로컬 개발 서버 (공인 IP 포트포워딩)
- **이미지**: `product-default.jpg` → 120x120px WebP 변환
- **측정 도구**: curl with timing metrics
- **네트워크**: 외부 인터넷 접근 (공정한 비교를 위해 수정)

> **테스트 개선**: 기존 `localhost:3000` 호출은 로컬 네트워크로 인해 불공정했습니다. 공인 IP를 통한 외부 접근으로 수정하여 Cloudflare Workers와 동일한 네트워크 조건에서 측정했습니다.

#### 테스트 명령어

**Cloudflare Workers 이미지 리사이저:**
```bash
curl -w "Total time: %{time_total}s\nDNS lookup: %{time_namelookup}s\nConnect: %{time_connect}s\nSSL handshake: %{time_appconnect}s\nTime to first byte: %{time_starttransfer}s\nDownload: %{time_download}s\nHTTP code: %{http_code}\nSize: %{size_download} bytes\n" -o /dev/null -s "https://image-resizer.star1231076.workers.dev/?url=https://static.kbs-cdn.shop/image/product-default.jpg&w=120&h=120&fit=cover&f=webp"
```

**Next.js Image 최적화 (공인 IP 접근):**
```bash
curl -w "Total time: %{time_total}s\nDNS lookup: %{time_namelookup}s\nConnect: %{time_connect}s\nSSL handshake: %{time_appconnect}s\nTime to first byte: %{time_starttransfer}s\nDownload: %{time_download}s\nHTTP code: %{http_code}\nSize: %{size_download} bytes\n" -o /dev/null -s "http://YOUR_PUBLIC_IP:3000/_next/image?url=https%3A%2F%2Fstatic.kbs-cdn.shop%2Fimage%2Fproduct-default.jpg&w=120&q=75"
```

#### 분석 및 결론

**Next.js Image 압도적 우세 요인:**
- **로컬 캐싱**: 한 번 처리된 이미지는 로컬에 캐시되어 즉시 응답
- **내장 최적화**: Next.js 내장 이미지 최적화 엔진의 효율성
- **네트워크 지연 없음**: 로컬 서버에서 직접 처리

**Cloudflare Workers 지연 요인 (첫 번째 요청):**
- **외부 API 체인**: WSrv.nl → Statically → weserv.nl 순차 시도
- **다중 네트워크 홉**: 사용자 → Cloudflare → 외부 리사이징 서비스 → 응답
- **서비스 대기시간**: 첫 번째 서비스 실패 시 다음 서비스 시도까지의 지연
- **온디맨드 처리**: 첫 요청 시에만 이미지 변환 처리
- **네트워크 RTT**: 여러 서비스 간 왕복 지연시간 누적

**Cloudflare Workers 캐싱 전략:**
- **강력한 캐싱**: `Cache-Control: public, max-age=86400, immutable` (24시간)
- **엣지 캐싱**: 두 번째 요청부터는 CDN 엣지에서 즉시 응답
- **글로벌 분산**: 전 세계 엣지 서버에서 캐시된 이미지 제공

#### 실제 프로덕션 환경 고려사항

**공정한 테스트 환경**: Next.js Image 우세 (47배 빠름)

**프로덕션 환경에서는 상황이 달라질 수 있음:**

**Cloudflare Workers 장점:**
- **첫 요청 후 즉시 캐싱**: 24시간 immutable 캐시로 극도로 빠른 재요청 응답
- **글로벌 엣지 분산**: 전 세계 200+ 엣지 서버에서 동일한 성능
- **지역별 일관성**: 사용자 위치와 관계없이 일관된 응답속도

**Next.js Image 제약:**
- **서버 위치 의존**: 애플리케이션 서버 위치에 따른 지역별 성능 차이
- **서버 부하**: 이미지 처리로 인한 애플리케이션 서버 리소스 사용

> **결론**:
> - **개발/테스트 환경**: Next.js Image 우세 (47배 빠름)
> - **글로벌 프로덕션**: Cloudflare Workers가 일관된 고성능 + 서버 부하 분산으로 유리
> - **반복 요청**: Cloudflare Workers는 캐시 히트 시 Next.js와 동등하거나 더 빠른 성능 예상

## 시스템 아키텍처

```mermaid
graph TB
    subgraph "External"
        Client[클라이언트 브라우저/앱]
    end

    subgraph "Proxy Layer"
        Proxy["Bun Proxy Server<br/>Port 9000<br/>HTML 캐싱 Redis<br/>RSC 직접 프록시<br/>게스트 토큰 발급"]
    end

    subgraph "Frontend Layer"
        Frontend["Next.js E-Commerce App<br/>Port 3000<br/>쿠키 to Bearer 토큰 변환"]
    end

    subgraph "Internal Docker Network"
        subgraph "API Gateway"
            Kong["Kong API Gateway<br/>Port 8000<br/>API 프록시<br/>JWT 토큰 검증<br/>멱등성 처리<br/>라우팅"]
        end

        subgraph "Authentication Layer"
            Auth["Auth 서비스<br/>Koa.js Port 4000<br/>JWT 발급/검증<br/>사용자 인증<br/>세션 관리"]
        end

        subgraph "BFF Layer"
            BFF["BFF Server<br/>Fastify Port 3001<br/>UI 최적화 변환<br/>비즈니스 로직 조합"]
        end

        subgraph "Business Services"
            Member["Member 서비스<br/>Fastify Port 5000<br/>회원 관리<br/>CRUD 연산"]
            Product["Product 서비스<br/>NestJS Port 3002<br/>상품 관리<br/>카테고리 & 상품 CRUD<br/>S3 이미지 업로드"]
            Other["기타 비즈니스 서비스<br/>미구현 상태<br/>Order Payment Cart"]
        end

        subgraph "Data Layer"
            Redis[("Redis<br/>토큰 저장<br/>세션 관리<br/>멱등성 캐시")]
            PostgreSQL[("PostgreSQL Database<br/>회원 데이터")]
            ProductDB[("Product PostgreSQL<br/>상품 & 카테고리 데이터<br/>독립 데이터베이스")]
        end
    end

    %% External connections
    Client -->|HTTP 요청| Proxy
    Proxy -->|캐시 HIT| Client
    Proxy -->|HTML/RSC 요청| Frontend
    Frontend -->|응답| Proxy
    Proxy -->|응답| Client

    %% Proxy to internal services
    Proxy -->|/api/* 요청| Kong
    Frontend -.->|직접 인증| Auth

    %% Kong routing
    Kong --> BFF
    Kong --> Auth
    Kong --> Member

    %% BFF connections - 데이터 집계만
    BFF --> Member
    BFF --> Product
    BFF --> Other

    %% Service to data connections
    Auth --> Redis
    Member --> PostgreSQL
    Product --> ProductDB

    %% Styling
    style Client fill:#e3f2fd
    style Proxy fill:#f0f4ff
    style Frontend fill:#f3e5f5
    style Kong fill:#e8f5e8
    style Auth fill:#fff3e0
    style BFF fill:#e1f5fe
    style Member fill:#fff3e0
    style Redis fill:#ffebee
    style PostgreSQL fill:#f1f8e9
    style Other fill:#fafafa
```

## 데이터 플로우

```mermaid
sequenceDiagram
    participant C as Client
    participant F as Next.js Frontend
    participant K as Kong Gateway
    participant B as BFF Server
    participant A as Auth Service
    participant M as Member Service
    participant R as Redis
    participant DB as PostgreSQL

    Note over C,DB: 현재 구현된 아키텍처

    %% 인증 플로우
    rect rgb(255, 248, 220)
        Note over C,R: 사용자 인증 플로우
        C->>F: 로그인 요청
        F->>A: 직접 통신 (포트 4000)
        A->>R: 세션 확인
        A->>R: JWT 토큰 저장
        A-->>F: JWT 토큰 반환
        F-->>C: HttpOnly 쿠키 설정
    end

    %% API 요청 플로우 (BFF 경유)
    rect rgb(240, 248, 255)
        Note over C,DB: BFF를 통한 데이터 집계 플로우
        C->>F: 홈페이지 요청
        F->>F: 쿠키 → Bearer 토큰 변환
        F->>K: Kong Gateway 호출 (/api/home)

        K->>K: 토큰 검증 + 멱등성 체크
        K->>B: BFF Server 라우팅 (포트 3001)

        Note over B,DB: BFF가 여러 서비스에서 데이터 집계
        B->>M: Member 서비스 호출
        M->>DB: 데이터베이스 쿼리
        M-->>B: 회원 데이터

        B->>B: UI 최적화 데이터 변환
        B-->>K: 집계된 응답
        K-->>F: 최종 응답
        F-->>C: 홈페이지 렌더링
    end

    %% 직접 서비스 요청 플로우
    rect rgb(248, 255, 248)
        Note over C,DB: 직접 서비스 호출 플로우
        C->>F: 회원 관리 요청
        F->>K: Kong Gateway 호출 (/api/members)

        K->>K: 토큰 검증 + 멱등성 체크
        K->>M: Member 서비스 직접 호출 (포트 5000)
        M->>DB: 데이터베이스 쿼리
        M-->>K: 회원 데이터
        K-->>F: 최종 응답
        F-->>C: 회원 정보 표시
    end
```

## Kong Gateway 플러그인 구성

```mermaid
graph TD
    Request[Incoming Request] --> Kong{Kong Gateway<br/>Port 8000}

    Kong --> TokenValidator[token-validator plugin<br/>JWT 토큰 검증<br/>Auth Server 연동<br/>Port 4000]
    TokenValidator --> |Valid| Idempotency[idempotency plugin<br/>중복 요청 방지<br/>Redis 저장]
    TokenValidator --> |Invalid| Reject[401 Unauthorized]

    Idempotency --> |New Request| Route[Request Routing]
    Idempotency --> |Duplicate| Cached[Cached Response<br/>from Redis]

    Route --> BFFRoute[BFF Server<br/>/api/home<br/>Port 3001]
    Route --> AuthRoute[Auth Server<br/>/api/auth/*<br/>Port 4000]
    Route --> MemberRoute[Member Server<br/>/api/members/*<br/>Port 5000]

    BFFRoute --> Response[Response to Client]
    AuthRoute --> Response
    MemberRoute --> Response
    Cached --> Response

    style TokenValidator fill:#fff3e0
    style Idempotency fill:#e8f5e8
    style Reject fill:#ffebee
    style Cached fill:#f3e5f5
    style Response fill:#e8f5e8
```

## 주요 특징

### 보안 & 인증
- **Kong API Gateway**: 중앙집중식 API 관리 및 보안
- **JWT 기반 인증**: token-validator 플러그인으로 토큰 검증
- **Redis 세션 관리**: 확장 가능한 세션 저장소
- **멱등성 보장**: 중복 요청 방지 (Redis 기반)
- **내부 네트워크 격리**: Docker 네트워크로 서비스 보호

### 성능 & 안정성
- **BFF 패턴**: 프론트엔드 최적화된 API 응답
- **마이크로서비스**: 서비스별 독립적 확장
- **멱등성 처리**: 안전한 재시도 메커니즘

### 아키텍처 패턴
- **Clean Architecture**: 계층 분리 및 의존성 관리
- **Domain-Driven Design**: 비즈니스 로직 중심 설계
- **API Gateway Pattern**: 중앙집중식 API 관리
- **Backend for Frontend**: 클라이언트 최적화

## 서비스 구성

### Proxy Server (:9000)
```yaml
역할: Next.js 앞단 캐싱 및 라우팅, 게스트 인증 관리
기술 스택: Bun + TypeScript
주요 기능:
  - HTML 페이지 Redis 캐싱 (/, /categories)
  - RSC 요청 직접 프록시 (캐시 우회)
  - 게스트 토큰 발급 및 관리 (인증되지 않은 사용자)
  - 분산 락 기반 캐시 일관성 보장
  - URL 파라미터 정규화로 캐시 효율성 극대화
  - 자동 TTL 관리 (기본 1분)

캐싱 전략:
  - HTML 요청: Redis 캐시 적용 (새로고침, 직접 URL 접근)
  - RSC 요청: Next.js 직접 프록시 (Link 클릭, router.push)
  - 캐시 키: html_cache:{host}{path} (파라미터 제거)
  - 성능: 캐시 HIT 시 밀리초 단위 응답

인증 처리:
  - 로그인 사용자: Kong Gateway 토큰 프록시
  - 게스트 사용자: 임시 게스트 토큰 자동 발급
  - Authorization 헤더 투명 전달
```

### Kong API Gateway (:8000)
```yaml
역할: API 프록시 및 중앙 관리
기술 스택: Kong Community Edition 3.9
주요 기능:
  - API 라우팅 및 프록시
  - JWT 토큰 검증 (token-validator)
  - 멱등성 처리 (idempotency + Redis)
  - 플러그인 기반 확장
  - 자동 웜업 시스템 (warm-up.sh)

성능 최적화:
  - 메모리 사용량 75% 감소 (로그 레벨 error)
  - access 로그 비활성화로 I/O 부하 감소
  - worker 프로세스 최적화 (1개)
  - keepalive 설정 개선 (10000 requests, 75s timeout)

현재 활성 플러그인:
  - token-validator: JWT 토큰 검증
  - idempotency: 중복 요청 방지
  - simple-redis-cache: Redis 기반 응답 캐싱 (GET 요청)

캐싱 전략:
  - 대상 엔드포인트: /api/home, /api/categories
  - 캐시 정책:
    * 쿼리 파라미터와 상관없이 동일한 데이터를 내려주는 엔드포인트만 캐시
    * 사용자 기반 데이터는 CSR로 분리하고, 명확한 비즈니스 데이터들만 캐싱
    * BFF 응답 캐싱: 여러 마이크로서비스에서 집계된 데이터 캐싱
  - TTL: 5분 (300초)
  - 캐시 상태 코드: 200, 301, 302 (404 제외)
  - Cache-Control 헤더 존중 (no-cache, no-store, private 시 캐시 안함)
  - 최대 응답 크기: 2MB (/api/home), 1MB (/api/categories)

웜업 시스템:
  - warm-up.sh: 4분 30초마다 캐시 웜업 실행
  - X-Cache-Refresh 헤더로 강제 캐시 갱신
  - 일반 요청: 캐시 HIT 시 즉시 응답
  - 웜업 요청: 기존 캐시 무시하고 새로운 캐시 생성
  - 캐시 상태 모니터링 (X-Cache-Status 헤더)

## Kong BFF 서버 엔드포인트별 캐싱

### 캐시 구성

| 엔드포인트 | 캐시 TTL | 최대 크기 | 웜업 주기 | 설명 | 캐싱 이유 |
|------------|----------|-----------|-----------|------|----------|
| `/api/home` | 5분 | 2MB | 4분 30초 | 홈페이지 컴포넌트 데이터 | BFF에서 집계된 비즈니스 데이터 |
| `/api/categories` | 5분 | 1MB | 4분 30초 | 카테고리 및 상품 목록 | BFF에서 집계된 상품 카탈로그 |

### 캐시 동작 방식

#### 일반 요청 (X-Cache-Refresh 없음)
```mermaid
sequenceDiagram
    participant Client
    participant Kong
    participant Redis
    participant BFF

    Client->>Kong: GET /api/home
    Kong->>Redis: 캐시 조회
    alt 캐시 HIT
        Redis-->>Kong: 캐시된 데이터 반환
        Kong-->>Client: 즉시 응답 (X-Cache-Status: HIT)
    else 캐시 MISS
        Kong->>BFF: 원본 데이터 요청
        BFF-->>Kong: 응답 데이터
        Kong->>Redis: 비동기 캐시 저장 (TTL: 300s)
        Kong-->>Client: 응답 (X-Cache-Status: MISS)
    end
```

#### 웜업 요청 (X-Cache-Refresh: true)
```mermaid
sequenceDiagram
    participant WarmUp
    participant Kong
    participant Redis
    participant BFF

    WarmUp->>Kong: GET /api/home<br/>X-Cache-Refresh: true
    Note over Kong: 캐시 조회 건너뛰기
    Kong->>BFF: 원본 데이터 요청
    BFF-->>Kong: 최신 응답 데이터
    Kong->>Redis: 새로운 캐시 저장 (TTL: 300s)
    Kong-->>WarmUp: 응답 (X-Cache-Status: MISS)
```

### 캐시 키 구조
```
cache:GET:/api/home
cache:GET:/api/categories
```

### 캐시 정책
1. **쿼리 파라미터 무시**: 쿼리 파라미터와 상관없이 동일한 데이터를 내려주는 엔드포인트만 캐시
2. **비즈니스 데이터 우선**: 사용자별 개인화 데이터는 CSR로 분리하고, 명확한 비즈니스 데이터만 캐싱
   - **캐시 대상**: 상품 목록, 카테고리, 프로모션 정보 등
   - **캐시 제외**: 장바구니, 위시리스트, 개인 추천 등 (CSR 처리)
3. **BFF 집계 데이터 캐싱**: 여러 마이크로서비스에서 수집하여 집계한 데이터를 캐시
   - **효과**: 마이크로서비스 간 호출 비용 절약 및 응답 속도 향상
   - **예시**: `/api/home`은 배너, 카테고리, 상품, 리뷰 등 여러 서비스 데이터 집계

### 모니터링 헤더
- `X-Cache-Status`: HIT | MISS
- `X-Cache-Key`: 실제 캐시 키
- `X-Cache-Age`: 캐시 생성 후 경과 시간 (초)
- `X-Cache-TTL`: 캐시 TTL 설정값 (초)
```

### BFF Server (:3001)
```yaml
역할: Frontend를 위한 API 집계 서버
기술 스택: Fastify + TypeScript
주요 기능:
  - 마이크로서비스 API 집계
  - 프론트엔드 최적화된 응답 변환
  - 비즈니스 로직 조합 (Auth 직접 연결 안함)
  - UI 최적화 데이터 가공

주요 엔드포인트:
  - GET /api/home: 홈페이지 데이터 집계
  - GET /health: 헬스 체크
  - GET /docs: API 문서
```

### Auth Server (:4000)
```yaml
역할: 사용자 인증 및 권한 관리
기술 스택: Koa.js + TypeScript
주요 기능:
  - JWT 토큰 발급 및 검증
  - 사용자 인증/인가
  - Redis 기반 세션 관리
  - 비밀번호 암호화 (bcrypt)
  - Basic Auth 헤더 검증

주요 엔드포인트:
  - POST /api/auth/login: 사용자 로그인
  - POST /api/auth/register: 사용자 등록
  - POST /api/auth/refresh: 토큰 갱신
  - POST /api/auth/logout: 로그아웃
  - POST /api/auth/verify: 토큰 검증
```

### Member Server (:5000)
```yaml
역할: 회원 정보 관리
기술 스택: Fastify + Prisma + TypeScript
주요 기능:
  - 회원 CRUD 연산
  - Prisma ORM 기반 데이터 접근
  - 멱등성 미들웨어 지원
  - PostgreSQL 연동

주요 엔드포인트:
  - GET /api/members: 회원 목록 조회
  - POST /api/members: 회원 생성
  - GET /api/members/:id: 특정 회원 조회
  - PUT /api/members/:id: 회원 정보 수정
  - DELETE /api/members/:id: 회원 삭제
```

### Product Domain Server (:3002)
```yaml
역할: 상품 및 카테고리 관리
기술 스택: NestJS + TypeORM + TypeScript
주요 기능:
  - 상품 CRUD 연산 (생성, 조회, 수정, 삭제)
  - 카테고리 관리 (8개 기본 카테고리)
  - S3 이미지 업로드 서비스
  - 페이지네이션 및 필터링 지원
  - TypeORM 엔티티 관계 설정
  - 독립 PostgreSQL 데이터베이스

데이터 모델:
  - Category: id, name, slug, iconCode, isActive
  - Product: 상품 기본 정보, 가격, 할인, 평점, 재고 등
  - ProductOption: 색상, 사이즈 등 상품 옵션
  - ProductImage: 상품 이미지 관리 (S3 연동)

주요 엔드포인트(게이트웨이 기준 `/api` 접두사):
  - GET    /api/categories: 카테고리 목록 조회
  - GET    /api/products: 상품 목록 조회 (페이지네이션)
  - GET    /api/products/:id: 특정 상품 상세 조회
  - POST   /api/products: 상품 생성 (JSON Body; `imageUrls` 포함)
  - POST   /api/products/images: 이미지 업로드 (상품 생성 전, multipart/form-data → URL 반환)
  - POST   /api/products/:id/images: 기존 상품에 이미지 추가 (multipart/form-data)
  - PATCH  /api/products/:id: 상품 수정
  - DELETE /api/products/:id: 상품 삭제 (소프트 삭제)

데이터베이스 최적화:
  - 컨테이너 재시작 시 데이터 초기화 (개발 환경)
  - 초기 데이터 자동 생성 (카테고리 8개, 상품 12개)
  - TypeORM 동기화 및 마이그레이션
```

### Frontend (:3000)
```yaml
역할: 사용자 인터페이스
기술 스택: Next.js 14 + TypeScript
아키텍처: Domain-Driven Design (DDD)
주요 기능:
  - App Router 기반 라우팅
  - 도메인별 상태 관리 (Zustand)
  - Server-Side Rendering (홈페이지)
  - HttpOnly 쿠키 → Bearer 토큰 변환
  - CDN 이미지 최적화 (Cloudflare Workers)

성능 최적화:
  - 프록시 서버를 통한 HTML 캐싱으로 초기 로딩 속도 향상
  - RSC 최적화로 클라이언트 네비게이션 성능 개선
  - 이미지 WebP 변환 및 리사이징 자동화
  - Next.js Image 최적화 설정 개선
    - Next/image로 인한 부하 책임 CDN으로 위임.
    - Next/image CDN 같이 사용하도록 변경.
      - 트래픽이 많다면 CDN에 위임하여 온디멘드 리사이즈 까지 사용하는게 좋아 보임.

디렉토리 구조:
  - src/domains/: 도메인별 로직 분리
  - src/components/: 재사용 가능한 컴포넌트
  - src/api/: API 클라이언트
```

## 네트워크 구성

```mermaid
graph LR
    subgraph "External Network"
        Internet[Internet]
        Client[Client Applications]
    end

    subgraph "Docker Network: app-network"
        subgraph "Proxy Layer"
            Proxy[Bun Proxy Server<br/>Port 9000<br/>HTML 캐싱]
        end

        subgraph "Frontend"
            NextJS[Next.js<br/>Port 3000]
        end

        subgraph "Gateway Layer"
            Kong[Kong Gateway<br/>Proxy: 8000]
        end

        subgraph "Service Mesh"
            Auth[koa-auth-server<br/>Port 4000]
            Member[fastify-member-server<br/>Port 5000]
            BFF[bff-server<br/>Port 3001]
        end

        subgraph "Data Layer"
            Redis[Redis<br/>Sessions & Cache]
            PostgreSQL[PostgreSQL<br/>Member Data]
        end
    end

    %% External connections
    Internet --> Client
    Client -->|HTTP Port 9000| Proxy
    Proxy -->|HTML/RSC| NextJS

    %% Internal network connections
    NextJS -.->|Direct Auth| Auth
    NextJS -->|API Gateway| Kong

    Kong --> BFF
    Kong --> Auth
    Kong --> Member

    %% BFF connections (데이터 집계만)
    BFF --> Member

    %% Data connections
    Auth --> Redis
    Member --> PostgreSQL
    Kong --> Redis
    Proxy --> Redis

    %% Port exposure
    Proxy -.->|Exposed| Internet
    Kong -.->|Exposed| Internet

    style Proxy fill:#f0f4ff
    style Kong fill:#e8f5e8
    style BFF fill:#e1f5fe
    style Redis fill:#ffebee
    style PostgreSQL fill:#f1f8e9
```

## 시작하기

### 요구사항
- Node.js 18+
- npm 9+
- Docker & Docker Compose
- Redis (Cloud 또는 로컬)

### 설치 및 실행

1. **저장소 클론**
```bash
git clone [repository-url]
cd [repository-name]
```

2. **의존성 설치**
```bash
# 공통 모듈
cd common && npm install && cd ..

# 프록시 서버
cd proxy-server && bun install && cd ..

# BFF 서버
cd bff-server && npm install && cd ..

# 인증 서버
cd koa-auth-server && npm install && cd ..

# 회원 서버
cd fastify-member-server && npm install && cd ..

# 프론트엔드
cd ecommerce-app && npm install && cd ..
```

3. **환경 변수 설정**

각 서비스별로 `.env` 파일을 생성하고 다음 설정을 추가하세요:

**Proxy Server 설정**
```bash
# proxy-server/.env
PORT=9000
NODE_ENV=development
NEXT_SERVER=http://ecommerce-app:3000
KONG_GATEWAY_URL=http://kong:8000
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
AUTH_SERVICE_URL=http://koa-auth-server:4000
AUTH_SERVICE_TIMEOUT=5000
WARMUP_TOKEN=your-test-token-for-warmup
REDIS_URL=your-redis-host
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=your-redis-password
```

**Kong Gateway 설정**
```bash
# kong/.env
# Kong Database Configuration
KONG_DATABASE=off
KONG_DECLARATIVE_CONFIG=/tmp/kong.yml
KONG_PLUGINS=token-validator,idempotency,simple-redis-cache

# Kong 성능 최적화
KONG_LOG_LEVEL=error
KONG_NGINX_WORKER_PROCESSES=1
KONG_NGINX_KEEPALIVE_REQUESTS=10000
KONG_NGINX_KEEPALIVE_TIMEOUT=75s
KONG_PROXY_ACCESS_LOG=off
KONG_ADMIN_ACCESS_LOG=off
KONG_PROXY_LISTEN=0.0.0.0:8000
KONG_ADMIN_LISTEN=0.0.0.0:8001, 0.0.0.0:8444 ssl

# Redis 설정
REDIS_URL=your-redis-host
REDIS_PORT=12020
REDIS_DB=0
REDIS_PASSWORD=your-redis-password
IDEMPOTENCY_TTL=60

# JWT 및 인증
JWT_SECRET=your-long-jwt-secret-key
TEST_TOKEN=your-test-token-for-warmup

# 서비스 URL
AUTH_SERVER_URL=http://koa-auth-server:4000
MEMBER_SERVER_URL=http://fastify-member-server:5000
BFF_SERVER_URL=http://bff-server:3001
```

**BFF Server 설정**
```bash
# bff-server/.env
PORT=3001
HOST=0.0.0.0
NODE_ENV=production
AUTH_SERVICE_URL=http://koa-auth-server:4000
MEMBER_SERVICE_URL=http://fastify-member-server:5000
CORS_ORIGIN=*
REQUEST_TIMEOUT=5000
LOG_LEVEL=info
```

**Auth Server 설정**
```bash
# koa-auth-server/.env
JWT_SECRET=your-long-jwt-secret-key
JWT_EXPIRES_IN=3600
REDIS_URL=your-redis-host
REDIS_PORT=12020
REDIS_PASSWORD=your-redis-password
REDIS_DB=1
AUTH_PORT=4000
MEMBER_SERVICE_URL=http://fastify-member-server:5000
MEMBER_SERVICE_TIMEOUT=5000
AUTH_BASIC_KEY=your-auth-basic-key
NODE_ENV=development
```

**Member Server 설정**
```bash
# fastify-member-server/.env
POSTGRES_PASSWORD=your-postgres-password
POSTGRES_DB=fastify_member_db
TZ=Asia/Seoul
NODE_ENV=production
DATABASE_URL=postgresql://postgres:your-postgres-password@db:5432/fastify_member_db
REDIS_URL=your-redis-host
REDIS_PORT=12020
REDIS_PASSWORD=your-redis-password
REDIS_DB=0
```

**Frontend 설정**
```bash
# ecommerce-app/.env
KONG_GATEWAY_URL=http://kong:8000
AUTH_SERVICE_URL=http://koa-auth-server:4000
AUTH_SERVICE_TIMEOUT=5000
AUTH_BASIC_KEY=your-auth-basic-key
NODE_ENV=development
BYPASS_AUTH=true
AUTH_PREFIX=/api/auth
NEXT_PUBLIC_CDN_DOMAIN=https://your-cloudflare-workers-domain
PROXY_SERVER_URL=http://localhost:9000
NEXT_PUBLIC_STATIC_URL=http://localhost:3000
```

4. **Docker Compose 실행**
```bash
docker-compose up --build
```

## 서비스 엔드포인트

| 서비스 | 포트 | URL | 설명 |
|--------|------|-----|------|
| Proxy Server | 9000 | http://localhost:9000 | HTML 캐싱 프록시 |
| Kong Gateway | 8000 | http://localhost:8000 | API Gateway 프록시 |
| BFF Server | 3001 | http://localhost:3001 | Backend for Frontend |
| Auth Server | 4000 | http://localhost:4000 | 인증 서비스 |
| Member Server | 5000 | http://localhost:5000 | 회원 서비스 |
| Product Server | 3002 | http://localhost:3002 | 상품 도메인 서비스 |
| Frontend | 3000 | http://localhost:3000 | 웹 애플리케이션 |

## API 사용 예시

### 1. 사용자 인증
```bash
# 로그인 (Basic 인증 헤더 포함)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'your-auth-basic-key' | base64)" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### 2. Kong Gateway를 통한 API 호출
```bash
# BFF 서버 호출 (홈페이지 데이터 집계)
curl http://localhost:8000/api/home \
  -H "Authorization: Bearer your-jwt-token" \
  -H "X-Idempotency-Key: unique-key-123"

# 회원 서비스 직접 호출
curl http://localhost:8000/api/members \
  -H "Authorization: Bearer your-jwt-token" \
  -H "X-Idempotency-Key: unique-key-456"
```

### 3. 상품 생성 (BFF 경유, 2단계 워크플로우)

- 단일 요청(multipart/form-data)을 BFF로 전송하면, BFF가 내부적으로 다음을 수행합니다.
  1) 이미지 업로드(`/products/images`) → S3 업로드 후 URL 수집
  2) 상품 생성(`/products`, JSON) 시 수집된 `imageUrls` 포함하여 상품 도메인 서버 호출

```bash
curl -X POST http://localhost:8000/api/products \
  -H "Authorization: Bearer your-jwt-token" \
  -H "X-Idempotency-Key: unique-key-789" \
  -F "name=샘플 상품" \
  -F "description=설명" \
  -F "price=10000" \
  -F "originalPrice=15000" \
  -F "categoryId=1" \
  -F "sellerId=seller-001" \
  -F "images=@./path/to/image1.webp" \
  -F "images=@./path/to/image2.webp"
```

응답 예시:

```json
{
  "productId": 123,
  "imageUrls": [
    "https://<cdn-or-s3>/products/123/....webp",
    "https://<cdn-or-s3>/products/123/....webp"
  ],
  "message": "상품이 성공적으로 등록되었습니다."
}
```

### 4. 직접 서비스 호출 (개발/테스트용)
```bash
# Auth 서버 직접 호출
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n '${AUTH_BASIC_KEY}' | base64)" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Member 서버 직접 호출
curl http://localhost:5000/api/members \
  -H "Authorization: Bearer your-jwt-token"

# BFF 서버 직접 호출 (데이터 집계 확인)
curl http://localhost:3001/api/home \
  -H "Authorization: Bearer your-jwt-token"
```

## 테스트 구현 현황

본 프로젝트는 포괄적인 테스트 전략을 통해 **코드 품질과 안정성을 보장**합니다.

### 테스트 프레임워크 및 도구
- **Jest**: 단위 테스트 및 통합 테스트 프레임워크
- **React Testing Library**: React 컴포넌트 테스트
- **TypeScript**: 타입 안전성 및 개발 시 에러 감지
- **Mocking**: API 호출 및 외부 의존성 모킹

### 서버 사이드 테스트

#### Auth Server (Koa.js)
- **에러 미들웨어 테스트** (`errorMiddleware.test.ts`)
  - BaseError, AuthenticationError, 알 수 없는 에러 처리 검증
  - HTTP 상태 코드 및 에러 응답 형식 정확성 확인
  - 토큰 검증 실패 시나리오 테스트

#### Member Server (Fastify)
- **회원 컨트롤러 테스트** (`memberController.test.ts`)
  - 회원 생성, 조회, 수정 성공/실패 시나리오
  - ValidationError 처리 검증
  - 싱글톤 패턴 구현 테스트
  - Mock 기반 서비스 레이어 격리 테스트

### 클라이언트 사이드 테스트 (Next.js)

#### 공통 컴포넌트
- **Button 컴포넌트** (`Button.test.tsx`): 기본 버튼 기능 및 이벤트 처리
- **Modal 컴포넌트** (`Modal.test.tsx`): 모달 열림/닫힘 상태 관리
- **Form 컴포넌트** (`Form.test.tsx`): 폼 검증 및 제출 플로우
- **ProductCard 컴포넌트** (`ProductCard.test.tsx`): 상품 카드 렌더링
- **ProductGrid 컴포넌트** (`ProductGrid.test.tsx`): 상품 목록 표시
- **Rating 컴포넌트** (`Rating.test.tsx`): 별점 평가 시스템

#### 인증 도메인
- **LoginForm** (`LoginForm.test.tsx`): 로그인 폼 검증 및 제출
- **RegisterForm** (`RegisterForm.test.tsx`): 회원가입 폼 처리
- **ForgotPasswordForm** (`ForgotPasswordForm.test.tsx`): 비밀번호 재설정

#### 상품 도메인
- **상품 폼 관련**:
  - `useProductForm.test.ts`: 상품 등록 폼 상태 관리
  - `useProductFormData.test.ts`: 폼 데이터 처리 로직
  - `useProductOptions.test.ts`: 상품 옵션 관리
  - `useProductCategories.test.ts`: 카테고리 선택 로직
  - `useProductSpecifications.test.ts`: 상품 사양 관리
  - `useProductSubmission.test.ts`: 상품 등록 제출 플로우

- **상품 이미지 관리**:
  - `useProductImages.test.ts`: 이미지 업로드 및 미리보기
  - `useProductImages.compression.test.ts`: **이미지 압축 기능 상세 테스트**

#### 🛒 장바구니 도메인
- **useCartActions.test.ts**: 장바구니 추가/제거/수정 액션
- **CartApiService.test.ts**: 장바구니 API 서비스 로직

#### 홈 도메인
- **homeService.test.ts**: 홈페이지 데이터 로딩 서비스

#### 카테고리 도메인
- **categoriesService.test.ts**: 카테고리 관리 서비스

#### 유틸리티 및 인프라
- **Validation** (`validation.test.ts`): 데이터 검증 유틸리티
- **Formatters** (`formatters.test.ts`): 데이터 포맷팅 함수들
- **Error Handling** (`errorHandling.test.ts`): 에러 처리 유틸리티
- **Notifications** (`notifications.test.ts`): 알림 시스템
- **Product Utils** (`productUtils.test.ts`): 상품 관련 유틸리티

#### 커스텀 훅
- **useErrorHandler.test.ts**: 에러 처리 훅
- **useIdempotentMutation.test.ts**: 멱등성 보장 뮤테이션 훅
- **useFormState.test.ts**: 폼 상태 관리 훅

#### API 및 서버 통신
- **kongApiClient.test.ts**: Kong Gateway API 클라이언트
- **Server 유틸리티**:
  - `errorHandler.test.ts`: 서버 에러 처리
  - `headerBuilder.test.ts`: HTTP 헤더 구성
  - `serverActionErrorHandler.test.ts`: 서버 액션 에러 처리

#### 프록시 서버
- **error-handling.test.ts**: 프록시 서버 에러 처리 로직

### 테스트 커버리지 특징

✅ **포괄적 도메인 커버리지**: 인증, 상품, 장바구니, 홈, 카테고리 모든 주요 도메인<br>
✅ **계층별 테스트**: 컴포넌트, 훅, 서비스, 유틸리티 모든 계층<br>
✅ **에러 시나리오**: 정상 케이스뿐만 아니라 에러 상황까지 검증<br>
✅ **API 통신**: 실제 API 호출을 모킹하여 네트워크 레이어 테스트<br>
✅ **타입 안전성**: TypeScript와 함께 컴파일 타임 에러 감지<br>

### 통합 테스트 시나리오
```bash
# 1. Auth 서버 로그인 테스트
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n '${AUTH_BASIC_KEY}' | base64)" \
  -d '{"email": "test@example.com", "password": "password123"}'

# 2. Kong Gateway를 통한 BFF 호출
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." # 위에서 받은 토큰
curl http://localhost:8000/api/home \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Idempotency-Key: test-key-1"

# 3. 멱등성 테스트 (같은 키로 재요청)
curl http://localhost:8000/api/home \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Idempotency-Key: test-key-1"

# 4. Member 서비스 테스트
curl http://localhost:8000/api/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Idempotency-Key: test-key-2"
```

### 테스트 실행 방법
```bash
# 전체 테스트 실행
npm test

# 특정 도메인 테스트
npm test -- --testPathPattern="domains/product"

# 커버리지 리포트 생성
npm run test:coverage

# Watch 모드로 테스트
npm run test:watch
```

## 이미지 압축 기능

본 프로젝트는 **고성능 이미지 처리 시스템**을 통해 사용자 경험과 성능을 최적화합니다.

### 핵심 기능

#### 클라이언트 사이드 압축 (`useProductImages` Hook)
```typescript
// 실시간 이미지 압축 및 최적화
const compressionOptions = {
  maxSizeMB: 2,                    // 최대 2MB로 압축
  maxWidthOrHeight: 1920,          // 최대 해상도 1920px
  useWebWorker: true,              // 메인 스레드 블로킹 방지
  preserveExif: false,             // EXIF 데이터 제거로 용량 절약
  onProgress: (progress) => {      // 실시간 압축 진행률
    setCompressionProgress(progress);
  }
};
```

**주요 특징:**
- **Web Worker 활용**: 메인 스레드 블로킹 없이 백그라운드 압축
- **실시간 진행률**: 사용자에게 압축 진행 상황 표시
- **스마트 검증**: 10MB 이하, 이미지 파일만 허용
- **자동 최적화**: 파일 크기와 해상도 동시 최적화

#### CDN 기반 이미지 최적화 (Cloudflare Workers)
```javascript
// 온디맨드 이미지 리사이징 및 포맷 변환
const imageUrl = `https://image-resizer.star1231076.workers.dev/?
  url=${encodeURIComponent(originalUrl)}&
  w=120&h=120&
  fit=cover&
  f=webp`;
```

**Cloudflare Workers 이미지 파이프라인:**
1. **WSrv.nl** (1차 우선순위)
2. **Statically** (백업 서비스 #1)
3. **Images.weserv.nl** (백업 서비스 #2)

### 성능 비교 분석

#### 이미지 처리 방식별 응답 속도

| 처리 방식 | 평균 응답시간 | 장점 | 단점 |
|-----------|--------------|------|------|
| **Next.js Image** | **0.0038초** | 로컬 캐싱, 내장 최적화 | 서버 부하, 지역 의존 |
| **Cloudflare Workers** | **0.181초** | 글로벌 CDN, 서버 부하 분산 | 첫 요청 지연 |

#### 프로덕션 환경 고려사항

**개발/저트래픽 환경**: Next.js Image 우세 (47배 빠름)
**글로벌 프로덕션 환경**:
- 첫 요청: Cloudflare Workers 지연
- **캐시 적중 후**: Cloudflare가 동등하거나 더 빠른 성능
- **24시간 캐싱**: `Cache-Control: public, max-age=86400, immutable`

### 이미지 압축 테스트 구현

프로젝트는 이미지 압축 기능에 대한 **전문 테스트 스위트**를 제공합니다:

#### 테스트 파일들
- `useProductImages.test.ts`: 기본 이미지 처리 로직
- `useProductImages.compression.test.ts`: **압축 알고리즘 상세 테스트**

#### 압축 테스트 시나리오
```typescript
// 압축 품질 검증
it('should compress images within size limits', async () => {
  const largeFile = createMockFile(5 * 1024 * 1024); // 5MB
  const compressed = await compressImage(largeFile);

  expect(compressed.size).toBeLessThan(2 * 1024 * 1024); // 2MB 미만
  expect(compressed.type).toBe('image/webp');
});

// 진행률 콜백 테스트
it('should report compression progress', async () => {
  const progressCallback = jest.fn();
  await compressImage(mockFile, { onProgress: progressCallback });

  expect(progressCallback).toHaveBeenCalledWith(expect.any(Number));
});
```

### 실제 사용 시나리오

#### 상품 등록 플로우
1. **파일 선택** → 자동 유효성 검사
2. **실시간 압축** → Web Worker에서 백그라운드 처리
3. **진행률 표시** → 사용자 피드백
4. **미리보기 생성** → 즉시 결과 확인
5. **업로드 준비** → 최적화된 파일로 전송

#### 이미지 렌더링 전략
```jsx
// 조건부 이미지 최적화
<OptimizedImageNext
  src={productImage}
  width={300}
  height={200}
  priority={isAboveFold}  // 스크롤 위치에 따른 우선순위
  quality={75}            // 품질 vs 용량 최적화
/>
```

### 최적화 결과

✅ **용량 최적화**: 평균 70-80% 파일 크기 감소
✅ **품질 유지**: 시각적 품질 손실 최소화
✅ **UX 향상**: 실시간 진행률로 사용자 만족도 증가
✅ **서버 부하 감소**: 클라이언트 사이드 압축으로 업로드 트래픽 감소
✅ **글로벌 성능**: CDN을 통한 전세계 일관된 이미지 전송 속도

## 🔧 개발 가이드

### 새로운 비즈니스 서비스 추가
1. **Kong에 서비스 추가**
```yaml
# kong/kong.yml.template
services:
  - name: product-service
    url: http://product-service:8000
    routes:
      - name: product-api
        paths:
          - /api/products
        plugins:
          - name: token-validator
          - name: idempotency
```

2. **BFF에서 서비스 호출 추가**
```typescript
// BFF에서 새 서비스 연동
export class BFFService {
  constructor(
    private memberService: MemberService,
    private productService: ProductService // 새 서비스 추가
  ) {}
}
```

## 🚀 프록시 서버 성능 테스트 결과

### 테스트 환경
- **네트워크**: 공인 IP 접근 (동일한 네트워크 조건)
- **인증**: JWT Bearer 토큰 포함
- **측정 횟수**: 각 시나리오당 10회
- **측정 도구**: curl with timing metrics

### 테스트 명령어
```bash
TOKEN="YOUR_JWT_TOKEN"
PUBLIC_IP="YOUR_PUBLIC_IP"

for i in {1..10}; do
    echo "Test $i:"
    curl -w "9000: %{time_total}s  " -o /dev/null -sS \
         -H "Authorization: Bearer $TOKEN" \
         -H "Content-Type: application/json" \
         -H "User-Agent: Performance-Test" \
         "http://$PUBLIC_IP:9000/" 2>/dev/null || echo "9000: 연결실패  "
    curl -w "3000: %{time_total}s\n" -o /dev/null -sS \
         -H "Authorization: Bearer $TOKEN" \
         -H "Content-Type: application/json" \
         -H "User-Agent: Performance-Test" \
         "http://$PUBLIC_IP:3000/" 2>/dev/null || echo "3000: 연결실패"
done
```

### 저트래픽 환경 성능 비교

#### 시나리오 1: ISR 캐시 활성화 (Next.js 1분 캐싱)

**요청 흐름도:**

```mermaid
graph LR
    subgraph "프록시 경유 (포트 9000)"
        Client1["클라이언트"] --> Proxy["프록시 서버<br/>Redis 캐시 조회"]
        Proxy --> NextJS1["Next.js<br/>ISR 캐시(1분)"]
        NextJS1 --> Proxy
        Proxy --> Client1
    end

    subgraph "직접 접속 (포트 3000)"
        Client2["클라이언트"] --> NextJS2["Next.js<br/>ISR 캐시(1분)"]
        NextJS2 --> Client2
    end

    style Proxy fill:#f9f2ff
    style NextJS1 fill:#e8f5e8
    style NextJS2 fill:#e8f5e8
```

**성능 비교:**
```
포트 9000: 클라이언트 → 프록시 서버 → Next.js ISR(1분)
포트 3000: 클라이언트 → Next.js ISR(1분)
```

| 테스트 | 프록시 경유 (9000) | 직접 접속 (3000) | 성능 차이 |
|--------|-------------------|------------------|----------|
| 평균 응답시간 | **0.555초** | **0.013초** | **42배 느림** |
| 최소값 | 0.371초 | 0.011초 | 34배 느림 |
| 최대값 | 0.739초 | 0.018초 | 41배 느림 |

#### 시나리오 2: ISR 캐시 비활성화 (실시간 렌더링)

**요청 흐름도:**

```mermaid
graph LR
    subgraph "프록시 경유 (포트 9000)"
        Client3["클라이언트"] --> Proxy2["프록시 서버<br/>Redis 캐시 조회"]
        Proxy2 --> NextJS3["Next.js<br/>실시간 렌더링"]
        NextJS3 --> Proxy2
        Proxy2 --> Client3
    end

    subgraph "직접 접속 (포트 3000)"
        Client4["클라이언트"] --> NextJS4["Next.js<br/>실시간 렌더링"]
        NextJS4 --> Client4
    end

    style Proxy2 fill:#f9f2ff
    style NextJS3 fill:#ffe8e8
    style NextJS4 fill:#ffe8e8
```

**성능 비교:**
```
포트 9000: 클라이언트 → 프록시 서버 → Next.js 실시간 렌더링
포트 3000: 클라이언트 → Next.js 실시간 렌더링
```

| 테스트 | 프록시 경유 (9000) | 직접 접속 (3000) | 성능 차이 |
|--------|-------------------|------------------|----------|
| 평균 응답시간 | **0.711초** | **0.558초** | **1.3배 느림** |
| 최소값 | 0.708초 | 0.548초 | 1.3배 느림 |
| 최대값 | 0.715초 | 0.740초 | 거의 동일 |

### 분석 결과

#### 핵심 발견사항

1. **ISR 캐시 유무에 따른 극명한 차이**
   - ISR 활성화 시: 프록시가 **42배 느림**
   - ISR 비활성화 시: 프록시가 **1.3배 느림** (거의 동일)

2. **프록시 오버헤드는 미미함**
   - 실제 프록시 처리 시간: **약 0.15초**
   - ISR 비활성화 시 차이가 거의 없음을 통해 확인

3. **Redis 클라우드의 영향**
   - 캐시 조회/저장 시간이 상당 부분 차지
   - 로컬 Redis 사용 시 성능 개선 예상

#### 결론

**현재 저트래픽 환경에서는:**
- **직접 접속이 압도적으로 유리** (ISR 캐시 활용 시)
- **프록시 자체 오버헤드는 미미함** (0.15초 수준)
- **Redis 클라우드 지연이 주요 원인**

**고트래픽 환경에서는 상황 반전 예상:**
- 프록시 Redis 캐시 효과로 성능 역전 가능
- Next.js 서버 부하 분산 효과
- 동시 요청 처리 능력 차이

### Redis 로컬화 성능 개선 결과

#### Redis Cloud → Local Redis 전환 후 성능 측정

**테스트 환경:**
- **변경사항**: Redis Cloud → Docker Local Redis
- **측정 조건**: 동일한 공인 IP 환경, JWT 토큰 인증 포함
- **측정 횟수**: 10회 연속 측정

**성능 측정 결과:**

```
Test 1:  9000: 0.008982s  3000: 0.014694s
Test 2:  9000: 0.006319s  3000: 0.014091s
Test 3:  9000: 0.006187s  3000: 0.011740s
Test 4:  9000: 0.005856s  3000: 0.012601s
Test 5:  9000: 0.006728s  3000: 0.013861s
Test 6:  9000: 0.005395s  3000: 0.010448s
Test 7:  9000: 0.006941s  3000: 0.010936s
Test 8:  9000: 0.005963s  3000: 0.010998s
Test 9:  9000: 0.014150s  3000: 0.013027s
Test 10: 9000: 0.006138s  3000: 0.010666s
```

#### 성능 비교 분석

| 구분 | Redis Cloud 시절 | Local Redis (현재) | 성능 개선 |
|------|------------------|-------------------|----------|
| **프록시 경유 (9000)** | **0.555초** | **0.007초** | **79배 빠름** 🚀 |
| **직접 접속 (3000)** | **0.013초** | **0.012초** | **거의 동일** |

#### 핵심 발견사항

1. **프록시 서버 성능 혁신**
   - **79배 성능 향상**: 0.555초 → 0.007초
   - Redis 캐시 조회 시간: ~150ms → ~1ms 미만
   - 프록시의 진정한 가치 실현

2. **Next.js 직접 접속은 변화 없음**
   - 여전히 ~0.012초 수준 유지
   - ISR 캐시 성능은 Redis와 무관

3. **프록시 vs 직접 접속 역전**
   - **이전**: 직접 접속이 42배 빠름
   - **현재**: 프록시가 1.7배 빠름 ⚡

#### Redis 로컬화의 임팩트

**기술적 개선:**
- **네트워크 지연 제거**: 미국 동부 Redis Cloud → 로컬 Docker 네트워크
- **캐시 응답 시간**: ~150ms → ~1ms (150배 개선)
- **컨테이너 간 통신**: 같은 Docker 네트워크 내 극저지연 통신
- **리소스 전용화**: 클라우드 공유 → 로컬 전용 리소스

**사용자 경험:**
- **초기 페이지 로딩**: 대폭 개선된 응답 속도
- **캐시 효율성**: HTML 캐싱이 이제 의미 있는 성능 향상 제공
- **일관된 성능**: 네트워크 변동 없는 안정적 응답시간

#### 결론

Redis 로컬화를 통해 **프록시 서버가 진정한 성능 우위**를 확보했습니다. 이제 프록시 서버는 단순한 캐싱 레이어가 아닌, **실질적인 성능 가속기**로 작동합니다.

### 정적 자산 최적화 (Static Assets Optimization)

#### 프록시 부하 분산 및 성능 최적화

**기존 문제점:**
- 모든 요청(HTML, JS, CSS, 이미지)이 프록시를 경유
- 정적 자산까지 프록시 처리로 인한 불필요한 오버헤드
- 프록시 서버 부하 증가

**최적화 방안:**
```mermaid
graph LR
    subgraph "최적화 후"
        Client[브라우저]
        Client -->|HTML 캐시| Proxy[프록시:9000]
        Client -->|JS/CSS 직접| NextJS[Next.js:3000]
        Client -->|이미지 직접| NextJS
        Client -->|API| Proxy
        Proxy -->|HTML| NextJS
        Proxy -->|API| Kong[Kong:8000]
    end
```

**구현된 최적화:**

1. **assetPrefix 설정** - Next.js 정적 자산 직접 라우팅
```typescript
// ecommerce-app/next.config.ts
assetPrefix: process.env.NEXT_PUBLIC_STATIC_URL, // http://localhost:3000
```

2. **이미지 직접 접근** - Next.js Image 최적화 활용
```typescript
// ecommerce-app/next.config.ts
images: {
  path: `${process.env.NEXT_PUBLIC_STATIC_URL}/_next/image`,
}
```

3. **환경변수 설정**
```bash
# ecommerce-app/.env
NEXT_PUBLIC_STATIC_URL=http://localhost:3000
```

**최적화 결과:**

| 리소스 타입 | 기존 경로 | 최적화 후 | 성능 개선 |
|------------|----------|-----------|----------|
| **HTML** | 프록시(9000) → Next.js | 프록시(9000) → Next.js | 캐시 HIT 시 ~7ms |
| **JS/CSS** | 프록시(9000) → Next.js | **직접** Next.js(3000) | **프록시 오버헤드 제거** |
| **이미지** | 프록시(9000) → Next.js | **직접** Next.js(3000) | **프록시 오버헤드 제거** |
| **API** | 프록시(9000) → Kong | 프록시(9000) → Kong | 인증 처리 유지 |

**핵심 장점:**
- **프록시 집중화**: HTML 캐싱과 API 라우팅에만 집중
- **정적 자산 최고 속도**: 프록시 우회로 Direct Access
- **부하 분산**: 정적 자산 트래픽을 Next.js로 분리
- **보안 유지**: 인증이 필요한 HTML/API는 여전히 프록시 경유

### Next.js 미들웨어 리다이렉트 이슈 해결

**문제 상황:**
- Proxy 서버를 통한 프록시 환경에서 Next.js 미들웨어의 `NextResponse.redirect()` 사용 시 발생하는 문제
- 게스트 유저가 보호된 페이지(`/account`)에 접근할 때 예상된 동작과 다른 결과

**에러 로그:**
```json
{
  "code": "SYS_5002",
  "message": "Proxy request failed: Failed to connect to Next.js: UnexpectedRedirect fetching \"http://ecommerce-app:3000/auth/login?redirect=%2Faccount\"",
  "details": {
    "context": {
      "url": "http://localhost:9000/account",
      "method": "POST"
    }
  }
}
```

**근본 원인:**
1. 브라우저 → Proxy Server (localhost:9000)
2. Proxy Server → Next.js (ecommerce-app:3000)
3. **Next.js 미들웨어가 리다이렉트 응답 반환**
4. **Proxy Server가가 리다이렉트를 예상하지 못하고 프록시 에러 발생**

**해결 방안:**

**Before (서버사이드 리다이렉트):**
```typescript
// middleware.ts - 프록시 환경에서 문제 발생
if (isProtectedRoute && !isAuthenticatedUser(request)) {
  return NextResponse.redirect(new URL('/auth/login', request.url)); // ❌ 프록시 에러
}
```

**After (클라이언트사이드 처리):**
```typescript
// AuthGuard.tsx - 클라이언트에서 안전하게 처리
useEffect(() => {
  if (!isClient || !isSessionInitialized) return;

  if (isProtectedRoute && isGuest) {
    router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`); // ✅ 정상 동작
  }
}, [isClient, isSessionInitialized, isProtectedRoute, isGuest, router, pathname]);
```

**핵심 개선사항:**
- **전역 AuthGuard**: Root Layout에서 한 번만 설정하여 모든 페이지에 자동 적용
- **자동 경로 감지**: `PROTECTED_ROUTES` 배열에서 보호된 경로 중앙 관리
- **세션 안전성**: `isSessionInitialized` 체크로 세션 로드 완료 후 인증 처리
- **프록시 호환**: 서버사이드 리다이렉트 제거로 Kong Gateway 환경에서 안정적 동작

**결과:**
- ✅ 프록시 환경에서 `UnexpectedRedirect` 에러 해결
- ✅ 정확한 URL 리다이렉트 (`/auth/login?redirect=/account`)
- ✅ 로그인 후 원래 페이지로 자동 복귀
- ✅ 개발자 친화적인 중앙화된 라우트 관리

### Health Check 최적화

**문제점:**
- Health check 요청에서도 불필요한 토큰 생성 및 인증 처리
- 모니터링 도구의 빈번한 요청으로 인한 리소스 낭비

**해결방안:**
```typescript
// proxy-server/src/handlers/proxy.ts
private isHealthCheckRequest(req: Request, url: URL): boolean {
  const userAgent = req.headers.get('User-Agent') || '';

  const healthCheckPatterns = [
    'health', 'ping', 'monitor', 'check', 'probe',
    'ELB-HealthChecker', 'GoogleHC', 'kube-probe', 'Warmup-Request'
  ];

  const isHealthPath = url.pathname === '/health' ||
                      url.pathname === '/ping' ||
                      url.pathname === '/_health';

  const isHealthUserAgent = healthCheckPatterns.some(pattern =>
    userAgent.toLowerCase().includes(pattern.toLowerCase())
  );

  return isHealthPath || isHealthUserAgent;
}
```

**최적화 결과:**
- Health check 요청 시 토큰 생성 및 인증 과정 스킵
- 모니터링 도구 요청에 대한 리소스 절약
- 실제 사용자 요청에 대해서만 인증 처리 집중

### 향후 테스트 계획
- [x] **Redis 로컬 vs 클라우드**: 캐시 백엔드별 성능 영향 측정 ✅
- [ ] **고트래픽 테스트**: 동시 요청 100-1000개 상황에서의 성능 비교
- [ ] **캐시 히트율 테스트**: 반복 요청 시 프록시 캐시 효과 검증
- [ ] **부하 테스트**: Apache Bench, wrk 등을 활용한 정밀 부하 테스트

## 향후 계획

### Phase 1: 현재 완료된 기능
- Kong API Gateway 구축
- BFF 서버 구현 (비즈니스 데이터 UI 데이터를 변환하는 용도)
- JWT 기반 인증 체계
- 멱등성 처리 (Redis)
- 마이크로서비스 아키텍처

### Phase 2: 성능 최적화 ✅
- [x] **Kong 성능 최적화**: 메모리 사용량 75% 감소, 로그 레벨 최적화
- [x] **웜업 시스템**: 컨테이너 시작 시 자동 웜업으로 초기 응답 속도 개선
- [x] **SSR 전환**: 홈페이지 서버사이드 렌더링으로 초기 로딩 속도 향상
- [x] **CDN 이미지 최적화**: Cloudflare Workers 기반 이미지 리사이징 및 WebP 변환
- [x] **Kong 캐싱**: Redis 기반 엔드포인트별 캐싱 전략 (simple-redis-cache 플러그인)
- [x] **BFF 응답 캐싱**: 집계된 데이터 캐싱

### Phase 3: 비즈니스 서비스 확장
- [x] **Redis 로컬화**: Redis Cloud → Local Redis 전환으로 네트워크 지연 최소화 ✅
- [x] **정적 자산 최적화**: Next.js 정적 자산 직접 접근으로 프록시 부하 분산 ✅
- [x] **Product Domain Server**: NestJS 기반 상품 및 카테고리 관리 서비스 (포트 3002) ✅
  - TypeORM + PostgreSQL 독립 데이터베이스
  - S3 이미지 업로드 서비스 통합
  - 카테고리 8개, 상품 12개 초기 데이터
  - BFF 서버 연동 완료
<!-- - [ ] **Order Service**: 주문 관리 서비스 (포트 7000)
- [ ] **Cart Service**: Redis 기반 장바구니 서비스 (주문 서버 구현 후 작성 예정) -->


### Phase 4: 모니터링 & 관찰성
- [ ] **메트릭 수집**: Prometheus + Grafana
<!-- - [ ] **분산 추적**: 서비스 간 호출 추적
- [ ] **로그 집계**: 중앙집중식 로깅
- [ ] **알림 체계**: 장애 알림 시스템 -->

### Phase 5: 성능 테스트 & 캐싱 전략 비교
- [ ] **Artillery.js 기반 RPS 테스트**: JavaScript 기반 정밀 부하 테스트
  - 동시 사용자 100-1000명 시나리오 구성
  - 실제 사용자 패턴 시뮬레이션 (게스트/로그인 사용자)
  - 초당 요청 수(RPS) 측정 및 분석
  - Next.js 특화 테스트 시나리오 (SSR, ISR, API Routes)
- [ ] **Artillery.js 학습 및 테스트**:
  - JavaScript 기반 부하 테스트 도구 사용 해보려 함. (기존 nGrinder, Apache Bench 경험 보유)
  - Next.js 환경에 특화된 테스트 시나리오 구성 방법 학습
- [ ] **Next.js Frontend Docker 인스턴스 최소 사양 RPS 한계 측정**:
  - Artillery.js를 통한 Next.js 프론트엔드 Docker 컨테이너 성능 한계 측정
  - CPU/메모리 제약 조건별 성능 임계점 분석
  - Docker 환경에서의 최대 처리 용량 식별
- [ ] **캐싱 전략 성능 비교**:
  - **Redis HTML 캐시** (프록시 서버): Artillery.js로 HTML 페이지 캐싱 효과 측정
  - **Next.js ISR** (Incremental Static Regeneration): ISR vs 실시간 렌더링 성능 비교
  - **BFF 엔드포인트 Redis 캐시** (Kong Gateway): API 응답 캐싱 성능 검증
- [ ] **홈페이지 & 카테고리 페이지 최적화**:
  - Artillery.js 시나리오별 응답 시간 측정
  - 캐시 히트율 및 성능 개선 효과 분석
  - 실제 사용자 워크플로우 기반 성능 테스트
  - Core Web Vitals (FCP, LCP, CLS) 측정 통합

## 참고 문서

- [Kong Gateway 공식 문서](https://docs.konghq.com/)
- [Fastify 문서](https://www.fastify.io/)
- [Next.js 문서](https://nextjs.org/docs)
- [Prisma ORM 문서](https://www.prisma.io/docs)
- [Docker Compose 문서](https://docs.docker.com/compose/)
- [Koa 문서](https://koajs.com/)
- [NestJS 문서](https://docs.nestjs.com/)
## 📄 라이선스 {#라이선스}

MIT License

---
