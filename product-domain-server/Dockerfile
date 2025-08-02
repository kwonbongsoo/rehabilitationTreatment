# 멀티 스테이지 빌드
FROM node:18-alpine AS dependencies

WORKDIR /app

COPY product-domain-server/package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS build

WORKDIR /app

COPY product-domain-server/package*.json ./
RUN npm ci

COPY product-domain-server/ .
RUN npm run build && npm run copy-data


FROM node:18-alpine AS production

WORKDIR /app

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# uploads 디렉토리 생성 및 권한 설정
RUN mkdir -p /app/uploads && chown -R nestjs:nodejs /app/uploads

USER nestjs

EXPOSE 3002

CMD ["npm", "run", "start:prod"]
