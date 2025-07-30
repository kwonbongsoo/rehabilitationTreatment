# Bun Proxy Server

Next.js 앞단에서 Redis 기반 HTML 캐싱과 인증을 담당하는 Bun 기반 프록시 서버입니다.

## 주요 기능

- **HTML 캐싱**: `/`와 `/categories` 페이지에 대한 Redis 기반 분산 캐싱
- **캐시 최적화**: URL 파라미터 제거로 효율적인 캐시 키 생성
- **분산 락**: 동시 캐시 쓰기 방지로 데이터 일관성 보장
- **자동 만료**: TTL 1분 설정으로 캐시 자동 갱신
- **인증 프록시**: Kong Gateway 연동 토큰 관리

## 구조

```
Client → Bun Proxy (9000) → Redis Cache → Next.js (3000) → Kong → BFF
```

## 성능 특성

**초기 로딩 시간**: 프록시를 거치기 때문에 Next.js 직접 접근보다 약간 느릴 수 있습니다.
**캐시 적중 시**: Redis에서 즉시 응답하여 매우 빠른 성능을 제공합니다.

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

### 인증 설정
- `AUTH_SERVICE_URL`: 인증 서비스 URL
- `AUTH_PREFIX`: 인증 API 경로 접두사
- `AUTH_BASIC_KEY`: 기본 인증 키

### Redis 캐싱 설정
- `REDIS_URL`: Redis 서버 URL
- `REDIS_PORT`: Redis 포트 (기본값: 6379)
- `REDIS_DB`: Redis 데이터베이스 번호 (기본값: 0)
- `REDIS_PASSWORD`: Redis 비밀번호

### 로깅 설정
- `ENABLE_REQUEST_LOGGING`: 요청 로깅 활성화 (true/false)
- `LOG_LEVEL`: 로그 레벨 (info/debug/error)

## 캐싱 동작

### 캐시 대상 페이지
- `/`: 메인 페이지
- `/categories`: 카테고리 페이지 (파라미터 무시)

### 캐시 키 생성
```
/categories?filter=electronics → html_cache:ecommerce-app:3000/categories
/categories?page=2           → html_cache:ecommerce-app:3000/categories
```

### 캐시 흐름
1. **Cache HIT**: Redis에서 즉시 반환
2. **Cache MISS**: Next.js 요청 → Redis 저장 → 응답 반환
3. **동시 요청**: 분산 락으로 중복 캐시 생성 방지

## API

- `GET /`: 캐싱된 메인 페이지 또는 Next.js 프록시
- `GET /categories`: 캐싱된 카테고리 페이지 또는 Next.js 프록시  
- `GET /api/*`: Kong Gateway로 API 프록시
- `POST /*`: 모든 POST 요청을 적절한 서버로 프록시

## 로그 예시

```
[timestamp] GET /categories
Cache MISS: html_cache:ecommerce-app:3000/categories
Proxying to Next.js: http://ecommerce-app:3000/categories?category=1
Next.js response: 200 OK
Cache SET with lock: html_cache:ecommerce-app:3000/categories (TTL: 3600s)

[timestamp] GET /categories?page=2
Cache HIT: html_cache:ecommerce-app:3000/categories
```
