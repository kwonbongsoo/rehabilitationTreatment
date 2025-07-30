#!/bin/bash

# Bun 프록시 서버 개발 스크립트
echo "🚀 Starting Bun Proxy Server in Docker..."

# 기존 컨테이너 정리
echo "🧹 Cleaning up existing containers..."
docker-compose down proxy-server

# 개발 모드로 실행
echo "🔧 Building and starting proxy server..."
docker-compose up proxy-server ecommerce-app --build

echo "✨ Proxy server should be running on http://localhost:9000"