# 이커머스 앱 (E-Commerce App)

Next.js 14 기반의 이커머스 웹 애플리케이션입니다.

## 주요 기능

### 쇼핑
- 상품 검색 및 필터링
- 장바구니 관리
- 위시리스트
- 주문 및 결제
- 리뷰 시스템

### 마케팅
- 프로모션 관리
- 베스트셀러
- 신상품
- 컬렉션

### 보안
- JWT 기반 인증
- 보안 강화된 쿠키 처리
- CSRF 방어
- XSS 방어

## 기술 스택

- Next.js 14 (App Router)
- TypeScript
- Zustand (상태 관리)
- React Query (서버 상태)
- CSS Modules

## 도메인 구조

```
src/domains/
├── auth/           # 인증 관련
├── cart/           # 장바구니
├── category/       # 카테고리
├── content/        # 컨텐츠
├── order/          # 주문
├── product/        # 상품
├── promotion/      # 프로모션
├── user/           # 사용자
└── wishlist/       # 위시리스트
```

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

- `NEXT_PUBLIC_API_URL`: API 서버 URL
- `NEXT_PUBLIC_ASSET_URL`: 에셋 서버 URL
- `AUTH_SECRET`: 인증 시크릿
- `NEXTAUTH_URL`: NextAuth URL

## 테스트

```bash
# 단위 테스트
npm test

# E2E 테스트
npm run test:e2e
```

## 프로젝트 구조

```
src/
├── api/              # API 클라이언트
├── app/              # Next.js 페이지
├── components/       # 공통 컴포넌트
├── domains/          # 도메인별 로직
├── hooks/            # 공통 훅
├── providers/        # 컨텍스트 제공자
├── services/         # 서비스
├── store/            # 전역 상태
├── styles/           # 스타일
├── types/            # 타입 정의
└── utils/            # 유틸리티
```

## 스타일 가이드

### CSS 모듈
- BEM 네이밍 규칙 준수
- 반응형 디자인
- 다크 모드 지원

### 컴포넌트
- Atomic Design 패턴
- Props 타입 정의
- 에러 바운더리 적용

## 브라우저 지원

- Chrome (최신 2개 버전)
- Firefox (최신 2개 버전)
- Safari (최신 2개 버전)
- Edge (최신 2개 버전)

## 성능 최적화

- 이미지 최적화
- 코드 스플리팅
- SSR/SSG 활용
- 캐시 전략
