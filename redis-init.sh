#!/bin/sh
# Redis 초기화 스크립트

echo "Redis 연결 대기중..."
# Redis 연결 대기 (환경변수에서 비밀번호 사용)
until redis-cli -h redis -p 6379 -a "$REDIS_PASSWORD" ping > /dev/null 2>&1; do
  echo "Redis 연결 대기중..."
  sleep 2
done

echo "Redis 연결 성공! 초기 데이터 설정 시작..."

# 환경변수에서 토큰 정보 가져오기
if [ -n "$INIT_TOKEN_KEY" ] && [ -n "$INIT_TOKEN_VALUE" ]; then
  echo "초기 토큰 설정 중..."
  redis-cli -h redis -p 6379 -a "$REDIS_PASSWORD" SET "$INIT_TOKEN_KEY" "$INIT_TOKEN_VALUE"
  echo "토큰 설정 완료: $INIT_TOKEN_KEY"
else
  echo "초기 토큰 정보가 없습니다. INIT_TOKEN_KEY와 INIT_TOKEN_VALUE 환경변수를 확인하세요."
fi

echo "Redis 초기화 완료!"