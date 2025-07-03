# 회원 서버 (Fastify Member Server)

Fastify 기반의 회원 관리 서비스입니다.

## 주요 기능

- 회원 정보 CRUD
- Prisma ORM을 통한 데이터 관리
- 멱등성 처리
- 요청 검증

## 기술 스택

- Fastify
- TypeScript
- Prisma
- PostgreSQL
- Jest (테스트)

## API 엔드포인트

### 회원 관리
- GET /members - 회원 목록 조회
- GET /members/:id - 회원 상세 조회
- POST /members - 회원 생성
- PUT /members/:id - 회원 정보 수정
- DELETE /members/:id - 회원 삭제

### 프로필
- GET /members/:id/profile - 프로필 조회
- PUT /members/:id/profile - 프로필 수정

## 설치 및 실행

1. 의존성 설치
```bash
npm install
```

2. 환경 변수 설정
```bash
cp .env.example .env
```

3. 데이터베이스 마이그레이션
```bash
npx prisma migrate dev
```

4. 개발 모드 실행
```bash
npm run dev
```

5. 프로덕션 빌드
```bash
npm run build
npm start
```

## 환경 변수

- `PORT`: 서버 포트 (기본값: 5000)
- `DATABASE_URL`: PostgreSQL 연결 문자열
- `REDIS_URL`: Redis 연결 문자열 (멱등성 처리용)
- `REDIS_PORT`: Redis 포트 (기본값: 6379)
- `REDIS_PASSWORD`: Redis 비밀번호
- `REDIS_DB`: Redis 데이터베이스 번호 (기본값: 0)
- `NODE_ENV`: 실행 환경 (development/production)
- `POSTGRES_PASSWORD`: PostgreSQL 데이터베이스 비밀번호
- `POSTGRES_DB`: PostgreSQL 데이터베이스 이름
- `TZ`: 타임존 설정 (기본값: Asia/Seoul)

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
├── controllers/        # 컨트롤러
├── interfaces/         # 타입 정의
├── middlewares/        # 미들웨어
├── plugins/            # Fastify 플러그인
├── routes/             # 라우트 정의
├── schemas/           # JSON 스키마
├── services/          # 비즈니스 로직
└── utils/             # 유틸리티 함수
```

## 멱등성 처리

### 구현 방식
- Redis를 사용한 요청 ID 관리
- 중복 요청 감지 및 처리
- 응답 캐싱

### 적용 대상
- POST /members
- PUT /members/:id
- DELETE /members/:id

## 데이터베이스

### Prisma 스키마
- Member 모델
- Profile 모델
- 관계 설정

### 마이그레이션
```bash
# 마이그레이션 생성
npx prisma migrate dev --name init

# 마이그레이션 적용
npx prisma migrate deploy
```

## API 문서

서버 실행 후 http://localhost:5000/docs 에서 Swagger UI로 API 문서를 확인할 수 있습니다.
