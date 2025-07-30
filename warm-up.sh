#!/bin/bash

# Kong API Gateway Cache Warm-up Script
echo "Starting Kong Redis cache warm-up..."

# Kong Gateway URL (Docker 환경에서는 컨테이너 이름 사용)
KONG_URL="${KONG_GATEWAY_URL:-http://kong:8000}"
CACHE_ENDPOINTS="/api/home /api/categories"
WARM_UP_INTERVAL=270  # 4분 30초 (270초)

# PID 파일 경로
PID_FILE="/tmp/kong-cache-warmup.pid"

# 시그널 핸들러 - 스크립트 종료 시 정리
cleanup() {
    echo "Stopping cache warm-up..."
    rm -f "$PID_FILE"
    exit 0
}

# SIGTERM, SIGINT 시그널 처리
trap cleanup SIGTERM SIGINT

# 이미 실행 중인 프로세스 체크
if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "Cache warm-up is already running (PID: $(cat "$PID_FILE"))"
    exit 1
fi

# PIG 파일에 현재 프로세스 ID 저장
echo $$ > "$PID_FILE"

# 초기 Kong Health Check
echo "Checking Kong health..."
until curl -f "$KONG_URL/health" > /dev/null 2>&1; do
  echo "Waiting for Kong..."
  sleep 5
done
echo "✓ Kong is healthy!"

# 캐시 웜업 함수
warm_up_cache() {
    local endpoint=$1
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo "[$timestamp] Warming up cache for: $endpoint"
    
    # 캐시 웜업 요청 (토큰 + 캐시 강제 갱신 헤더 포함)
    local status_code=$(curl -s -w "%{http_code}" -o /dev/null \
        -H "Authorization: Bearer ${TEST_TOKEN}" \
        -H "X-Cache-Refresh: true" \
        "$KONG_URL$endpoint" 2>/dev/null)
    
    if [ "$status_code" = "200" ]; then
        echo "  ✓ Cache warmed up successfully (HTTP $status_code)"
    else
        echo "  ⚠ Failed to warm up $endpoint (HTTP $status_code)"
    fi
}

# 메인 웜업 루프
echo "Starting cache warm-up loop (interval: ${WARM_UP_INTERVAL}s)..."
echo "Warming up endpoints: ${CACHE_ENDPOINTS}"
echo "Press Ctrl+C to stop"

while true; do
    # 각 엔드포인트에 대해 캐시 웜업 실행
    for endpoint in $CACHE_ENDPOINTS; do
        warm_up_cache "$endpoint"
        sleep 2  # 요청 간 간격
    done
    
    echo "Next warm-up in ${WARM_UP_INTERVAL} seconds..."
    sleep "$WARM_UP_INTERVAL"
done