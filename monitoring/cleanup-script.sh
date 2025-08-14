#!/bin/bash

# Docker Desktop OverlayFS 최적화 정리 스크립트
# Windows/macOS에서 정기적으로 실행하여 성능 최적화

echo "=== Docker Desktop OverlayFS 최적화 정리 시작 ==="
echo "시작 시간: $(date)"

# 현재 디스크 사용량 확인
echo ""
echo "=== 현재 Docker 시스템 상태 ==="
docker system df

# 실행 중인 컨테이너 정보
echo ""
echo "=== 실행 중인 컨테이너 ==="
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "=== 정리 작업 시작 ==="

# 1. 중지된 컨테이너 정리 (24시간 이전)
echo "1. 중지된 컨테이너 정리..."
STOPPED_CONTAINERS=$(docker container ls -aq --filter "status=exited" --filter "created<$(date -d '24 hours ago' '+%Y-%m-%d')" 2>/dev/null || true)
if [ ! -z "$STOPPED_CONTAINERS" ]; then
    docker container rm $STOPPED_CONTAINERS 2>/dev/null || true
    echo "   - 중지된 컨테이너 정리 완료"
else
    echo "   - 정리할 중지된 컨테이너 없음"
fi

# 2. 사용하지 않는 이미지 정리 (48시간 이전)
echo "2. 사용하지 않는 이미지 정리..."
docker image prune -af --filter "until=48h" 2>/dev/null || true
echo "   - 이미지 정리 완료"

# 3. 사용하지 않는 볼륨 정리 (주의: 데이터 손실 가능)
echo "3. 사용하지 않는 볼륨 확인..."
UNUSED_VOLUMES=$(docker volume ls -qf dangling=true)
if [ ! -z "$UNUSED_VOLUMES" ]; then
    echo "   - 사용하지 않는 볼륨 발견: $UNUSED_VOLUMES"
    echo "   - 수동으로 확인 후 정리하세요: docker volume rm <volume_name>"
else
    echo "   - 정리할 볼륨 없음"
fi

# 4. 네트워크 정리
echo "4. 사용하지 않는 네트워크 정리..."
docker network prune -f 2>/dev/null || true
echo "   - 네트워크 정리 완료"

# 5. 빌드 캐시 정리 (크기 확인 후)
echo "5. 빌드 캐시 정리..."
BUILD_CACHE_SIZE=$(docker system df --format "{{.Type}}\t{{.Size}}" | grep "Build Cache" | cut -f2 | sed 's/[^0-9.]//g' | head -1)
if [ ! -z "$BUILD_CACHE_SIZE" ] && (( $(echo "$BUILD_CACHE_SIZE > 1.0" | bc -l) )); then
    docker builder prune -af --filter "until=24h" 2>/dev/null || true
    echo "   - 빌드 캐시 정리 완료 (${BUILD_CACHE_SIZE}GB)"
else
    echo "   - 빌드 캐시 정리 불필요"
fi

# 6. 로그 파일 정리 (Docker Desktop 로그)
echo "6. Docker Desktop 로그 정리..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    LOG_DIR="$HOME/Library/Containers/com.docker.docker/Data/log"
    if [ -d "$LOG_DIR" ]; then
        find "$LOG_DIR" -name "*.log" -mtime +7 -delete 2>/dev/null || true
        echo "   - macOS Docker 로그 정리 완료"
    fi
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    # Windows (WSL/MSYS)
    LOG_DIR="/c/Users/$USER/AppData/Local/Docker/log"
    if [ -d "$LOG_DIR" ]; then
        find "$LOG_DIR" -name "*.log" -mtime +7 -delete 2>/dev/null || true
        echo "   - Windows Docker 로그 정리 완료"
    fi
else
    echo "   - OS별 로그 정리 지원하지 않음"
fi

# 7. 컨테이너 로그 정리 (선택적)
echo "7. 컨테이너 로그 크기 확인..."
docker ps --format "{{.Names}}" | while read container; do
    if [ ! -z "$container" ]; then
        LOG_SIZE=$(docker logs --details $container 2>/dev/null | wc -c)
        if [ $LOG_SIZE -gt 10485760 ]; then  # 10MB 이상
            echo "   - $container: $(($LOG_SIZE / 1024 / 1024))MB (정리 권장)"
            # 실제 정리는 하지 않음 (서비스 중단 우려)
        fi
    fi
done

echo ""
echo "=== 정리 작업 완료 ==="

# 정리 후 상태 확인
echo ""
echo "=== 정리 후 Docker 시스템 상태 ==="
docker system df

echo ""
echo "완료 시간: $(date)"
echo ""
echo "=== 추가 최적화 권장사항 ==="
echo "1. Docker Desktop 설정에서 리소스 할당 최적화"
echo "2. 불필요한 컨테이너는 정기적으로 중지"
echo "3. 대용량 볼륨은 정기적으로 백업 후 정리"
echo "4. 모니터링 대시보드에서 리소스 사용량 확인"
echo ""
echo "모니터링 접속:"
echo "- Grafana: http://localhost:3001"
echo "- Prometheus: http://localhost:9090"
echo "- cAdvisor: http://localhost:8080"