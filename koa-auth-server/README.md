# 인증 서버 (Koa Auth Server)

Koa.js 기반의 인증 서비스입니다.

## 주요 기능

- JWT 토큰 기반 인증
- Redis 세션 관리
- 토큰 발급/검증/갱신
- 보안 강화된 쿠키 처리

## 기술 스택

- Koa.js
- TypeScript
- Redis
- Jest (테스트)

## API 엔드포인트

### 인증
- POST /auth/login - 로그인
- POST /auth/register - 회원가입
- POST /auth/logout - 로그아웃
- GET /auth/me - 현재 사용자 정보
- POST /auth/refresh - 토큰 갱신

### 토큰
- POST /token/validate - 토큰 검증
- POST /token/revoke - 토큰 폐기

## 설치 및 실행

1. 의존성 설치
```bash
npm install
```

2. 환경 변수 설정
```bash
cp .env.example .env
```

3. 개발 모드 실행
```bash
npm run dev
```

4. 프로덕션 빌드
```bash
npm run build
npm start
```

## 환경 변수

- `PORT`: 서버 포트 (기본값: 4000)
- `REDIS_URL`: Redis 연결 문자열
- `JWT_SECRET`: JWT 시크릿 키
- `COOKIE_SECRET`: 쿠키 암호화 키
- `MEMBER_SERVICE_URL`: 회원 서비스 URL

## 테스트

```bash
# 단위 테스트 실행
npm test

# 테스트 커버리지 확인
npm run test:coverage
```

## 프로젝트 구조

```
src/
├── __tests__/          # 테스트 파일
├── adapters/           # 외부 서비스 어댑터
├── config/             # 설정 파일
├── constants/          # 상수 정의
├── controllers/        # 컨트롤러
├── interfaces/         # 타입 정의
├── middlewares/        # 미들웨어
├── routes/             # 라우트 정의
├── services/          # 비즈니스 로직
└── utils/             # 유틸리티 함수
```

## 보안 기능

### 토큰 관리
- Access Token과 Refresh Token 발급
- Redis를 통한 토큰 블랙리스트 관리
- 토큰 만료 시간 설정

### 쿠키 보안
- HttpOnly 플래그 사용
- Secure 플래그 (HTTPS 전용)
- SameSite 설정

### 세션 관리
- Redis 기반 세션 저장
- 세션 만료 처리
- 동시 로그인 제어

## API 문서

서버 실행 후 http://localhost:4000/docs 에서 Swagger UI로 API 문서를 확인할 수 있습니다.
