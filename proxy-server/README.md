# Bun Proxy Server

Next.js 앞단에서 HTML 캐싱과 인증을 담당하는 Bun 기반 프록시 서버입니다.

## 구조

```
Client → Bun Proxy (9000) → Next.js (3000) → Kong → BFF
```

## 실행 방법

### 로컬 개발
```bash
cd proxy-server

# 환경 설정
cp .env.example .env
# .env 파일을 필요에 따라 수정

# 의존성 설치 및 실행
bun install
bun run dev
```

### Docker로 실행
```bash
# 전체 스택 실행
docker-compose up --build

# 프록시만 실행 (개발용)
docker-compose up proxy-server ecommerce-app --build
```

## 환경 변수

프로젝트 루트의 `.env` 파일에서 설정:

### 필수 설정
- `PORT`: 프록시 서버 포트 (기본값: 9000)
- `NEXT_SERVER`: Next.js 서버 URL (기본값: http://localhost:3000)
- `NODE_ENV`: 실행 환경 (development/production)

### 로깅 설정
- `ENABLE_REQUEST_LOGGING`: 요청 로깅 활성화 (true/false)
- `LOG_LEVEL`: 로그 레벨 (info/debug/error)

### 향후 확장 예정
- `REDIS_URL`: Redis 캐싱 서버 URL
- `JWT_SECRET`: JWT 토큰 비밀키
- `CACHE_TTL_SECONDS`: 캐시 TTL 설정

## API

- `GET /`: Next.js로 프록시
- `POST /*`: 모든 요청을 Next.js로 프록시
- 응답 헤더에 `X-Proxy-Server: bun-proxy` 추가

## 로그

요청/응답 로그가 콘솔에 출력됩니다:
```
📥 [timestamp] GET /
🔄 Proxying to: http://localhost:3000/
✅ Response: 200 OK
```