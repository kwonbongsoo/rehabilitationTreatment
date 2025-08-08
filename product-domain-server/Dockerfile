# =========================================
# 공통 패키지 빌드 스테이지
# =========================================
FROM node:18-alpine AS common-builder
WORKDIR /common
COPY common/package*.json ./
RUN npm ci
COPY common/src ./src
COPY common/tsconfig.json ./
RUN npm run build

# =========================================
# 빌드 스테이지
# =========================================
FROM node:18-alpine AS build
WORKDIR /app

# product-domain-server 의존성 설치
COPY product-domain-server/package*.json ./
RUN npm ci

# 빌드된 common 패키지를 node_modules에 복사
COPY --from=common-builder /common ./node_modules/@ecommerce/common

# 애플리케이션 소스 복사 및 빌드
COPY product-domain-server/ .
RUN npm run build && npm run copy-data


# =========================================
# 실행 스테이지
# =========================================
FROM node:18-alpine AS production
WORKDIR /app

RUN addgroup -g 1001 -S nodejs \
  && adduser -S nestjs -u 1001

# 런타임 의존성 설치
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev

# 빌드된 common 패키지를 복사 (런타임에서도 사용 가능하도록)
COPY --from=common-builder /common ./node_modules/@ecommerce/common

# 애플리케이션 빌드 결과 복사
COPY --from=build /app/dist ./dist

# 업로드 디렉토리 권한 설정
RUN mkdir -p /app/uploads && chown -R nestjs:nodejs /app/uploads

USER nestjs

EXPOSE 3002

CMD ["npm", "run", "start:prod"]
