#!/bin/sh

# Nginx initialization script
# Replace environment variables in nginx.conf.template using sed

echo "Initializing Nginx configuration..."

# Read the template file and replace environment variables
# Note: Using @ as delimiter to avoid conflicts with URLs containing /
sed "s@\${PROXY_CONNECT_TIMEOUT}@${PROXY_CONNECT_TIMEOUT}@g; \
     s@\${PROXY_SEND_TIMEOUT}@${PROXY_SEND_TIMEOUT}@g; \
     s@\${PROXY_READ_TIMEOUT}@${PROXY_READ_TIMEOUT}@g; \
     s@\${MEMBER_SERVICE_URL}@${MEMBER_SERVICE_URL}@g; \
     s@\${MEMBER_TIMEOUT}@${MEMBER_TIMEOUT}@g; \
     s@\${FRONTEND_URL}@${FRONTEND_URL}@g; \
     s@\${FRONTEND_TIMEOUT}@${FRONTEND_TIMEOUT}@g" \
     /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

echo "Nginx configuration file generated successfully"
echo "Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "Nginx configuration is valid"
else
    echo "Nginx configuration has errors"
    exit 1
fi
