# E-commerce Application

현대적인 클린 아키텍처를 적용한 Next.js 기반 이커머스 애플리케이션입니다. Zustand를 활용한 상태 관리와 Kong Gateway를 통한 마이크로서비스 아키텍처를 구현했습니다.

## 🚀 주요 기능

### 🛡️ 인증 & 보안

- **토큰 기반 인증**: Kong Gateway를 통한 JWT 토큰 검증
- **멱등성 처리**: Kong의 idempotency 플러그인으로 중복 요청 방지
- **쿠키 기반 세션**: HttpOnly 쿠키를 통한 안전한 토큰 관리
- **역할 기반 접근 제어**: 게스트/사용자/관리자 권한 분리

### 🏪 이커머스 기능

- **상품 카탈로그**: 카테고리별 상품 브라우징
- **반응형 디자인**: 모든 디바이스에서 최적화된 UI
- **동적 라우팅**: Next.js 기반 SEO 친화적 페이지
- **장바구니**: 로컬 상태 관리 및 지속성

### 🔧 기술적 특징

- **클린 아키텍처**: Domain/Application/Infrastructure 레이어 분리
- **Zustand 상태 관리**: Context API 대신 경량화된 상태 관리
- **타입 안전성**: 전체 애플리케이션 TypeScript 적용
- **에러 처리**: 중앙화된 에러 관리 및 토스트 알림

## 🏗️ 아키텍처

### 레이어 구조

```
┌─────────────────────────────────────┐
│           Presentation              │  ← 컴포넌트, 페이지, 훅
├─────────────────────────────────────┤
│           Application               │  ← 비즈니스 로직, 검증
├─────────────────────────────────────┤
│             Domain                  │  ← 도메인 서비스, 엔티티
├─────────────────────────────────────┤
│           Infrastructure            │  ← 외부 서비스, 쿠키, 토큰
└─────────────────────────────────────┘
```

### 상태 관리

- **useAuthStore**: Zustand 기반 인증 상태 관리
- **useErrorStore**: 전역 에러 및 토스트 알림 관리
- **React Query**: 서버 상태 캐싱 및 동기화

## 📁 프로젝트 구조

```
ecommerce-app/
├── src/
│   ├── api/                    # API 클라이언트 및 모델
│   │   ├── client.ts           # HTTP 클라이언트 설정
│   │   ├── interceptors.ts     # 요청/응답 인터셉터
│   │   ├── models/             # 타입 정의
│   │   └── repository/         # 데이터 액세스 레이어
│   ├── components/             # 재사용 가능한 컴포넌트
│   │   ├── auth/               # 인증 관련 컴포넌트
│   │   ├── common/             # 공통 UI 컴포넌트
│   │   ├── errors/             # 에러 처리 컴포넌트
│   │   ├── home/               # 홈페이지 컴포넌트
│   │   ├── layout/             # 레이아웃 컴포넌트
│   │   └── member/             # 회원 관련 컴포넌트
│   ├── hooks/                  # 커스텀 훅
│   │   ├── queries/            # React Query 훅
│   │   └── use*.ts             # 비즈니스 로직 훅
│   ├── pages/                  # Next.js 페이지
│   │   ├── api/                # API 라우트
│   │   ├── auth/               # 인증 페이지
│   │   ├── member/             # 회원 페이지
│   │   └── products/           # 상품 페이지
│   ├── services/               # 서비스 레이어 (클린 아키텍처)
│   │   ├── application/        # 애플리케이션 서비스
│   │   ├── domain/             # 도메인 서비스
│   │   └── infrastructure/     # 인프라 서비스
│   ├── store/                  # Zustand 스토어
│   │   ├── useAuthStore.ts     # 인증 상태 관리
│   │   └── useErrorStore.ts    # 에러 상태 관리
│   ├── styles/                 # CSS 모듈
│   ├── types/                  # 타입 정의
│   └── utils/                  # 유틸리티 함수
├── public/                     # 정적 자산
└── 설정 파일들...
```

## 🛠️ 서비스 레이어 구조

### Domain Layer (도메인)

```typescript
// 인증 도메인 서비스
export const authDomainService = {
  validateUserSession,
  determineUserRole,
  // ...
};

// 회원 도메인 서비스
export const memberDomainService = {
  validateMemberData,
  processMemberRegistration,
  // ...
};
```

### Application Layer (애플리케이션)

```typescript
// 검증 서비스
export const validationService = {
  validateLoginCredentials,
  validateRegisterForm,
  validateForgotPasswordForm,
  // ...
};
```

### Infrastructure Layer (인프라)

```typescript
// 쿠키 서비스
export const cookieService = {
  setLoginCookies,
  clearAuthCookies,
  setTokenCookiesEdge,
  // ...
};

// 토큰 서비스
export const tokenService = {
  parseJwtPayload,
  validateTokenStructure,
  // ...
};
```

## 🔐 인증 시스템

### 토큰 플로우

1. **로그인 요청** → Auth Server
2. **JWT 토큰 발급** → HttpOnly 쿠키로 저장
3. **API 요청** → Kong Gateway에서 토큰 검증
4. **자동 세션 관리** → useAuthInitializer에서 상태 동기화

### 권한 관리

```typescript
const { user, isAuthenticated, isAdmin } = useAuth();

// 역할별 접근 제어
if (user?.role === 'admin') {
  // 관리자 기능
} else if (user?.role === 'user') {
  // 일반 사용자 기능
} else {
  // 게스트 기능
}
```

## 📊 상태 관리

### Zustand 스토어

```typescript
// 인증 상태
const { user, setUser, logout } = useAuthStore();

// 에러 관리
const { addToastError, globalError } = useErrorStore();

// 편의 훅
const { globalError, clearGlobalError } = useGlobalError();
const { toastErrors, removeToastError } = useToastError();
```

### 서버 상태 (React Query)

```typescript
// 로그인
const loginMutation = useLogin();

// 세션 정보
const sessionMutation = useSessionInfo();

// 로그아웃
const logoutMutation = useLogout();
```

## 🚦 시작하기

### 1. 환경 설정

```bash
# 저장소 클론
git clone <repository-url>
cd ecommerce-app

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.template .env.local
# .env.local에서 필요한 값들 설정
```

### 2. 개발 서버 실행

```bash
# 개발 모드
npm run dev

# 빌드
npm run build

# 프로덕션 모드
npm start
```

### 3. 전체 마이크로서비스 실행 (선택사항)

```bash
# 루트 디렉토리에서
docker-compose up
```

## 🧪 테스트

```bash
# 타입 체크
npm run type-check

# 린트
npm run lint

# 빌드 테스트
npm run build
```

## 📚 관련 문서

- [서비스 리팩토링 가이드](./SERVICES_REFACTORING_GUIDE.md)
- [서비스 리팩토링 요약](./SERVICES_REFACTORING_SUMMARY.md)
- [컴포넌트 가이드](./COMPONENT_GUIDE.md)
- [공통 모듈 가이드](./COMMON_MODULES_GUIDE.md)
- [프록시 설정](./PROXY_SETUP.md)

## 🔧 기술 스택

### Frontend

- **Next.js 15**: React 프레임워크
- **TypeScript**: 타입 안전성
- **Zustand**: 상태 관리
- **React Query**: 서버 상태 관리
- **CSS Modules**: 스타일링

### Backend Integration

- **Kong Gateway**: API 게이트웨이
- **Koa Auth Server**: 인증 서비스
- **Fastify Member Server**: 회원 서비스
- **Redis**: 캐싱 및 세션 관리

### DevOps

- **Docker**: 컨테이너화
- **ESLint + Prettier**: 코드 품질
- **TypeScript**: 타입 체크

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
