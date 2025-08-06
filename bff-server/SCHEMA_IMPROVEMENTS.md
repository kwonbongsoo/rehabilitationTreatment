# BFF 서버 상품 등록 스키마 개선 사항

## 🎯 개선 목표
- **멀티파트 폼 데이터 400 에러 해결**
- **가독성 및 유지보수성 향상**

## 🔧 주요 변경사항

### 1. 스키마 최적화
#### 🔴 기존 문제점
```typescript
// ❌ 문제: JSON 스키마와 멀티파트 데이터 충돌
body: {
  type: 'object',
  properties: {
    images: {
      type: 'array',
      items: {
        type: 'string',
        format: 'binary', // ⚠️ 멀티파트에서 작동하지 않음
      },
    },
    // 🚨 필드가 너무 많아 검증 복잡성 증가
  },
  required: ['name', 'description', 'price', 'categoryId', 'sellerId'],
}
```

#### ✅ 개선된 해결책
```typescript
// ✅ 해결: 멀티파트 전용 스키마 단순화
schema: {
  tags: ['Products'],
  summary: '상품 등록',
  description: '상품 정보와 이미지를 함께 등록합니다. (multipart/form-data 전용)',
  consumes: ['multipart/form-data'],
  // 🎯 body 스키마 생략 - 컨트롤러에서 직접 검증
  response: { /* 응답 스키마만 정의 */ }
}
```

### 2. 컨트롤러 검증 로직 강화

#### 📊 계층별 검증 구조
```
1️⃣ 파일 레벨 검증
   ├── MIME 타입 (image/jpeg, png, gif, webp)
   ├── 파일 크기 (10MB 제한)
   └── 파일명 유효성

2️⃣ 데이터 파싱 검증
   ├── JSON 파싱 (productData 필드)
   ├── 타입 변환 (string → number, boolean)
   └── 옵션 데이터 파싱

3️⃣ 비즈니스 로직 검증
   ├── 필수 필드 존재 여부
   ├── 데이터 범위 및 형식
   └── 비즈니스 규칙 (가격 < 원가)
```

#### 🏗️ 개선된 아키텍처
```typescript
export class ProductController {
  // 🔧 상수 중앙화 관리
  private static readonly ALLOWED_MIME_TYPES = [/* ... */];
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024;
  private static readonly MAX_IMAGE_COUNT = 5;

  // 🔍 단계별 검증 메서드
  async parseProductData(request)      // 파싱 + 기본 검증
  async validateFileUpload(part)       // 파일 검증
  private normalizeProductData(data)   // 타입 정규화
  private validateRequiredFields(data) // 비즈니스 검증
}
```

### 3. 에러 처리 개선

#### 🚨 기존 문제점
```typescript
// ❌ 단순한 에러 처리
return reply.status(500).send({
  error: { message: error.message }
});
```

#### ✅ 개선된 에러 처리
```typescript
// ✅ 지능적 에러 분류 및 상태 코드
private determineStatusCode(error: any): number {
  const message = error.message?.toLowerCase() || '';

  if (message.includes('필수') || message.includes('검증')) return 400;
  if (message.includes('인증')) return 401;
  if (message.includes('찾을 수 없')) return 404;
  // ...더 정교한 분류
}

// 📊 구조화된 로깅
request.log.error({
  operation,
  error: { message, stack, statusCode },
  requestInfo: { method, url, userAgent }
}, `${operation} 실패`);
```

## 📋 검증 규칙 상세

### 파일 검증
- **MIME 타입**: `image/jpeg`, `image/jpg`, `image/png`, `image/gif`, `image/webp`
- **파일 크기**: 최대 10MB
- **파일 개수**: 최대 5개
- **파일명**: 빈 값 또는 공백 불허

### 데이터 검증
- **상품명**: 필수, 최대 200자
- **상품 설명**: 필수, 최대 2000자
- **가격/원가**: 양수, 가격 ≤ 원가
- **카테고리 ID**: 양의 정수
- **할인율**: 0-100% 범위
- **재고/무게**: 0 이상

## 🎨 베스트 프랙티스 적용

### 1. SOLID 원칙
- **단일 책임**: 각 메서드가 하나의 검증 책임만 담당
- **개방/폐쇄**: 새로운 검증 규칙 추가 시 기존 코드 수정 불필요
- **의존성 역전**: 추상화에 의존하는 에러 처리

### 2. 가독성 개선
```typescript
// 🔧 상수 중앙화
private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024;

// 📝 JSDoc 문서화
/**
 * 멀티파트 요청에서 상품 데이터 파싱 및 검증
 * @description multipart/form-data 요청을 파싱하여...
 * @param request - multipart/form-data 형식의 Fastify 요청
 * @returns 파싱되고 검증된 상품 생성 요청 데이터
 * @throws {Error} 검증 실패 시
 */
```

### 3. 타입 안전성
```typescript
// 🔒 readonly 상수로 타입 안전성 확보
private static readonly ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png' // ...
] as const;

// 🎯 명시적 타입 정의
private parseNumber(value: any, fieldName: string): number
private normalizeProductData(data: any): CreateProductRequest
```

## ⚡ 성능 개선사항

### 1. 조기 검증 (Fail Fast)
- 파일 타입 검증을 먼저 수행하여 불필요한 처리 방지
- JSON 파싱 전 기본 구조 검증

### 2. 메모리 효율성
- 스트림 기반 파일 처리
- 불필요한 중간 객체 생성 최소화

### 3. 에러 응답 최적화
- 구조화된 에러 응답으로 클라이언트 처리 효율성 향상
- 운영/개발 환경별 에러 메시지 차등 제공

## 🧪 테스트 시나리오

### 성공 케이스
- [x] 정상적인 상품 데이터 + 이미지 파일 업로드
- [x] 옵션 포함 상품 등록
- [x] 최대 5개 이미지 업로드

### 실패 케이스
- [x] 지원하지 않는 파일 형식 (400)
- [x] 파일 크기 초과 (400)
- [x] 필수 필드 누락 (400)
- [x] JSON 파싱 오류 (400)
- [x] 비즈니스 규칙 위반 (400)

## 🚀 배포 후 기대 효과

### 1. 안정성 향상
- 400 에러 해결로 상품 등록 성공률 향상
- 예외 상황에 대한 견고한 처리

### 2. 개발 생산성
- 명확한 에러 메시지로 디버깅 시간 단축
- 문서화된 API로 프론트엔드 개발 효율성 증대

### 3. 유지보수성
- 모듈화된 검증 로직으로 기능 추가/수정 용이
- 상수 중앙화로 설정 변경 간소화

---

**작성일**: 2024-08-06
**버전**: 2.0.0
