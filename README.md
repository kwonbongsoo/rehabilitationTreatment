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