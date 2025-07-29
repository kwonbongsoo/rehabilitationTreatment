# 회원가입 중복 클릭 방지 솔루션 테스트 가이드

## 🎯 구현된 솔루션 개요

### 1. 다계층 방어 전략

- **클라이언트 사이드**: 멱등성 키 생성 + 버튼 쿨다운 + 중복 요청 차단
- **API Gateway (Kong)**: 멱등성 플러그인으로 서버 레벨 중복 방지 (권장)
- **서비스 레벨**: Fastify 멱등성 미들웨어로 백업 방어선

### 2. 핵심 컴포넌트

- `useIdempotentMutation`: 클라이언트 멱등성 보장 훅
- `AuthButton`: 쿨다운 기능이 있는 버튼 컴포넌트
- `IdempotencyMiddleware`: Fastify 서버 멱등성 처리
- Kong 플러그인: API Gateway 레벨 멱등성 처리

## 🧪 테스트 시나리오

### 시나리오 1: 클라이언트 사이드 중복 방지 테스트

#### 준비사항

```bash
cd ecommerce-app
npm run dev
```

#### 테스트 절차

1. **기본 중복 클릭 테스트**

   - 회원가입 페이지(`/member/register`) 접속
   - 폼에 유효한 데이터 입력
   - 회원가입 버튼을 **빠르게 여러 번 클릭**
   - **예상 결과**: 첫 번째 클릭만 처리되고, 이후 클릭은 무시됨

2. **버튼 쿨다운 테스트**

   - 회원가입 버튼 클릭 후 버튼 상태 확인
   - **예상 결과**: 버튼이 비활성화되고 "처리 중..." 표시
   - 완료 후 2초간 쿨다운 표시

3. **네트워크 지연 시뮬레이션**
   - 개발자 도구 → Network → Throttling을 "Slow 3G"로 설정
   - 회원가입 버튼을 여러 번 클릭
   - **예상 결과**: 하나의 요청만 서버로 전송됨

#### 검증 포인트

- 브라우저 Network 탭에서 `/api/members` 요청이 한 번만 발생하는지 확인
- `X-Idempotency-Key` 헤더가 포함되어 있는지 확인
- 콘솔에서 멱등성 관련 로그 확인

### 시나리오 2: 서버 사이드 멱등성 테스트

#### 준비사항

```bash
cd fastify-member-server
npm run dev
```

#### 테스트 절차 (직접 API 호출)

```bash
# PowerShell에서 실행

# 1. 첫 번째 회원가입 요청
$headers = @{
    'Content-Type' = 'application/json'
    'X-Idempotency-Key' = 'test-key-12345'
}

$body = @{
    id = 'testuser123'
    email = 'test@example.com'
    name = 'Test User'
    password = 'password123'
} | ConvertTo-Json

$response1 = Invoke-RestMethod -Uri 'http://localhost:3002/api/members' -Method POST -Headers $headers -Body $body

# 2. 동일한 멱등성 키로 중복 요청
$response2 = Invoke-RestMethod -Uri 'http://localhost:3002/api/members' -Method POST -Headers $headers -Body $body

# 응답 비교
Write-Host "First Response: $($response1 | ConvertTo-Json)"
Write-Host "Second Response: $($response2 | ConvertTo-Json)"
```

#### 검증 포인트

- 첫 번째 요청: `201 Created` 응답
- 두 번째 요청: `201 Created` 응답 + `X-Idempotency-Replayed: true` 헤더
- 데이터베이스에 사용자가 한 번만 생성됨
- Redis에 멱등성 키가 캐시됨

### 시나리오 3: Kong API Gateway 멱등성 테스트 (Kong 적용 시)

#### 준비사항

```bash
# Kong 설정 적용
cd .
docker-compose up kong postgres redis -d
```

#### 테스트 절차

```bash
# Kong을 통한 요청 (포트 8000)
$headers = @{
    'Content-Type' = 'application/json'
    'X-Idempotency-Key' = 'kong-test-key-67890'
}

$body = @{
    id = 'konguser123'
    email = 'kong@example.com'
    name = 'Kong User'
    password = 'password123'
} | ConvertTo-Json

# Kong을 통한 첫 번째 요청
$response1 = Invoke-RestMethod -Uri 'http://localhost:8000/api/members' -Method POST -Headers $headers -Body $body

# Kong을 통한 중복 요청
$response2 = Invoke-RestMethod -Uri 'http://localhost:8000/api/members' -Method POST -Headers $headers -Body $body
```

## 🔍 모니터링 및 디버깅

### 로그 확인

```bash
# Member 서비스 로그
docker logs fastify-member-server -f

# Kong 로그
docker logs kong -f

# Redis 로그
docker logs redis -f
```

### Redis 캐시 확인

```bash
# Redis CLI 접속
docker exec -it redis redis-cli

# 멱등성 키 확인
KEYS "member-idempotency:*"
GET "member-idempotency:your-key-here"

# TTL 확인
TTL "member-idempotency:your-key-here"
```

### 데이터베이스 확인

```sql
-- PostgreSQL에서 중복 생성 확인
SELECT id, email, name, created_at
FROM member
WHERE id = 'testuser123' OR email = 'test@example.com'
ORDER BY created_at;
```
