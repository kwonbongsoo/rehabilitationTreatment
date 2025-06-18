ㅇㅇ# 서비스 및 유틸리티 리팩토링 가이드

## 📋 개요

이커머스 앱의 서비스와 유틸리티를 클린 아키텍처 원칙에 따라 재구성했습니다.

## 🏗️ 새로운 구조

### 서비스 계층 (`src/services/`)

```
services/
├── index.ts                           # 통합 export 파일
├── domain/                           # 도메인 계층 (순수 비즈니스 로직)
│   ├── authDomainService.ts         # 인증 도메인 서비스
│   └── memberDomainService.ts       # 회원 도메인 서비스
├── application/                      # 애플리케이션 계층 (유스케이스)
│   └── validationService.ts         # 검증 서비스 (폼 검증 통합)
├── infrastructure/                   # 인프라 계층 (외부 시스템 연동)
│   ├── cookieService.ts             # 쿠키 관리 서비스
│   └── tokenService.ts              # 토큰 관리 서비스
└── uiConfigurationService.ts        # UI 설정 서비스 (기존 유지)
```

### 유틸리티 계층 (`src/utils/`)

```
utils/
├── index.ts                         # 통합 export 파일
├── validation.ts                    # 검증 유틸리티 (클래스 기반)
├── errorHandling.ts                 # 에러 처리 유틸리티
├── notifications.ts                 # 알림 관리 유틸리티
├── formatters.ts                    # 포맷팅 유틸리티
├── productUtils.ts                  # 상품 관련 유틸리티 (기존 유지)
├── proxyErrors.ts                   # 프록시 에러 유틸리티 (기존 유지)
├── proxyTester.ts                   # 프록시 테스터 (기존 유지)
└── proxyUtils.ts                    # 프록시 유틸리티 (기존 유지)
```

## 🔄 주요 변경사항

### 1. 서비스 통합 및 분리

- ✅ `authDomainService` + `registerDomainService` → 도메인별 분리
- ✅ `cookieService` + `authCookieUtils` → 하나의 인프라 서비스로 통합
- ✅ 검증 로직 → 애플리케이션 서비스로 중앙화

### 2. 계층 분리

- **Domain Layer**: 순수 비즈니스 규칙 (외부 의존성 없음)
- **Application Layer**: 유스케이스 및 애플리케이션 로직
- **Infrastructure Layer**: 외부 시스템 연동 (쿠키, 토큰, HTTP 등)

### 3. 중복된 기능 제거

- 쿠키 관리 로직 통합
- 검증 로직 중앙화
- 에러 처리 표준화

## 📚 마이그레이션 가이드

### 기존 코드 → 새로운 구조

#### 1. 서비스 Import 변경

**Before:**

```typescript
import { authDomainService } from '@/services/authDomainService';
import { cookieService } from '@/services/cookieService';
import { tokenService } from '@/services/tokenService';
```

**After:**

```typescript
// 개별 import
import { authDomainService } from '@/services/domain/authDomainService';
import { cookieService } from '@/services/infrastructure/cookieService';
import { tokenService } from '@/services/infrastructure/tokenService';

// 또는 통합 import
import { authDomainService, cookieService, tokenService } from '@/services';
```

#### 2. 검증 로직 변경

**Before:**

```typescript
import { authDomainService } from '@/services/authDomainService';

// 각 서비스에서 개별적으로 검증
authDomainService.validateLoginCredentials(credentials);
```

**After:**

```typescript
import { validationService } from '@/services/application/validationService';

// 중앙화된 검증 서비스 사용
validationService.validateLoginCredentials(credentials);
```

#### 3. 쿠키 관련 기능 통합

**Before:**

```typescript
import { setAuthCookies, clearAuthCookies } from '@/utils/authCookieUtils';
import { cookieService } from '@/services/cookieService';
```

**After:**

```typescript
import { cookieService } from '@/services/infrastructure/cookieService';
// 또는
import { setAuthCookies, clearAuthCookies } from '@/services';

// 모든 쿠키 관련 기능이 하나의 서비스에 통합됨
```

## 🎯 사용 예시

### 1. 로그인 검증

```typescript
import { validationService } from '@/services';

const handleLogin = (formData: LoginFormData) => {
  const result = validationService.validateLoginCredentials(formData);

  if (!result.isValid) {
    // 에러 처리
    console.log(result.errors);
    return;
  }

  // 로그인 진행
};
```

### 2. 회원가입 검증

```typescript
import { validationService, memberDomainService } from '@/services';

const handleRegister = (formData: RegisterFormData) => {
  // 폼 검증
  const validationResult = validationService.validateRegisterForm(formData);
  validationService.throwIfInvalid(validationResult);

  // 비밀번호 강도 확인
  const strength = memberDomainService.evaluatePasswordStrength(formData.password);

  // 회원가입 진행
};
```

### 3. 쿠키 관리

```typescript
import { cookieService } from '@/services';

// API 라우트에서 쿠키 설정
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const result = cookieService.setAuthCookies(res, tokenData);

  if (result.success) {
    res.json({ message: '로그인 성공' });
  }
}

// 클라이언트에서 토큰 조회
const token = cookieService.getToken();
const userRole = cookieService.getUserRole();
```

### 4. 에러 처리 및 알림

```typescript
import { ErrorHandler, NotificationManager } from '@/utils';

const handleApiError = (error: unknown) => {
  const standardError = ErrorHandler.handle(error, { context: 'API 호출' });
  NotificationManager.showError(standardError.message);
};
```

## 🔧 개발자 도구

### 계층별 서비스 그룹 사용

```typescript
import { DomainServices, ApplicationServices, InfrastructureServices } from '@/services';

// 도메인 로직
DomainServices.auth.isAuthenticated(user, token);
DomainServices.member.evaluatePasswordStrength(password);

// 애플리케이션 로직
ApplicationServices.validation.validateLoginCredentials(data);

// 인프라 로직
InfrastructureServices.cookie.setAuthCookies(res, tokenData);
InfrastructureServices.token.issueGuestTokenWithCookie(res);
```

### 카테고리별 유틸리티 그룹 사용

```typescript
import { ValidatorUtils, ErrorUtils, NotificationUtils, FormatUtils } from '@/utils';

// 검증
ValidatorUtils.EmailValidator.validate(email);

// 에러 처리
ErrorUtils.ErrorHandler.handle(error);

// 알림
NotificationUtils.NotificationManager.showSuccess('성공!');

// 포맷팅
FormatUtils.formatPrice(10000);
```

## 🚀 장점

1. **명확한 책임 분리**: 각 계층이 명확한 역할을 가짐
2. **중복 코드 제거**: 유사한 기능들이 하나로 통합됨
3. **테스트 용이성**: 계층별로 독립적인 테스트 가능
4. **유지보수성 향상**: 기능별로 코드 위치가 명확함
5. **확장성**: 새로운 기능 추가 시 적절한 계층에 배치 가능

## ⚠️ 주의사항

1. **Import 경로 변경**: 기존 import 경로를 새로운 구조에 맞게 수정 필요
2. **의존성 방향**: 상위 계층이 하위 계층에만 의존하도록 주의
3. **도메인 순수성**: 도메인 서비스에서 외부 라이브러리 의존성 최소화
4. **기존 코드 호환성**: 하위 호환성을 위한 레거시 export 함수들 활용

## 🔜 향후 계획

1. **테스트 코드 업데이트**: 새로운 구조에 맞는 단위/통합 테스트 작성
2. **타입 안전성 강화**: 더 엄격한 타입 정의 및 검증
3. **의존성 주입**: 서비스 간 의존성을 더 유연하게 관리
4. **모니터링**: 각 계층별 성능 및 에러 모니터링 추가
