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
FROM node:20-alpine AS build
WORKDIR /app

COPY koa-auth-server/package*.json ./
RUN npm ci

# 빌드된 common 패키지를 node_modules에 복사
COPY --from=common-builder /common ./node_modules/@ecommerce/common

COPY koa-auth-server/src ./src
COPY koa-auth-server/tsconfig.json ./
RUN npm run build

# =========================================
# 실행 스테이지 
# =========================================
FROM node:20-alpine
WORKDIR /app

# 먼저 package.json과 의존성 설치
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev

# 빌드된 common 패키지를 복사
COPY --from=common-builder /common ./node_modules/@ecommerce/common

# 애플리케이션 코드 복사
COPY --from=build /app/dist ./dist

USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://localhost:4000/api/auth/health || exit 1

CMD ["node", "dist/server.js"]


# docker build -t koa-auth-server .
# docker run -p 4000:4000 --env-file .env koa-auth-server