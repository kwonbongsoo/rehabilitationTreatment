#!/bin/sh

# Kong initialization script
# Replace environment variables in kong.yml.template using sed

echo "Initializing Kong configuration..."

# Read the template file and replace environment variables
sed "s/\${KONG_LOG_LEVEL}/${KONG_LOG_LEVEL}/g; \
     s/\${KONG_PROXY_LISTEN}/${KONG_PROXY_LISTEN}/g; \
     s/\${REDIS_URL}/${REDIS_URL}/g; \
     s/\${REDIS_PORT}/${REDIS_PORT}/g; \
     s/\${REDIS_PASSWORD}/${REDIS_PASSWORD}/g; \
     s/\${REDIS_DB}/${REDIS_DB}/g; \
     s/\${IDEMPOTENCY_TTL}/${IDEMPOTENCY_TTL}/g; \
     s/\${JWT_SECRET}/${JWT_SECRET}/g" \
     /tmp/kong.yml.template > /tmp/kong.yml

echo "Kong configuration file generated successfully"
echo "Configuration content:"
cat /tmp/kong.yml