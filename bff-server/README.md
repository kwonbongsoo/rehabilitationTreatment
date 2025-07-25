# BFF 서버

Fastify 기반으로 구축된 고성능 Backend for Frontend (BFF) 서버입니다. 인증 서비스와 멤버 서비스에 대한 요청을 집계하고 프록시 역할을 수행합니다.

## 개요

이 BFF 서버는 프론트엔드 애플리케이션과 마이크로서비스(koa-auth-server, fastify-member-server) 사이의 중간 계층으로 동작하며, 다음과 같은 기능을 제공합니다:

- 요청 집계 및 오케스트레이션
- 응답 변환 처리
- 에러 처리 및 로깅
- 보안 미들웨어

## 아키텍처

```
프론트엔드 (ecommerce-app:3000)
       ↓
BFF 서버 (bff-server:3001)
       ↓
┌─────────────────────┬─────────────────────┐
│ 인증 서비스          │ 멤버 서비스          │
│ (koa-auth-server)   │ (fastify-member)    │
│ :4000               │ :5000               │
└─────────────────────┴─────────────────────┘
```

## 개발 환경

### 로컬 개발
```bash
npm install
npm run dev
```

### Docker 개발
```bash
# docker-compose로 빌드 및 실행
docker-compose up --build bff-server
```

## API 엔드포인트

- `GET /health` - 헬스 체크 엔드포인트
- `POST /api/auth/*` - 인증 엔드포인트 (koa-auth-server로 프록시)
- `GET|POST|PUT|DELETE /api/members/*` - 멤버 엔드포인트 (fastify-member-server로 프록시)

## 환경 변수

사용 가능한 모든 환경 변수는 `.env.example` 파일을 참고하세요.

## 서비스 의존성

- koa-auth-server: 인증 및 권한 부여
- fastify-member-server: 멤버 관리 기능

## 성능 특징

- **고속 처리**: Express 대비 2-3배 빠른 성능
- **메모리 효율성**: 낮은 메모리 사용량
- **내장 로깅**: Fastify 내장 로깅 시스템
- **타입 안전성**: 향상된 TypeScript 지원