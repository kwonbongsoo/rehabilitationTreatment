#!/bin/sh

# Kong initialization script
echo "Starting Kong initialization..."

# 환경 변수 확인 및 export
echo "Checking and exporting environment variables..."
if [ -z "$REDIS_URL" ] || [ -z "$REDIS_PORT" ] || [ -z "$REDIS_PASSWORD" ] || [ -z "$REDIS_DB" ] || [ -z "$IDEMPOTENCY_TTL" ] || [ -z "$JWT_SECRET" ] || [ -z "$MEMBER_SERVER_URL" ] || [ -z "$AUTH_SERVER_URL" ]; then
  echo "Error: Required environment variables are not set"
  exit 1
fi

# 환경 변수 export
export REDIS_URL
export REDIS_PORT
export REDIS_PASSWORD
export REDIS_DB
export IDEMPOTENCY_TTL
export JWT_SECRET
export MEMBER_SERVER_URL
export AUTH_SERVER_URL

# 환경 변수 값 이스케이프 처리
REDIS_URL_ESC=$(echo "$REDIS_URL" | sed 's/[\/&]/\\&/g')
REDIS_PASSWORD_ESC=$(echo "$REDIS_PASSWORD" | sed 's/[\/&]/\\&/g')
MEMBER_SERVER_URL_ESC=$(echo "$MEMBER_SERVER_URL" | sed 's/[\/&]/\\&/g')
AUTH_SERVER_URL_ESC=$(echo "$AUTH_SERVER_URL" | sed 's/[\/&]/\\&/g')

# Kong 설정 파일 생성
echo "Generating Kong configuration file..."
sed -e "s/\${REDIS_URL}/${REDIS_URL_ESC}/g; \
     s/\${REDIS_PORT}/${REDIS_PORT}/g; \
       s/\${REDIS_PASSWORD}/${REDIS_PASSWORD_ESC}/g; \
     s/\${REDIS_DB}/${REDIS_DB}/g; \
     s/\${IDEMPOTENCY_TTL}/${IDEMPOTENCY_TTL}/g; \
       s/\${JWT_SECRET}/${JWT_SECRET}/g; \
       s/\${MEMBER_SERVER_URL}/${MEMBER_SERVER_URL_ESC}/g; \
       s/\${AUTH_SERVER_URL}/${AUTH_SERVER_URL_ESC}/g" \
     /tmp/kong.yml.template > /tmp/kong.yml

echo "Kong configuration file generated successfully"
echo "Configuration content:"
cat /tmp/kong.yml
