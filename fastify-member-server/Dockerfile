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

# 시작 스크립트 추가
COPY fastify-member-server/entrypoint.sh ./
COPY fastify-member-server/package*.json ./
COPY fastify-member-server/prisma ./prisma

RUN npm ci

# 빌드된 common 패키지를 node_modules에 복사
COPY --from=common-builder /common ./node_modules/@ecommerce/common

COPY fastify-member-server/src ./src
COPY fastify-member-server/tsconfig.json ./
RUN npm run build

# =========================================
# 실행 스테이지 
# =========================================
FROM node:20-alpine

WORKDIR /app

# 먼저 package.json과 의존성 설치
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/tsconfig.json ./
COPY --from=build /app/entrypoint.sh ./

RUN npm ci --omit=dev

# 빌드된 common 패키지를 복사
COPY --from=common-builder /common ./node_modules/@ecommerce/common

# 애플리케이션 코드 복사
COPY --from=build /app/dist ./dist

# 모니터링 메트릭 파일 복사
COPY monitoring/application-metrics/fastify-metrics.mjs ./monitoring/

RUN npm run postinstall

RUN chmod +x /app/entrypoint.sh

# 파일 소유권을 node 사용자로 변경
RUN chown -R node:node /app

USER node
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://localhost:5000/api/members/health || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "dist/server.js"]

# docker build -t fastify-member-server .
# docker run -p 5000:5000 --env-file .env fastify-member-server

# npm run build
# npm start

# npx ts-node-dev src/app.ts