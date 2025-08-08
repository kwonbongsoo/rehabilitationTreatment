##############################
# common 빌드 스테이지
##############################
FROM node:20-alpine AS common-builder
WORKDIR /common
COPY common/package*.json ./
RUN npm ci
COPY common/src ./src
COPY common/tsconfig.json ./
RUN npm run build

##############################
# 빌드 스테이지
##############################
FROM node:20-alpine AS build
WORKDIR /app

# bff-server 의존성 설치
COPY bff-server/package*.json ./
COPY bff-server/tsconfig.json ./
RUN npm ci

# 빌드된 common을 node_modules에 주입하여 @ecommerce/common 해소
COPY --from=common-builder /common ./node_modules/@ecommerce/common

# 소스 복사 및 빌드
COPY bff-server/src ./src
RUN npm run build

# 정적 데이터 복사(필요 시)
RUN mkdir -p ./dist/data && cp -r ./src/data ./dist/ || true

##############################
# 런타임 스테이지
##############################
FROM node:20-alpine
WORKDIR /app

# 런타임 의존성 설치
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev

# common 런타임 주입
COPY --from=common-builder /common ./node_modules/@ecommerce/common

# 앱 빌드 결과 복사
COPY --from=build /app/dist ./dist

EXPOSE 3001
CMD ["npm", "start"]
