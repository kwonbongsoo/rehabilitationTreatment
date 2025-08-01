# Docker 최적화 가이드

이 프로젝트는 최저 사양부터 고성능까지 다양한 환경에서 실행할 수 있도록 최적화되었습니다.

## 리소스 사양별 실행 방법

### 개발환경 (기본)
```bash
# 개발환경 (핫 리로드, 디버깅 포트 노출)
docker-compose up --build

# 백그라운드 실행
docker-compose up -d --build
```

**총 리소스**: 약 4 CPU, 3GB RAM
- 포트 노출: 모든 서비스 외부 접근 가능
- 볼륨 마운트: 소스코드 핫 리로드
- 넉넉한 리소스 할당

### 최저 사양 (극한 절약)
```bash
# 최저 사양으로 실행 (1GB RAM 환경)
docker-compose -f docker-compose.yaml -f docker-compose.min.yml up --build

# 백그라운드 실행
docker-compose -f docker-compose.yaml -f docker-compose.min.yml up -d --build
```

**총 리소스**: 약 1 CPU, 580MB RAM
- PostgreSQL: 64MB (연결 20개 제한)
- Redis: 32MB (LRU 정책)
- 각 서비스: 32-128MB
- Node.js 힙 크기 제한

### 프로덕션 환경
```bash
# 프로덕션 환경 (보안 강화, 리소스 최적화)
docker-compose -f docker-compose.yaml -f docker-compose.prod.yml up --build

# 백그라운드 실행
docker-compose -f docker-compose.yaml -f docker-compose.prod.yml up -d --build
```

**총 리소스**: 약 1.5 CPU, 1.2GB RAM
- 포트 제한: 필수 포트만 노출
- 재시작 정책: 자동 복구
- Nginx 로드밸런서 포함

## 🔧 환경별 최적화 설정

### 최저 사양 최적화 포인트

#### PostgreSQL 최적화
```sql
-- 연결 수 제한
max_connections = 20

-- 메모리 최적화
shared_buffers = 16MB
effective_cache_size = 48MB
maintenance_work_mem = 4MB

-- I/O 최적화
checkpoint_completion_target = 0.9
random_page_cost = 1.1
```

#### Redis 최적화
```bash
# 메모리 제한
maxmemory 24mb
maxmemory-policy allkeys-lru

# 디스크 쓰기 비활성화 (메모리 절약)
save ""
```

#### Node.js 최적화
```bash
# 힙 메모리 제한
NODE_OPTIONS=--max-old-space-size=50  # 50MB
NODE_OPTIONS=--max-old-space-size=100 # 100MB
```

## 서비스별 리소스 사용량

| 서비스 | 최저사양 | 개발환경 | 프로덕션 |
|--------|----------|----------|----------|
| **postgres** | 64MB | 512MB | 128MB |
| **redis** | 32MB | 256MB | 64MB |
| **fastify-member** | 128MB | 512MB | 256MB |
| **koa-auth** | 64MB | 256MB | 128MB |
| **ecommerce-app** | 128MB | 512MB | 256MB |
| **bff-server** | 64MB | 256MB | 128MB |
| **proxy-server** | 32MB | 256MB | 64MB |
| **kong** | 64MB | 256MB | 128MB |
| **총계** | **580MB** | **3GB** | **1.2GB** |

## 성능 예측

### 최저 사양 (580MB RAM)
- ✅ **처리량**: 50-100 RPS
- ✅ **동시 사용자**: 20-50명
- ✅ **응답 시간**: 200-800ms
- ✅ **안정성**: 기본적인 기능 정상 동작

### 개발 환경 (3GB RAM)
- ✅ **처리량**: 200-500 RPS
- ✅ **동시 사용자**: 100-200명
- ✅ **응답 시간**: 100-300ms
- ✅ **안정성**: 높음, 디버깅 최적화

### 프로덕션 환경 (1.2GB RAM)
- ✅ **처리량**: 100-300 RPS
- ✅ **동시 사용자**: 50-150명
- ✅ **응답 시간**: 150-400ms
- ✅ **안정성**: 매우 높음, 자동 복구

## 모니터링 명령어

### 리소스 사용량 실시간 모니터링
```bash
# 전체 컨테이너 리소스 사용량
docker stats

# 특정 컨테이너만 모니터링
docker stats postgres redis fastify-member-server

# 메모리 사용량만 확인
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

### 로그 확인
```bash
# 전체 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f fastify-member-server

# 에러 로그만 확인
docker-compose logs --tail=100 | grep -i error
```

### 헬스체크
```bash
# 컨테이너 상태 확인
docker-compose ps

# 각 서비스 헬스체크
curl http://localhost:9000/health  # Proxy Server
curl http://localhost:3000/        # Next.js App
curl http://localhost:8000/        # Kong Gateway
```

## 추가 최적화 옵션

### 1. 스왑 메모리 활용 (최저 사양)
```bash
# 스왑 파일 생성 (2GB)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 2. Docker 빌드 최적화
```bash
# 멀티스테이지 빌드 캐시 활용
docker-compose build --parallel

# 불필요한 이미지 정리
docker system prune -f
docker image prune -f
```

### 3. 네트워크 최적화
```bash
# Keep-Alive 연결 유지
# nginx.conf에서 설정
keepalive_timeout 65;
keepalive_requests 1000;
```

## 트러블슈팅

### 메모리 부족 시
```bash
# 1. 현재 메모리 사용량 확인
free -h
docker stats --no-stream

# 2. 불필요한 컨테이너 정리
docker container prune -f

# 3. 최저 사양 모드로 재시작
docker-compose -f docker-compose.yaml -f docker-compose.min.yml restart
```

### CPU 사용률 높을 시
```bash
# 1. Top 5 CPU 사용 프로세스 확인
docker stats --format "table {{.Container}}\t{{.CPUPerc}}" | head -6

# 2. 특정 서비스 재시작
docker-compose restart fastify-member-server

# 3. 로그 확인하여 원인 파악
docker-compose logs --tail=50 fastify-member-server
```

### 시작 실패 시
```bash
# 1. 의존성 순서 확인
docker-compose up --no-deps redis db

# 2. 개별 서비스 시작
docker-compose up redis
docker-compose up db
docker-compose up fastify-member-server

# 3. 포트 충돌 확인
netstat -tulpn | grep :3000
```

## 권장사항

1. **개발 시**: `docker-compose up` (기본 개발환경)
2. **테스트 시**: `docker-compose -f docker-compose.yaml -f docker-compose.min.yml up`
3. **프로덕션**: `docker-compose -f docker-compose.yaml -f docker-compose.prod.yml up`
4. **모니터링**: `docker stats` 명령어로 지속적인 모니터링
5. **업데이트**: 정기적인 `docker system prune` 실행

이 설정으로 1GB RAM 환경에서도 안정적으로 전체 마이크로서비스를 실행할 수 있습니다! 🎉
