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

### 테스트 환경
- **Jest**: JavaScript 테스트 프레임워크
- **React Testing Library**: React 컴포넌트 테스트
- **User Event**: 사용자 상호작용 테스트

### 테스트 실행

```bash
# 모든 테스트 실행
npm test

# 테스트 감시 모드 (개발 중 사용)
npm run test:watch

# 테스트 커버리지 생성
npm run test:coverage

# CI 환경에서 테스트 실행
npm run test:ci
```

### 테스트 커버리지 목표
- 브랜치: 80%
- 함수: 80%
- 라인: 80%
- 문장: 80%

### 테스트된 컴포넌트 및 기능

#### 공통 컴포넌트
- ✅ **Button**: 모든 변형, 상태, 이벤트 테스트
- ✅ **IconButton**: 아이콘 버튼 전용 테스트

#### 인증 관련
- ✅ **LoginForm**: 폼 검증, 제출, 상태 관리 테스트

#### 장바구니 기능
- ✅ **useCartActions**: 장바구니 액션 모든 기능 테스트

#### 유틸리티
- ✅ **validation**: 모든 검증 함수 테스트

### 테스트 작성 가이드

#### 1. 컴포넌트 테스트
```typescript
// 기본 렌더링 테스트
it('컴포넌트가 올바르게 렌더링된다', () => {
  render(<Component />)
  expect(screen.getByRole('button')).toBeInTheDocument()
})

// 사용자 상호작용 테스트
it('버튼 클릭 시 함수가 호출된다', async () => {
  const user = userEvent.setup()
  const handleClick = jest.fn()

  render(<Component onClick={handleClick} />)
  await user.click(screen.getByRole('button'))

  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

#### 2. 훅 테스트
```typescript
import { renderHook, act } from '@testing-library/react'

it('훅이 올바르게 동작한다', () => {
  const { result } = renderHook(() => useCustomHook())

  act(() => {
    result.current.action()
  })

  expect(result.current.state).toBe('expected')
})
```

#### 3. 유틸리티 함수 테스트
```typescript
it('함수가 올바른 결과를 반환한다', () => {
  const result = utilityFunction(input)
  expect(result).toBe(expectedOutput)
})
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
