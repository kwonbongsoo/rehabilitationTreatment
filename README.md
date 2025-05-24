### 개발재활 치료 사이드 프로젝트

# Fastify Member Platform

회원 관리 및 인증 기능을 제공하는 Node.js 기반의 Fastify 서버 프로젝트입니다.  
Docker, Prisma, PostgreSQL, Koa, Next.js, Kong API Gateway, Nginx 등 다양한 기술 스택을 활용하여  
모던한 백엔드/풀스택 환경을 구성합니다.

**API Gateway(Kong)와 리버스 프록시(Nginx)를 도입하여, 모든 트래픽이 Nginx → Kong → 내부 서비스로만 흐르도록 보안적으로 강화했습니다.  
각 서비스의 Dockerfile과 .dockerignore를 최적화하여 이미지 용량을 줄이고, 불필요한 파일이 포함되지 않도록 개선했습니다.**

---

## 주요 기능

- 회원 가입, 로그인, 정보 수정, 삭제
- 인증 서버(koa-auth-server) 연동
- 이커머스 프론트엔드(ecommerce-app) 연동
- PostgreSQL 데이터베이스 사용
- Prisma ORM 적용
- Docker Compose로 전체 서비스 손쉽게 실행
- **API Gateway(Kong) 및 Nginx 리버스 프록시 연동**
- 사용자 정의 네트워크(app-network)로 서비스 간 통신 격리
- 각 서비스의 Dockerfile 최적화 및 .dockerignore 적용

---

## 폴더 구조

```
.
├── fastify-member-server/   # Fastify 기반 회원 서버
├── koa-auth-server/         # Koa 기반 인증 서버
├── ecommerce-app/           # Next.js 기반 프론트엔드
├── kong/                    # Kong declarative config (kong.yml)
├── nginx/                   # Nginx 리버스 프록시 설정 (nginx.conf)
├── docker-compose.yaml      # 전체 서비스 오케스트레이션
└── postgres-data/           # DB 데이터 볼륨
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
1. **클라이언트 → Nginx**: 인증 관련 요청 (`/auth/login`, `/auth/signup` 등)
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

### 4. 중복 요청 방지 (멱등성) 처리 예정
1. **클라이언트**: POST/PUT 요청 시 고유한 `X-Idempotency-Key` 헤더 생성
2. **중복 요청 감지 시**: 409 Conflict 응답 반환
3. **신규 요청 시**: 멱등키 저장 후 정상 처리
 - 어느 영역에서 멱등성 체크할지 고민중.

### 주요 특징

- **Nginx의 중앙 인증**: 모든 요청은 Nginx의 `auth_request` 모듈을 통해 인증됨
- **효율적인 인증 체크**: 실제 처리 전 빠르게 인증 상태 확인
- **Kong API Gateway**: API 관리, 라우팅 및 정책 적용 담당
- **토큰 관리**: Redis를 통한 빠른 토큰 유효성 검증
- **마이크로서비스 설계**: 각 서비스가 자체 책임 영역 담당

---

## 빠른 시작

1. **환경 변수 파일 준비**
   - 각 서비스 폴더에 `.env` 파일을 생성하고 환경변수를 설정하세요.

2. **Docker Compose로 전체 서비스 실행**
   ```sh
   docker-compose up --build
   ```

3. **개별 서비스 개발 서버 실행**
   ```sh
   # 예시: Fastify 서버
   cd fastify-member-server
   npm install
   npm run dev
   ```

---

## 주요 기술 스택

- Node.js, TypeScript
- Fastify, Koa, Next.js
- Prisma ORM
- PostgreSQL
- Docker, Docker Compose
- Kong API Gateway
- Nginx (Reverse Proxy)

---

## 개발 및 배포 참고

- 개발 환경에서는 `.env` 파일을 이미지에 포함하지 않고,  
  `docker-compose.yaml`의 `env_file`로 환경변수를 주입합니다.
- 각 서비스의 Dockerfile에서 `COPY . .` 대신 꼭 필요한 파일만 복사하여 이미지 용량을 최소화했습니다.
- `.dockerignore`에 `.env`를 포함해 보안성을 높였습니다.
- 모든 서비스는 사용자 정의 네트워크(app-network)에서만 통신하며,  
  외부에서는 오직 Nginx(80/443)만 접근 가능합니다.
- Kong Admin API 포트(8001, 8444)는 개발 시에만 열고, 운영 시에는 반드시 닫으세요.

---

## 라이선스

MIT
