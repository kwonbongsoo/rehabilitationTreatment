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
- POST /auth/logout - 로그아웃
- POST /auth/guest-token - 게스트 토큰 발급
- GET /auth/verify - 토큰 유효성 검증
- GET /auth/session-info - 현재 사용자 정보

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

- `AUTH_PORT`: 서버 포트 (기본값: 4000)
- `REDIS_URL`: Redis 연결 문자열
- `REDIS_PORT`: Redis 연결 포트
- `REDIS_PASSWORD`: Redis 비밀번호
- `REDIS_DB`: Redis 데이터베이스 번호 (기본값: 0)
- `JWT_EXPIRES_IN`: JWT 토큰 만료 시간 (초 단위, 기본값: 3600)
- `JWT_SECRET`: JWT 시크릿 키
- `MEMBER_SERVICE_URL`: 회원 서비스 URL
- `MEMBER_SERVICE_TIMEOUT`: 회원 서비스 요청 타임아웃 (ms, 기본값: 5000)
- `AUTH_BASIC_KEY`: Basic 인증 키 (서비스간 통신용)
- `NODE_ENV`: 실행 환경 (development 또는 production)


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

