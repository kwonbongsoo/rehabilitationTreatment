# Bun 프록시 서버 Dockerfile
FROM oven/bun:1-alpine

WORKDIR /app

# 패키지 파일들 복사
COPY proxy-server/package.json ./

# 의존성 설치 (bun.lock이 없으므로 새로 생성됨)
RUN bun install

# 소스 코드 복사 (공통 에러 모듈 포함)
COPY proxy-server/src ./src

# 포트 노출
EXPOSE 9000

# 서버 실행
CMD ["bun", "run", "src/index.ts"]
