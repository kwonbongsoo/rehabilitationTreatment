### 경력 단절을 이겨내기 위한 재활 치료 프로젝트

# Fastify Member Platform

회원 관리 및 인증 기능을 제공하는 Node.js 기반의 Fastify 서버 프로젝트입니다.  
Docker, Prisma, PostgreSQL, Koa, Next.js, Kong API Gateway, Nginx 등 다양한 기술 스택을 활용하여  
모던한 백엔드/풀스택 환경을 구성합니다.

**API Gateway(Kong)와 리버스 프록시(Nginx)를 도입하여, 모든 트래픽이 Nginx → Kong → 내부 서비스로만 흐르도록 보안적으로 강화했습니다.**

---

## 주요 기능

- 회원 가입, 로그인, 정보 수정, 삭제
- 인증 서버(koa-auth-server) 연동
- 이커머스 프론트엔드(ecommerce-app) 연동
- **Kong API Gateway 멱등성 플러그인으로 중복 요청 방지**
- Docker Compose로 전체 서비스 손쉽게 실행
- **API Gateway(Kong) 및 Nginx 리버스 프록시 연동**
- 사용자 정의 네트워크(app-network)로 서비스 간 통신 격리
- 각 서비스의 Dockerfile 최적화 및 .dockerignore 적용

---

## 폴더 구조

```
.
├── fastify-member-server/   # 회원 관리 서비스
├── koa-auth-server/         # 인증 서비스
├── ecommerce-app/           # 프론트엔드
├── kong/                    # API Gateway 설정
├── nginx/                   # 리버스 프록시 설정
├── docker-compose.yml       # 컨테이너 구성
└── README.md                # 프로젝트 문서
```

---

## 시스템 아키텍처

```
┌──────────────┐     HTTP 요청     ┌──────────────┐                      ┌──────────────┐
│              │ ─────────────────►│              │────────────────────►│              │
│   클라이언트  │                   │    Nginx     │    인증 성공 시        │  API Gateway │
│  (브라우저/앱) │ ◄─────────────── │  (인증 프록시) │◄──────────────────── │   (Kong)     │
└──────────────┘     HTTP 응답     └──────┬───────┘                      └───────┬──────┘
                                          │                                     │
                                          │ auth_request                        │
                                          │ /auth_check                         │
                                          ▼                                     │
                                   ┌──────────────┐                             │
                                   │              │                             │
                                   │  Auth 서비스  │                             │
                                   │   (Koa)      │                             │
                                   └──────┬───────┘                             │
                                          │                                     │
                                          │                                     │
                                          │                                     │
                 ┌─────────────────────────────────────────────┐                │
                 │                                             │                │
                 ▼                                             ▼                ▼
          ┌──────────────┐                            ┌──────────────┐  ┌──────────────┐
          │              │                            │              │  │              │
          │    Redis     │◄───────────────────────────┤ Member 서비스 │◄─┤ 기타 서비스   │
          │  (토큰/캐시)  │───────────────────────────►│  (Fastify)   │─►│              │
          └──────────────┘                            └──────┬───────┘  └──────────────┘
                                                            │
                                                            │
                                                            ▼
                                                     ┌──────────────┐
                                                     │              │
                                                     │  PostgreSQL  │
                                                     │  (Database)  │
                                                     └──────────────┘
```

## 요청 흐름 상세 설명

### 1. 인증 체크 흐름 (보호된 리소스 접근)
1. **클라이언트 → Nginx**: 사용자가 API 요청 (Authorization 헤더 포함)
2. **Nginx**: `auth_request` 지시어를 통해 인증 여부 확인
   - 내부적으로 `/auth_check` 경로로 서브 요청 발생
   - 원본 요청은 대기 상태로 유지
3. **Nginx → Auth 서비스**: 토큰 검증 요청 (`/auth/verify` 엔드포인트)
4. **Auth 서비스 → Redis**: 토큰 유효성 검증 및 사용자 정보 조회
5. **Auth 서비스 → Nginx**: 
   - 성공 시: 200 OK 응답
   - 실패 시: 401/403 오류 응답
6. **Nginx**의 판단:
   - 인증 성공: 원본 요청을 API Gateway로 전달
   - 인증 실패: 오류 응답을 클라이언트에 반환 (요청 처리 중단)

### 2. 인증 우회 흐름 (로그인/회원가입)
1. **클라이언트 → Nginx**: 인증 관련 요청 (`/auth/login`, `/auth/register` 등)
2. **Nginx**: 해당 경로는 `auth_request` 검사 없이 바로 처리
3. **Nginx → API Gateway → Auth 서비스**: 인증 처리 요청 전달
4. **Auth 서비스 → Member 서비스**: 사용자 자격 증명 검증
5. **Member 서비스 → Auth 서비스**: 사용자 정보 반환
6. **Auth 서비스**: 토큰 생성 및 Redis에 저장
7. **클라이언트**: 토큰 수신 및 저장

### 3. 데이터 요청 흐름 (인증 후)
1. **Nginx → API Gateway**: 인증된 요청 전달
2. **API Gateway → Member 서비스**: 적절한 서비스로 요청 라우팅
3. **Member 서비스 → PostgreSQL**: 데이터베이스 작업 수행
4. **Member 서비스 → API Gateway → Nginx → 클라이언트**: 응답 반환

### 4. 중복 요청 방지 (멱등성) 처리 ✅
1. **클라이언트**: POST/PUT/PATCH 요청 시 고유한 `X-Idempotency-Key` 헤더 포함
2. **Kong API Gateway**: 사용자 정의 멱등성 플러그인으로 요청 처리
   - Redis를 통한 응답 캐싱 (TTL: 60초)
   - 동일한 멱등키로 중복 요청 시 캐시된 응답 반환
3. **신규 요청 시**: 멱등키와 응답을 Redis에 저장 후 정상 처리
4. **적용 범위**: `/api/members` 경로의 POST, PUT, PATCH 메서드

<!-- 다른 서비스들과 Redis 인스턴스를 공유할 때
db: 0  Kong 멱등성 캐시 (현재 적용됨)
db: 1  인증 서비스 세션 -->

### 주요 특징

- **Nginx의 중앙 인증**: 모든 요청은 Nginx의 `auth_request` 모듈을 통해 인증됨
- **효율적인 인증 체크**: 실제 처리 전 빠르게 인증 상태 확인
- **Kong API Gateway**: API 관리, 라우팅 및 정책 적용 담당
- **멱등성 보장**: Kong 레벨에서 Redis 기반 멱등성 플러그인 적용
- **토큰 관리**: Redis를 통한 빠른 토큰 유효성 검증
- **마이크로서비스 설계**: 각 서비스가 자체 책임 영역 담당

---

## 빠른 시작

1. **환경 변수 파일 준비**
   - 각 서비스 폴더에 `.env` 파일을 생성하고 환경변수를 설정하세요.

2. **전체 서비스 실행**
   ```
   # 환경 변수 설정
   # 각 서비스 폴더에 .env 파일 생성 및 설정

   # Docker로 전체 서비스 실행
   docker-compose -p project-name up --build
   ```

3. **개별 서비스 개발 서버 실행**
   ```
   # 예시: Fastify 서버
   cd fastify-member-server
   npm install
   npm run dev
   ```

---

## 주요 기술 스택

- 서버: Node.js, TypeScript
- 프레임워크: Fastify, Koa, Next.js
- ORM: Prisma ORM
- DB: PostgreSQL
- 인프라: Docker, Kong API Gateway, Nginx (Reverse Proxy)

---

### SSR/CSR 환경별 API 호출 아키텍처 (예정)

```
[SSR: 서버사이드 렌더링]

┌──────────────┐   HTTP 요청   ┌──────────────┐   내부망   ┌──────────────┐
│              │─────────────►│   Next.js    │───────────►│   API 서버   │
│  브라우저/앱 │               │ (서버, Node) │           │(Member/Auth) │
└──────────────┘   (초기 요청) └──────────────┘           └──────────────┘

※ Next.js 서버가 직접 API 서버(내부망)로 호출 (Nginx/Kong 우회)


[CSR: 클라이언트사이드 렌더링]

┌──────────────┐   HTTP 요청   ┌──────────────┐   프록시   ┌──────────────┐   라우팅   ┌──────────────┐
│              │─────────────►│    Nginx     │───────────►│    Kong     │───────────►│   API 서버   │
│  브라우저/앱 │               │ (ReverseProxy)│           │ (API GW)    │           │(Member/Auth) │
└──────────────┘               └──────────────┘           └──────────────┘           └──────────────┘

※ 브라우저에서 Nginx → Kong → API 서버로 요청 (보안/정책 적용)
```

- SSR: Next.js 서버가 API 서버(내부망)로 직접 호출 (빠르고 안전)
- CSR: 브라우저는 반드시 Nginx/Kong을 거쳐 API 서버 접근 (보안/정책)



---
## 라이선스

MIT
