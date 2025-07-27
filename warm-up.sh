#!/bin/bash

# Kong API Gateway Warm-up Script
echo "Starting Kong health check warm-up..."

# Kong Gateway URL (Docker 환경에서는 컨테이너 이름 사용)
KONG_URL="${KONG_GATEWAY_URL:-http://kong:8000}"

# Initial wait
sleep 2

# Kong Health Check
until curl -f "$KONG_URL/health" > /dev/null 2>&1; do
  echo "Waiting for Kong..."
  sleep 2
done
echo "✓ Kong health check completed!"

# Test Kong → Auth call (no token required)
echo "Testing Kong → Auth call..."
curl -s -o /dev/null -w "Time: %{time_total}s\n" "$KONG_URL/api/auth/health" && echo "✓ Kong auth endpoint completed" || echo "⚠ Kong auth endpoint failed"

# Test Kong → Members call with token
echo "Testing Kong → Members call..."
curl -s -o /dev/null -w "Time: %{time_total}s\n" "$KONG_URL/api/members/health" -H "Authorization: Bearer ${TEST_TOKEN}" && echo "✓ Kong members endpoint completed" || echo "⚠ Kong members endpoint failed"

# Test Kong → BFF call with token
echo "Testing Kong → BFF call..."
curl -s -o /dev/null -w "Time: %{time_total}s\n" "$KONG_URL/api/home" -H "Authorization: Bearer ${TEST_TOKEN}" && echo "✓ Kong BFF endpoint completed" || echo "⚠ Kong BFF endpoint failed"

echo "✓ All warm-up completed!"
