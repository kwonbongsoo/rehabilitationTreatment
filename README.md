### 경력 단절을 이겨내기 위한 재활 치료 프로젝트

# Fastify Member Platform

회원 관리 및 인증 기능을 제공하는 Node.js 기반의 Fastify 서버 프로젝트입니다.
Docker, Prisma, PostgreSQL, Koa, Next.js 등 다양한 기술 스택을 활용하여
모던한 백엔드/풀스택 환경을 구성합니다.

**🔒 보안 정책: Auth API 엔드포인트 보호 & Kong API Gateway 인증/멱등성**

- 인증 서비스는 내부망에서만 접근 가능 (직접 통신)
- 비즈니스 API는 Kong API Gateway를 통해 JWT 인증 및 멱등성 보장
- JWT 토큰은 guest/user 모두 같은 시크릿을 사용하며, 만료는 4시간
- 멱등성 플러그인으로 POST/PUT/PATCH 중복 요청 안전하게 처리

---

## 주요 기능

- 회원 가입, 로그인, 정보 수정, 삭제
- **🔒 인증 서비스 직접 통신 + Kong Gateway 통한 비즈니스 API 보호**
- JWT 기반 인증 시스템 (guest/user 모두 지원, 시크릿 공유)
- Kong 멱등성 플러그인으로 중복 요청 방지
- Docker Compose로 전체 서비스 손쉽게 실행
- Next.js API Routes를 통한 Proxy 서버 역할
- 사용자 정의 네트워크(app-network)로 서비스 간 통신 격리
- 각 서비스의 Dockerfile 최적화 및 .dockerignore 적용

---

## 시스템 아키텍처 (인증/멱등성 최신 구조)

```
┌──────────────┐     HTTP 요청     ┌──────────────────────────────────┐
│              │ ─────────────────►│                                  │
│   클라이언트  │                   │         Next.js                  │
│  (브라우저/앱) │ ◄─────────────── │    (프론트엔드 + BFF)             │
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

---

## 인증 및 멱등성 흐름 (최신)

### 1. 인증 요청 흐름 (직접 통신)

```
클라이언트 → Next.js API Routes → Auth 서비스 → Redis → 응답
```

- 클라이언트는 Next.js API Routes를 통해 인증 요청(`/api/auth/*`)을 보냅니다.
- Next.js가 HttpOnly 쿠키에서 토큰을 추출해 Bearer 토큰으로 변환
- 내부망에서 Koa Auth 서비스로 직접 요청 (Kong을 거치지 않음)
- Auth 서비스가 Redis를 통해 토큰 검증 및 발급
- 인증 결과를 Next.js가 받아 클라이언트에 전달

### 2. 비즈니스 API 요청 흐름 (Kong 경유)

```
클라이언트 → Next.js API Routes → Kong API Gateway → 마이크로서비스 → Database → 응답
```

- 클라이언트는 Next.js API Routes를 통해 비즈니스 API 요청(`/api/members` 등)을 보냅니다.
- Next.js가 쿠키에서 토큰을 추출해 Bearer 토큰으로 변환
- Kong API Gateway로 요청 전달 (Authorization 헤더 포함)
- Kong이 JWT 플러그인으로 토큰 검증
- 멱등성 플러그인으로 POST/PUT/PATCH 중복 요청 방지 (`X-Idempotency-Key`)
- 검증 통과 시 적절한 마이크로서비스로 라우팅
- 서비스 → DB → Kong → Next.js → 클라이언트로 응답 반환

---

## Kong API Gateway 주요 기능 (최신)

### 🔐 JWT 토큰 유효성 검증 시스템

Kong은 모든 비즈니스 API 요청에 대해 강력한 JWT 토큰 검증을 수행합니다:

#### **1. 다중 토큰 타입 지원**

- **Guest 토큰**: `kid: "guest"` - 비회원 사용자용, 제한된 권한
- **User 토큰**: `kid: "user"` - 로그인 회원용, 전체 권한
- **공통 시크릿**: 동일한 JWT 시크릿으로 보안성 및 관리 효율성 확보

#### **2. 토큰 검증 프로세스**

```
Authorization: Bearer <JWT_TOKEN>
↓
Kong JWT Plugin → 시크릿 검증 → Auth API token verify 이용용
↓
검증 성공: 백엔드로 전달
검증 실패: 403 Forbidden, 401 Unauthorized 응답
```

<!-- #### ** 자동 헤더 주입**
토큰 검증 성공 시 Kong이 자동으로 추가하는 헤더:
- `X-User-ID`: 사용자 식별자
- `X-User-Name`: 사용자명
- `X-Consumer-Type`: guest/user 구분
- `X-JWT-Payload`: 디코딩된 JWT 페이로드 -->

#### **3. 보안 정책**

- **토큰 만료**: 4시간 (14400초) 자동 만료
- **알고리즘**: HS256 (HMAC SHA-256)
- **클럭 스큐**: ±30초 허용
- **무효 토큰**: 즉시 401 에러 반환

### 🔄 기타 핵심 기능

- **멱등성 플러그인**: POST/PUT/PATCH 중복 요청 방지, Redis 캐싱, TTL 설정
- **API 라우팅**: URL 패턴에 따라 서비스로 전달
- **Rate Limiting**: API 호출량 제한 (사용자별/IP별)
- **로깅/모니터링**: 모든 API 요청에 대한 로그 및 지표 수집
- **캐싱**: 응답 데이터 캐싱으로 성능 최적화
- **보안**: IP 화이트리스트, CORS, SSL 종료 등
- **플러그인 확장성**: 커스텀 플러그인으로 기능 확장 가능

---

---

## 환경 변수 예시 (.env)

```bash
# JWT 인증 설정
JWT_SECRET=your-super-secret-jwt-key-256-bits
JWT_EXPIRES_IN=14400  # 4시간 (초 단위)
JWT_ALGORITHM=HS256   # HMAC SHA-256

# Redis 설정 (토큰 캐시 및 멱등성)
REDIS_URL=redis
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password  # 선택사항
REDIS_DB=0
REDIS_TTL=3600       # 캐시 TTL (1시간)

# 멱등성 플러그인 설정
IDEMPOTENCY_TTL=60   # 중복 요청 방지 TTL (초)
IDEMPOTENCY_REDIS_DB=1  # 멱등성 전용 Redis DB

# Kong 설정
KONG_DATABASE=off    # DB-less 모드
KONG_DECLARATIVE_CONFIG=/kong/kong.yml
KONG_PROXY_ACCESS_LOG=/dev/stdout
KONG_ADMIN_ACCESS_LOG=/dev/stdout
KONG_PROXY_ERROR_LOG=/dev/stderr
KONG_ADMIN_ERROR_LOG=/dev/stderr
```

---

## 참고

- 각 서비스별 상세 설정 및 예시는 `kong/README.md` 참고
- 인증/멱등성 플러그인 동작 방식, 환경 변수, 예시 등 포함

---

## 주요 특징

- **🔒 BFF 보안 패턴**: Next.js가 모든 API 요청의 중앙 게이트웨이 역할
- **Auth API 보호**: 인증 서비스는 내부망에서만 접근 가능
- **Kong API Gateway**: 비즈니스 API는 JWT 인증 및 멱등성 정책으로 보호
- **개별 프록시 함수**: 각 API별 세밀한 제어와 HttpOnly 쿠키 보안

---

## 폴더 구조

```
.
├── fastify-member-server/   # 회원 관리 서비스
├── koa-auth-server/         # 인증 서비스 (내부망 전용)
├── ecommerce-app/           # 프론트엔드 + BFF Proxy
├── kong/                    # Kong API Gateway 설정
├── docker-compose.yml       # 컨테이너 구성
└── README.md                # 프로젝트 문서
```

---

## 빠른 시작

1. **환경 변수 파일 준비**

   - 각 서비스 폴더에 `.env` 파일을 생성하고 환경변수를 설정하세요.

2. **전체 서비스 실행**

   ```bash
   # 환경 변수 설정
   # 각 서비스 폴더에 .env 파일 생성 및 설정

   # Docker로 전체 서비스 실행
   docker-compose -p project-name up --build
   ```

3. **개별 서비스 개발 서버 실행**
   ```bash
   # 예시: Fastify 서버
   cd fastify-member-server
   npm install
   npm run dev
   ```

---

## 주요 기술 스택

- **서버**: Node.js, TypeScript
- **프레임워크**: Fastify, Koa, Next.js
- **ORM**: Prisma ORM
- **데이터베이스**: PostgreSQL, Redis
- **API Gateway**: Kong
- **인프라**: Docker, Docker Compose
- **보안**: BFF 패턴, HttpOnly 쿠키, 개별 프록시 함수

---

### 아키텍처 개선 (🔒 보안 강화)

```
[BFF 패턴: Backend for Frontend]

┌──────────────┐   HTTP 요청   ┌──────────────────────────────────┐   내부망   ┌──────────────┐
│              │─────────────►│          Next.js                 │───────────►│   API 서버   │
│  브라우저/앱 │               │   (프론트엔드 + API Routes)       │           │(Member/Auth) │
└──────────────┘               └──────────────────────────────────┘           └──────────────┘

✅ 장점:
- Auth API 엔드포인트 완전 숨김 (보안 강화)
- HttpOnly 쿠키로 XSS 공격 방어
- 단순한 아키텍처 (레이어 감소)
- CORS 문제 없음 (동일 오리진)
- 개발/운영 환경 일관성

🔒 보안 정책:
- 클라이언트는 Next.js API Routes를 통해서만 백엔드 접근
- Auth 서비스는 Docker 내부 네트워크에서만 접근 가능
- 모든 인증 토큰은 HttpOnly 쿠키로 안전하게 관리
```

---

## 라이선스

MIT
