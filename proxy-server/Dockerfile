# Bun 프록시 서버 Dockerfile
FROM oven/bun:1-alpine

WORKDIR /app

# 패키지 파일들 복사
COPY package.json ./

# 의존성 설치
RUN bun install --frozen-lockfile

# 소스 코드 복사
COPY src ./src

# 포트 노출
EXPOSE 9000

# 서버 실행
CMD ["bun", "run", "src/index.ts"]