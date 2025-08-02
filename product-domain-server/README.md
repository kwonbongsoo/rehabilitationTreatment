# Product Domain Server

E-Commerce 플랫폼의 상품 도메인 마이크로서비스 - NestJS 기반의 상품 및 카테고리 관리 API

## 🚀 주요 기능

- **상품 관리**: CRUD 작업, 검색, 필터링, 정렬, 페이지네이션
- **카테고리 관리**: 8개 기본 카테고리 (의류, 신발, 가방, 액세서리, 뷰티, 홈리빙, 디지털, 스포츠)
- **이미지 업로드**: AWS S3 연동 다중 이미지 업로드 및 관리
- **상품 옵션**: 색상, 사이즈 등 다양한 옵션 관리 (다대다 관계)
- **데이터 초기화**: 컨테이너 시작 시 초기 데이터 자동 생성
- **API 문서화**: Swagger UI 제공
- **마이크로서비스 연동**: BFF 서버 및 Kong Gateway 연동

## 📋 데이터베이스 스키마

### Categories (카테고리)
- id, name, slug, iconCode, isActive
- **제거된 필드**: description (개발 중 불필요로 판단되어 제거)

### Products (상품)
- id, name, description, price, originalPrice, categoryId
- rating, reviewCount, isNew, isFeatured, discount
- stock, sku, weight, dimensions, specifications

### Product Options (상품 옵션)
- id, productId, optionType, optionName, optionValue
- additionalPrice, stock, sku, sortOrder

### Product Images (상품 이미지)
- id, productId, imageUrl, thumbnailUrl, altText
- isMain, sortOrder, fileName, fileSize, dimensions

## 🛠️ 기술 스택

- **Framework**: NestJS + TypeScript
- **Database**: PostgreSQL (독립 데이터베이스) + TypeORM
- **File Storage**: AWS S3
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker + Docker Compose
- **Architecture**: Clean Architecture + Domain-Driven Design

## 📦 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.template`를 참조하여 `.env` 파일 생성

```bash
cp .env.template .env
```

### 3. 데이터베이스 설정
PostgreSQL 데이터베이스 생성 및 연결 설정

### 4. 개발 서버 실행
```bash
# 개발 모드
npm run start:dev

# 프로덕션 빌드
npm run build
npm run start:prod
```

### 5. Docker로 실행
```bash
# 전체 E-Commerce 플랫폼 실행 (권장)
cd .. # 루트 디렉토리로 이동
docker-compose up --build

# 개별 상품 서버만 실행
docker build -t product-domain-server .
docker run -p 3002:3002 product-domain-server
```

### 6. 초기 데이터 확인
```bash
# 카테고리 목록 확인
curl http://localhost:3002/api/v1/categories

# 상품 목록 확인 (페이지네이션)
curl "http://localhost:3002/api/v1/products?page=1&limit=10"
```

## 📚 API 문서

서버 실행 후 다음 주소에서 API 문서 확인:
- Swagger UI: http://localhost:3002/api-docs
- JSON: http://localhost:3002/api-docs-json

## 🌐 API 엔드포인트

### Categories
- `GET /api/v1/categories` - 카테고리 목록
- `POST /api/v1/categories` - 카테고리 생성
- `GET /api/v1/categories/:id` - 카테고리 상세
- `GET /api/v1/categories/slug/:slug` - 슬러그로 조회
- `PATCH /api/v1/categories/:id` - 카테고리 수정
- `DELETE /api/v1/categories/:id` - 카테고리 삭제

### Products
- `GET /api/v1/products` - 상품 목록 (검색, 필터링 지원)
- `POST /api/v1/products` - 상품 생성
- `GET /api/v1/products/:id` - 상품 상세
- `PATCH /api/v1/products/:id` - 상품 수정
- `DELETE /api/v1/products/:id` - 상품 삭제
- `POST /api/v1/products/:id/images` - 이미지 업로드
- `DELETE /api/v1/products/:productId/images/:imageId` - 이미지 삭제

## 🔍 검색 및 필터링

상품 목록 API는 다음 쿼리 파라미터를 지원합니다:

- `page`, `limit` - 페이지네이션
- `search` - 상품명/설명 검색
- `categoryId` - 카테고리별 필터링
- `minPrice`, `maxPrice` - 가격 범위
- `isNew`, `isFeatured` - 신상품, 추천상품 필터
- `tags` - 태그별 필터링
- `sortBy`, `sortOrder` - 정렬 (가격, 이름, 평점, 생성일)

예시:
```
GET /api/v1/products?search=티셔츠&categoryId=1&minPrice=10000&maxPrice=50000&sortBy=price&sortOrder=ASC
```

## 🖼️ 이미지 업로드

### S3 설정 요구사항
- AWS 계정 및 S3 버킷
- IAM 사용자 액세스 키
- 버킷 정책 설정

### 지원 파일 형식
- JPG, JPEG, PNG, WebP, GIF
- 최대 파일 크기: 5MB

## 🔧 개발 가이드

### 마이그레이션
```bash
# 마이그레이션 생성
npm run typeorm:generate-migration

# 마이그레이션 실행
npm run typeorm:run-migrations

# 마이그레이션 되돌리기
npm run typeorm:revert-migration
```

### 테스트
```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov
```

### 코드 품질
```bash
# 린팅
npm run lint

# 포맷팅
npm run format
```

## 🚀 배포

### Docker를 이용한 배포
```bash
# 프로덕션 이미지 빌드
docker build -t product-domain-server:latest .

# 컨테이너 실행
docker run -d \
  --name product-server \
  -p 3002:3002 \
  --env-file .env \
  product-domain-server:latest
```

### 환경별 설정
- Development: `.env`
- Production: 환경 변수 또는 `.env.production`

## 🔐 보안 고려사항

- 환경 변수로 민감 정보 관리
- AWS IAM 권한 최소화
- CORS 설정
- 파일 업로드 검증
- SQL Injection 방어 (TypeORM)

## 🏗️ 아키텍처 특징

### 마이크로서비스 아키텍처
- **독립 데이터베이스**: 자체 PostgreSQL 데이터베이스로 완전한 데이터 격리
- **포트 3002**: 다른 서비스와 충돌 없는 독립적 포트 사용
- **Kong Gateway 연동**: API Gateway를 통한 중앙집중식 라우팅
- **BFF 패턴**: Backend for Frontend 서버를 통한 UI 최적화 데이터 제공

### 개발 환경 최적화
- **컨테이너 재시작 시 데이터 초기화**: 개발/테스트 환경에서 깨끗한 상태 보장
- **자동 초기 데이터 생성**: 8개 카테고리, 12개 상품 자동 생성
- **No Volume 설정**: Docker 볼륨 없이 컨테이너 내부 데이터만 사용

### 데이터 관리
- **카테고리**: 의류(6개), 신발(3개), 가방(1개), 액세서리(2개), 나머지는 빈 카테고리
- **상품**: 실제 이커머스 데이터와 유사한 테스트 데이터
- **이미지**: S3 연동으로 실제 상품 이미지 관리 가능

## 🔄 최근 업데이트

### v1.0.0 (2025-08-02)
- ✅ NestJS 기반 상품 도메인 서버 구축
- ✅ TypeORM + PostgreSQL 독립 데이터베이스 연동
- ✅ 카테고리 및 상품 CRUD API 구현
- ✅ S3 이미지 업로드 서비스 통합
- ✅ BFF 서버 연동 및 Kong Gateway 라우팅 설정
- ✅ Docker Compose 통합 및 컨테이너화
- ✅ 초기 데이터 자동 생성 로직 구현
- ✅ 카테고리 엔티티 최적화 (description 필드 제거)

## 📝 라이선스

MIT License