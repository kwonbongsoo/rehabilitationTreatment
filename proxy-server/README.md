# Bun Proxy Server

Next.js 앞단에서 Redis 기반 HTML 캐싱과 인증을 담당하는 Bun 기반 프록시 서버입니다.

## 주요 기능

- **HTML 캐싱**: `/`와 `/categories` 페이지에 대한 Redis 기반 분산 캐싱
- **RSC 직접 프록시**: RSC 요청은 캐시하지 않고 Next.js로 직접 전달하여 실시간 동적 처리
- **게스트 토큰 발급**: 인증되지 않은 사용자를 위한 임시 게스트 토큰 생성 및 관리
- **캐시 최적화**: URL 파라미터 제거로 효율적인 캐시 키 생성
- **분산 락**: 동시 캐시 쓰기 방지로 데이터 일관성 보장
- **자동 만료**: TTL 1분 설정으로 캐시 자동 갱신
- **인증 프록시**: Kong Gateway 연동 토큰 관리

## 구조

```
HTML 요청: Client → Bun Proxy (9000) → Redis Cache → Next.js (3000) → Kong → BFF
RSC 요청:  Client → Bun Proxy (9000) → Next.js (3000) → Kong → BFF (캐시 우회)
```

## 성능 특성

**HTML 초기 로딩**: 프록시를 거치기 때문에 Next.js 직접 접근보다 약간 느릴 수 있습니다.
**HTML 캐시 적중 시**: Redis에서 즉시 응답하여 매우 빠른 성능을 제공합니다.
**RSC 요청**: 캐시를 거치지 않고 Next.js로 직접 프록시되어 실시간 응답성을 보장합니다.

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

[timestamp] GET /categories?_rsc=abc123&category=electronics
프록시 to Next.js (RSC 요청은 캐시하지 않음)
```

## 트러블슈팅

### Next.js 렌더링 방식 이해

Next.js App Router는 사용자의 페이지 접근 방식에 따라 서로 다른 렌더링 전략을 사용합니다.

#### 1. 브라우저 새로고침 (SSR/SSG)

**동작 방식**:
- 사용자가 주소창에 URL 입력 또는 Ctrl+R로 새로고침
- 브라우저가 서버에 전체 HTML 문서 요청
- Next.js가 Server-Side Rendering 또는 Static Site Generation 수행

**요청 특성**:
```http
GET /categories HTTP/1.1
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
```

**응답 특성**:
```http
Content-Type: text/html; charset=utf-8
Content-Length: 35125

<!DOCTYPE html>
<html>
  <head>...</head>
  <body>
    <div id="__next">전체 페이지 HTML</div>
  </body>
</html>
```

#### 2. Next.js Link 컴포넌트 클릭 (CSR with RSC)

**동작 방식**:
- 사용자가 `<Link href="/categories">` 클릭
- JavaScript가 클라이언트에서 라우팅 처리
- Next.js가 React Server Components 형태로 필요한 부분만 요청

**요청 특성**:
```http
GET /categories?_rsc=5f2d3a1b HTTP/1.1
Accept: text/x-component
RSC: 1
Next-Router-State-Tree: %5B%22%22...
```

**응답 특성**:
```http
Content-Type: text/x-component
Content-Length: 8421

1:HL["/_next/static/css/app/layout.css"]
2:I{"id":"categories-page","chunks":["app/page"]}
3:{"props":{"children":[null,["$",...)
```

### HTML 캐싱과 RSC 프록시 분리

**적용된 전략**:
HTML 요청과 RSC 요청을 구분하여 처리:

1. **HTML 요청 (새로고침)**: Redis 캐시 시스템 적용
2. **RSC 요청 (Link 클릭)**: Next.js로 직접 프록시 (캐시하지 않음)

**처리 방식**:
```javascript
// 현재 구현
새로고침: /categories → HTML 캐시 적용
Link 클릭: /categories?_rsc=abc → Next.js 직접 프록시
```

**이유**:
- RSC는 동적 컴포넌트 상태를 반영하므로 캐시 부적합
- Next.js의 RSC 최적화 기능을 그대로 활용
- HTML은 상대적으로 정적이어서 캐시 효과 높음

### RSC 요청 처리 방식

**RSC 파라미터 식별**:
- Next.js가 RSC 요청을 식별하는 핵심 매개변수 `_rsc`
- 서버에서 적절한 렌더링 모드 선택에 사용
- 클라이언트 상태와 서버 상태 동기화에 필요

**현재 처리 방식**:
RSC 요청은 캐시를 거치지 않고 Next.js로 직접 프록시

```javascript
// 현재 구현
const isRSCRequest = url.searchParams.has('_rsc');

if (!isRSCRequest && req.method === 'GET') {
  // HTML 요청만 캐시 확인
  const cachedContent = await cacheMiddleware.checkCache(targetUrl);
}

// RSC 요청은 바로 Next.js로 프록시
const response = await this.proxyRequest(modifiedRequest, targetUrl);
```

**장점**:
- RSC의 실시간 동적 특성 보장
- Next.js의 내장 RSC 최적화 활용
- 프록시 서버 로직 단순화

### 캐시 전략 상세

#### 캐시 키 설계
```
HTML 캐시만: html_cache:{host}{path}

예시:
html_cache:ecommerce-app:3000/categories
```

#### 파라미터 처리 전략
- **HTML 요청**: 비즈니스 파라미터 제거하여 캐시 효율성 극대화
  - `category=electronics`, `page=2`, `sort=price` 등 무시
- **RSC 요청**: 캐시하지 않고 모든 파라미터와 함께 Next.js로 직접 전달
  - `_rsc=abc123` 포함 전체 쿼리스트링 보존

#### 분산 락 적용
동시 요청으로 인한 중복 캐시 생성 방지:

```
요청1: /categories (Cache MISS) → 락 획득 → Next.js 요청 → 캐시 저장
요청2: /categories (Cache MISS) → 락 대기 실패 → Next.js 요청 (중복)
```

### 성능 고려사항

#### 초기 로딩 지연
**원인**: 프록시 레이어 추가로 인한 네트워크 홉 증가
```
직접 접근: 브라우저 → Next.js (1 hop)
프록시 경유: 브라우저 → Proxy → Next.js (2 hops)
```

**완화 방법**:
1. **Redis 연결 최적화**: Connection pooling, Keep-alive
2. **지리적 배치**: Proxy와 Next.js 서버 근접 배치
3. **캐시 예열**: 주요 페이지 사전 캐싱

#### 캐시 효율성
- **Cache Hit Rate**: 80% 이상 목표
- **TTL 설정**: 컨텐츠 업데이트 주기 고려 (기본: 1시간)
- **메모리 사용량**: Redis 메모리 모니터링 필수

### 디버깅 가이드

#### 캐시 동작 확인
```bash
# Redis 캐시 키 확인
redis-cli KEYS "*cache*"

# 캐시 내용 확인 (HTML만)
redis-cli GET "html_cache:ecommerce-app:3000/categories"
```

#### 네트워크 요청 분석
브라우저 개발자 도구에서 확인할 요소:
- **Request Headers**: `Accept`, `RSC`, `Next-Router-State-Tree`
- **Response Headers**: `Content-Type`, `X-Cache`, `X-Cache-TTL`
- **URL Parameters**: `_rsc` 파라미터 존재 여부
