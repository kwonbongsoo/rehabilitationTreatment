#!/bin/bash

# 모니터링 스택 시작 스크립트
# 자동 헬스체크 포함

echo "=== Docker Desktop 모니터링 스택 시작 ==="
echo "시작 시간: $(date)"

# 컬러 설정
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 환경 변수 파일 확인
ENV_FILE="./monitoring/.env"
ENV_TEMPLATE="./monitoring/.env.template"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠ .env 파일이 없습니다. 템플릿에서 복사합니다...${NC}"
    if [ -f "$ENV_TEMPLATE" ]; then
        cp "$ENV_TEMPLATE" "$ENV_FILE"
        echo -e "${GREEN}✓ .env 파일이 생성되었습니다.${NC}"
        echo -e "${YELLOW}⚠ monitoring/.env 파일을 편집하여 설정을 완료하세요.${NC}"
    else
        echo -e "${RED}✗ .env 템플릿 파일을 찾을 수 없습니다.${NC}"
    fi
fi

# Docker 실행 상태 확인
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker가 실행되지 않았습니다. Docker Desktop을 시작하세요.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker 상태 정상${NC}"
echo ""

# 실행 옵션 선택
echo "=== 실행 옵션 선택 ==="
echo "1) 기본 모니터링만 실행"
echo "2) 자동 헬스체크 포함 실행"
echo "3) 자동 정리 + 헬스체크 포함 실행 (권장)"
echo "4) 모든 서비스 포함 실행"
echo ""
read -p "선택하세요 (1-4, 기본값: 3): " choice
choice=${choice:-3}

# Docker Compose 명령어 구성
BASE_CMD="docker-compose -f docker-compose.yaml -f docker-compose.min.yml -f docker-compose.monitoring.yml"
PROFILES=""

case $choice in
    1)
        echo "기본 모니터링 스택만 실행합니다..."
        ;;
    2)
        echo "자동 헬스체크 포함하여 실행합니다..."
        PROFILES="--profile health-check"
        ;;
    3)
        echo "자동 정리 + 헬스체크 포함하여 실행합니다... (권장)"
        PROFILES="--profile cleanup --profile health-check"
        ;;
    4)
        echo "모든 서비스 포함하여 실행합니다..."
        PROFILES="--profile cleanup --profile health-check"
        ;;
    *)
        echo "잘못된 선택입니다. 기본 설정으로 실행합니다..."
        ;;
esac

echo ""
echo "=== 실행 명령어 ==="
FULL_CMD="$BASE_CMD $PROFILES up --build -d"
echo "$FULL_CMD"
echo ""

# 실행 확인
read -p "실행하시겠습니까? (y/N): " confirm
if [[ $confirm =~ ^[Yy]$ ]]; then
    echo "모니터링 스택을 시작합니다..."
    echo ""
    
    # 실행
    eval $FULL_CMD
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ 모니터링 스택이 성공적으로 시작되었습니다!${NC}"
        echo ""
        
        # 서비스 상태 확인
        echo "=== 서비스 상태 확인 ==="
        sleep 10  # 서비스 시작 대기
        
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "label=com.docker.compose.project=practice"
        
        echo ""
        echo "=== 접속 정보 ==="
        echo -e "${GREEN}🔍 Prometheus:${NC} http://localhost:9090"
        echo -e "${GREEN}📊 Grafana:${NC} http://localhost:3001 (admin/admin123)"
        echo -e "${GREEN}🐳 cAdvisor:${NC} http://localhost:8080"
        echo -e "${GREEN}📈 Node Exporter:${NC} http://localhost:9100/metrics"
        
        if [[ $PROFILES == *"health-check"* ]]; then
            echo -e "${GREEN}🏥 자동 헬스체크:${NC} 5분마다 실행됨"
            echo "   헬스체크 로그: docker logs health-monitor -f"
        fi
        
        if [[ $PROFILES == *"cleanup"* ]]; then
            echo -e "${GREEN}🧹 자동 정리:${NC} 6시간마다 실행됨"
            echo "   정리 로그: docker logs docker-cleanup -f"
        fi
        
        echo ""
        echo "=== 유용한 명령어 ==="
        echo "• 자동 헬스체크 로그: docker logs health-monitor -f"
        echo "• 서비스 상태 확인: docker ps --filter 'label=com.docker.compose.project=practice'"
        echo "• 시스템 리소스: docker stats --no-stream"
        echo "• 수동 정리: ./monitoring/cleanup-script.sh"
        echo "• 서비스 중지: docker-compose -f docker-compose.monitoring.yml down"
        echo "• 전체 로그 확인: docker-compose -f docker-compose.monitoring.yml logs -f"
        
    else
        echo -e "${RED}✗ 모니터링 스택 시작에 실패했습니다.${NC}"
        echo "오류를 확인하고 다시 시도하세요."
    fi
else
    echo "실행이 취소되었습니다."
fi

echo ""
echo "=== 스크립트 완료 ==="