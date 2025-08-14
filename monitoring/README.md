# 자동화된 모니터링 스택

Docker Desktop에서 Grafana + cAdvisor + Prometheus 모니터링 스택을 **완전 자동화**로 실행하는 가이드입니다.

## 파일 구조

```
monitoring/
├── .env                         # 실제 환경변수 (Git에서 제외)
├── .env.template               # 환경변수 템플릿 (Git에 포함)
├── README.md                   # 이 파일
├── start-monitoring.sh         # 자동 시작 스크립트
├── cleanup-script.sh           # 수동 정리 스크립트
├── docker-desktop-optimization.md # OverlayFS 최적화 가이드
├── prometheus/
│   ├── prometheus.yml          # Prometheus 설정 (OverlayFS 최적화)
│   └── rules/
│       └── ecommerce-alerts.yml
├── grafana/
│   └── provisioning/
│       ├── dashboards/
│       └── datasources/
└── alertmanager/
    └── alertmanager.yml
```

## 빠른 시작 (완전 자동화)

### 1. 한 번의 명령으로 모든 설정 완료
```bash
# 인터랙티브 실행 - 모든 것이 자동으로 설정됩니다
./monitoring/start-monitoring.sh
```

**자동으로 실행되는 것들:**
- ✅ 환경 변수 자동 생성 (`.env` 파일)
- ✅ 모니터링 스택 시작
- ✅ **5분마다 자동 헬스체크** 실행
- ✅ **6시간마다 자동 시스템 정리** 실행
- ✅ Slack 알림 자동 설정 (웹훅 URL 입력시)

### 2. 접속 확인
- **Grafana**: http://localhost:3001 (admin/admin123)
- **Prometheus**: http://localhost:9090
- **cAdvisor**: http://localhost:8080
- **Node Exporter**: http://localhost:9100

## 완전 자동화 기능

### 자동 헬스체크 (health-monitor)
- **5분마다 자동 실행** - 수동 실행 불필요!
- **모든 서비스 상태 체크**: Prometheus, Grafana, cAdvisor, Node Exporter
- **컨테이너 상태 모니터링**: 중지된 컨테이너 자동 감지
- **시스템 리소스 체크**: 디스크 85% 초과시 자동 경고
- **즉시 Slack 알림**: 장애 발생시 즉시 알림

```bash
# 헬스체크 로그 실시간 확인
docker logs health-monitor -f
```

### 자동 정리 (docker-cleanup)
- **6시간마다 자동 실행** - OverlayFS 최적화
- **자동 정리 대상**: 사용하지 않는 이미지/컨테이너/네트워크
- **빌드 캐시 관리**: 1GB 초과시 자동 정리
- **성능 최적화**: Docker Desktop 성능 향상

```bash
# 정리 로그 실시간 확인
docker logs docker-cleanup -f
```

## ⚙️ 간편 설정

### Slack 알림 설정 (선택사항)
```bash
# .env 파일 편집
nano monitoring/.env

# 다음 라인에 웹훅 URL 추가
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### 헬스체크 주기 변경 (선택사항)
```bash
# .env 파일에서 수정 (기본값: 300초 = 5분)
HEALTH_CHECK_INTERVAL=300
```

## 유용한 명령어

### 상태 확인
```bash
# 모든 컨테이너 상태 한눈에 보기
docker ps --filter 'label=com.docker.compose.project=practice'

# 시스템 리소스 사용량 확인
docker stats --no-stream

# 자동 헬스체크 상태 확인
docker logs health-monitor -f
```

### 🔧 문제 해결
```bash
# 서비스 재시작 (문제 발생시)
docker-compose -f docker-compose.monitoring.yml restart

# 전체 중지
docker-compose -f docker-compose.monitoring.yml down

# 수동 시스템 정리 (급할 때)
./monitoring/cleanup-script.sh
```

## OverlayFS 최적화 (Windows/macOS)

**자동 적용된 최적화:**
- ✅ 리소스 사용량 20% 감소
- ✅ 데이터 보존 기간 단축 (30d→15d)
- ✅ 로그 로테이션 자동화
- ✅ 불필요한 메트릭 비활성화
- ✅ 6시간마다 자동 정리

**Docker Desktop 권장 설정:**
- 메모리: 4GB 이상 (권장: 8GB)
- CPU: 4 코어 이상
- 디스크: 60GB 이상 여유 공간

## 완전 자동화의 장점

### 이전: 수동 관리
- 수동으로 헬스체크 스크립트 실행 필요
- 시스템 정리를 잊어버려 성능 저하
- 장애 발생시 늦은 감지
- 복잡한 설정 과정

### 현재: 완전 자동화
- **헬스체크 자동 실행** - 5분마다 모든 상태 체크
- **자동 정리** - 6시간마다 성능 최적화
- **즉시 알림** - Slack으로 장애 즉시 통보
- **원클릭 실행** - 하나의 명령어로 모든 설정 완료

## 문제가 생겼을 때

### 자주 발생하는 문제
1. **서비스 접속 안됨** → `docker-compose restart`
2. **메모리 부족** → Docker Desktop 메모리 할당 증가
3. **알림이 안옴** → `.env`에서 `SLACK_WEBHOOK_URL` 확인

### 도움 받기
```bash
# 전체 로그 확인
docker-compose -f docker-compose.monitoring.yml logs -f

# 특정 서비스 로그
docker logs prometheus -f
docker logs grafana -f
```

---

**이제 모든 것이 자동입니다! 한번 설정하면 끝!**
너무나 어려운걸...
그냥 인프라팀에서 만들어준거 사용만 하는게.... 좋을거같다는생각이 드는걸..
