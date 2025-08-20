# Bun 프록시 서버 Dockerfile
FROM oven/bun:1-alpine

# 헬스체크용 도구 설치
RUN apk add --no-cache curl wget

# 성능 최적화를 위한 환경 변수
ENV BUN_ENV=production
ENV NODE_ENV=production

WORKDIR /app

# 패키지 파일들 복사
COPY proxy-server/package.json ./

# 의존성 설치 및 캐시 최적화
RUN bun install --production --frozen-lockfile || bun install --production

# 소스 코드 복사 (공통 에러 모듈 포함)
COPY proxy-server/src ./src

# 모니터링 메트릭 파일 복사
COPY monitoring/application-metrics/bun-proxy-metrics.js ./monitoring/

# 포트 노출
EXPOSE 9000

# 헬스체크 추가 (컨테이너 준비 상태 확인) - 더 관대한 설정
HEALTHCHECK --interval=15s --timeout=10s --start-period=30s --retries=5 \
  CMD curl -f --connect-timeout 5 --max-time 8 http://localhost:9000/ || wget -q --timeout=8 -O /dev/null http://localhost:9000/ || exit 1

# 서버 실행 (성능 최적화 플래그)
CMD ["bun", "--smol", "run", "src/index.ts"]
