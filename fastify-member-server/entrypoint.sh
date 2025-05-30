#!/bin/sh
set -e

echo "Waiting for PostgreSQL to start..."
# PostgreSQL 서버 준비까지 대기
sleep 5
echo "Checking database connection..."

# 연결 확인 (5번 시도)
for i in 1 2 3 4 5; do
  if echo "SELECT 1" | npx prisma db execute --schema=./prisma/schema.prisma --stdin > /dev/null 2>&1; then
    echo "Database connection successful!"
    break
  fi
  echo "Database connection attempt $i failed, retrying..."
  sleep 2
  if [ $i -eq 5 ]; then
    echo "Could not connect to database after 5 attempts"
    exit 1
  fi
done

echo "=========================================="
echo "RESETTING DATABASE TABLES..."
echo "=========================================="
# 강제로 데이터베이스 초기화 (테이블 삭제 후 재생성)
npx prisma db push --force-reset

echo "=========================================="
echo "DATABASE RESET COMPLETE"
echo "=========================================="

echo "Starting application..."
exec "$@"