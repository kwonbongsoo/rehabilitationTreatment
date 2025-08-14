# Docker Desktop OverlayFS 최적화 가이드

## OverlayFS 이슈 개요

Docker Desktop에서 OverlayFS를 사용할 때 발생하는 주요 문제들:

### 주요 문제점
1. **성능 저하**: 파일 시스템 I/O 성능 저하
2. **inode 고갈**: 대량의 작은 파일로 인한 inode 부족
3. **메타데이터 동기화**: 볼륨 마운트 시 동기화 지연
4. **디스크 공간**: 로그 파일 누적으로 인한 공간 부족

## 적용된 최적화 설정

### 1. 컨테이너 리소스 최적화
- **CPU 제한**: 각 컨테이너별 적절한 CPU 할당
- **메모리 제한**: 메모리 사용량 최적화
- **로그 로테이션**: 로그 파일 크기 및 개수 제한

### 2. 메트릭 수집 최적화
- **수집 간격 증가**: cAdvisor housekeeping 60s → 120s
- **불필요한 메트릭 비활성화**: CPU topology, NUMA 등
- **데이터 보존 기간 단축**: Prometheus 30d → 15d

### 3. 자동 정리 시스템
- **6시간 주기**: 사용하지 않는 리소스 정리
- **이미지 정리**: 24시간 이전 이미지 삭제
- **빌드 캐시 관리**: 1GB 초과 시 정리

## Windows/macOS 최적화 팁

### Docker Desktop 설정
```
Resources → Advanced:
- Memory: 4GB (최소) - 8GB (권장)
- CPU: 4 cores (최소) - 6+ cores (권장)
- Disk image size: 60GB+ (여유 공간 확보)
- File sharing: 필요한 경로만 추가
```

### WSL2 최적화 (Windows)
```powershell
# .wslconfig 파일 생성
[wsl2]
memory=8GB
processors=4
localhostForwarding=true
```

### 성능 모니터링
- **자동 헬스체크**: `docker logs health-monitor -f` (5분마다 자동 실행)
- **Docker Stats**: `docker stats --no-stream`
- **시스템 리소스**: Activity Monitor (macOS) / Task Manager (Windows)
- **Grafana 대시보드**: http://localhost:3001

## 실행 명령어

### 기본 실행
```bash
docker-compose -f docker-compose.yaml -f docker-compose.min.yml -f docker-compose.monitoring.yml up --build -d
```

### 정리 서비스 포함 실행
```bash
docker-compose -f docker-compose.yaml -f docker-compose.min.yml -f docker-compose.monitoring.yml --profile cleanup up --build -d
```

### 수동 정리
```bash
# 전체 시스템 정리
docker system prune -af --volumes --filter "until=24h"

# 빌드 캐시만 정리
docker builder prune -af
```

## 문제 해결

### 컨테이너 실행 실패
1. Docker Desktop 재시작
2. WSL2 재시작 (Windows)
3. 디스크 공간 확인
4. 메모리 사용량 확인

### 성능 저하
1. 리소스 할당 증가
2. 불필요한 컨테이너 정리
3. 로그 파일 정리
4. 재시작

### 모니터링 접속 불가
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin123)
- cAdvisor: http://localhost:8080
- AlertManager: http://localhost:9093