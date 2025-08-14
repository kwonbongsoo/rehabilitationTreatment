
# =========================================
# 공통 패키지 빌드 스테이지
# =========================================
FROM node:20-alpine AS common-builder
WORKDIR /common
COPY common/package*.json ./
RUN npm ci
COPY common/src ./src
COPY common/tsconfig.json ./
RUN npm run build

# =========================================
# 빌드 스테이지
# =========================================

# Node.js LTS 이미지 사용
FROM node:20-alpine AS builder

# 앱 디렉토리 생성
WORKDIR /app

COPY ecommerce-app/package*.json ./

RUN npm ci

# 빌드된 common 패키지를 node_modules에 복사
COPY --from=common-builder /common ./node_modules/@ecommerce/common

RUN rm -rf ./.next/cache

# Next.js 빌드에 필요한 소스만 복사
COPY ecommerce-app/public ./public
COPY ecommerce-app/src ./src
COPY ecommerce-app/next.config.ts ./
COPY ecommerce-app/tsconfig.json ./
COPY ecommerce-app/.env ./

# 빌드 시 환경변수 설정
ARG NEXT_PUBLIC_STATIC_URL=http://localhost:3000
ENV NEXT_PUBLIC_STATIC_URL=$NEXT_PUBLIC_STATIC_URL

# 빌드 (생략 가능, 필요시 추가)
RUN npm run build
# =========================================
# 실행 스테이지
# =========================================
FROM node:20-alpine AS run

WORKDIR /app

# 빌드된 파일 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Next.js 15의 standalone 모드에서 정적 파일을 올바른 위치에 복사
# Static files are already copied above to ./.next/static
COPY --from=builder /app/.next/static ./_next/static

# 빌드된 common 패키지를 복사 (runtime에서도 필요할 수 있음)
COPY --from=common-builder /common ./node_modules/@ecommerce/common

# 모니터링 메트릭 파일 복사
COPY monitoring/application-metrics/nextjs-metrics.js ./monitoring/

# 앱 실행 (포트는 실제 앱 포트에 맞게 수정)
EXPOSE 3000
CMD ["node", "server.js"]

# docker build -t front .
# docker run -p 3000:3000 --env-file .env front
