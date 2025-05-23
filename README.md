### 개발재활 치료 사이드 프로젝트

# Fastify Member Platform

회원 관리 및 인증 기능을 제공하는 Node.js 기반의 Fastify 서버 프로젝트입니다.  
Docker, Prisma, PostgreSQL, Koa, Next.js 등 다양한 기술 스택을 활용하여  
모던한 백엔드/풀스택 환경을 구성합니다.

**추후 API Gateway도 추가하여 서비스 확장성과 보안, 트래픽 관리 기능을 강화할 예정입니다.**

## 주요 기능

- 회원 가입, 로그인, 정보 수정, 삭제
- 인증 서버(koa-auth-server) 연동
- 이커머스 프론트엔드(ecommerce-app) 연동
- PostgreSQL 데이터베이스 사용
- Prisma ORM 적용
- Docker Compose로 전체 서비스 손쉽게 실행
- **(예정) API Gateway 연동**

## 폴더 구조

```
.
├── fastify-member-server/   # Fastify 기반 회원 서버
├── koa-auth-server/         # Koa 기반 인증 서버
├── ecommerce-app/           # Next.js 기반 프론트엔드
├── docker-compose.yaml      # 전체 서비스 오케스트레이션
└── postgres-data/           # DB 데이터 볼륨
```

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

## 주요 기술 스택

- Node.js, TypeScript
- Fastify, Koa, Next.js
- Prisma ORM
- PostgreSQL
- Docker, Docker Compose

## 개발 및 배포 참고

- 개발 환경에서는 `.env` 파일을 이미지에 포함할 수 있지만,  
  운영 배포 시에는 반드시 외부에서 환경변수를 주입하세요.
- Prisma Client의 경로와 import 경로가 일치해야 합니다.

## 라이선스

MIT