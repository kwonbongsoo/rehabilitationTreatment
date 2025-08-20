# Artillery.js Next.js 성능 테스트 스위트

Next.js 애플리케이션과 Redis 캐시 프록시 서버의 성능을 비교 분석하기 위한 Artillery.js 기반 부하 테스트 도구입니다.

## 📋 목차

- [개요](#개요)
- [테스트 시나리오](#테스트-시나리오)
- [설치 및 설정](#설치-및-설정)
- [사용법](#사용법)
- [테스트 환경](#테스트-환경)
- [리포트 분석](#리포트-분석)
- [고급 사용법](#고급-사용법)
- [문제 해결](#문제-해결)

## 개요

이 테스트는 다음과 같은 성능 비교 분석을 수행합니다:

### 비교 대상
- **Next.js 직접 접근** (localhost:3000): SSR, ISR, API Routes 성능
- **Redis 캐시 프록시** (localhost:9000): HTML 페이지 캐싱 효과

### 측정 메트릭
- **RPS (Requests Per Second)**: 초당 요청 처리량
- **응답 시간**: 평균, P95, P99 응답 시간
- **캐시 효율성**: Hit Rate, Miss Penalty
- **Core Web Vitals**: FCP, LCP, TTFB (추정값)
- **리소스 사용량**: Docker 컨테이너 성능 한계

## 테스트 시나리오

### 1. 기본 부하 테스트 (`basic-load-test.yml`)
```yaml
# 단계별 부하 증가 테스트
- 워밍업: 5 RPS (30초)
- 점진 증가: 10-30 RPS (60초)
- 지속 부하: 30 RPS (120초)
- 피크 부하: 50 RPS (60초)
```

### 2. Next.js 직접 접근 테스트 (`nextjs-direct.yml`)
```yaml
# Next.js SSR 성능 측정
- 기준선: 10 RPS (30초)
- 중간 부하: 25-50 RPS (60초)
- 지속 부하: 50 RPS (90초)
- 고부하: 75 RPS (60초)
- 피크: 100 RPS (30초)
```

### 3. 프록시 캐시 테스트 (`proxy-cached.yml`)
```yaml
# Redis HTML 캐시 성능 측정
- 워밍업: 15 RPS (30초)
- 중간 부하: 40-80 RPS (60초)
- 지속 고부하: 80 RPS (120초)
- 스트레스: 120 RPS (60초)
- 피크 성능: 150 RPS (30초)
```

### 4. 사용자 패턴 시뮬레이션 (`user-patterns.yml`)
```yaml
# 실제 사용자 행동 패턴
- 게스트 브라우징 (35%)
- 빠른 브라우징 - 모바일 (25%)
- 상세 탐색 - 데스크톱 (20%)
- 재방문 사용자 (15%)
- 봇/크롤러 (5%)
```

### 5. 스케일링 테스트 (`scaling-test.yml`)
```yaml
# Docker 인스턴스 한계 측정
- 50 → 100 → 200 → 300 → 500 → 750 → 1000 RPS
- 각 단계별 60초간 지속
- 1500 RPS 임계점 테스트 (30초)
```

### 6. 비교 테스트 (`comparison-test.yml`)
```yaml
# 캐싱 전략 직접 비교
- 환경 변수 기반 동적 타겟 설정
- Next.js vs Proxy 성능 비교
- 동일 조건 성능 메트릭 수집
```

## 🛠️ 설치 및 설정

### 1. 필수 조건
```bash
# Node.js 16+ 필요
node --version

# 테스트 대상 서버가 실행 중이어야 함
# Next.js 서버: localhost:3000
# 프록시 서버: localhost:9000
```

### 2. Artillery.js 설치
```bash
# 전역 설치 (권장)
npm install -g artillery@latest

# 또는 프로젝트 로컬 설치
cd artillery
npm install
```

### 3. 의존성 설치
```bash
cd artillery
npm install
```

## 사용법

### 기본 테스트 실행

#### 1. Next.js 직접 테스트
```bash
# Next.js 서버 (localhost:3000) 테스트
npm run test:next-direct

# 또는 직접 실행
artillery run scenarios/nextjs-direct.yml
```

#### 2. 프록시 캐시 테스트
```bash
# Redis 캐시 프록시 (localhost:9000) 테스트
npm run test:proxy-cached

# 또는 직접 실행
artillery run scenarios/proxy-cached.yml
```

#### 3. 성능 비교 테스트
```bash
# 양쪽 모두 테스트하여 비교
npm run test:comparison

# 개별 환경 테스트
TARGET_PORT=3000 artillery run scenarios/comparison-test.yml --environment nextjs_direct
TARGET_PORT=9000 artillery run scenarios/comparison-test.yml --environment proxy_cached
```

### 고급 테스트 실행

#### 사용자 패턴 시뮬레이션
```bash
# 실제 사용자 행동 패턴 테스트
npm run test:user-patterns

# 다양한 포트로 테스트
TARGET_PORT=3000 artillery run scenarios/user-patterns.yml
TARGET_PORT=9000 artillery run scenarios/user-patterns.yml
```

#### 스케일링 한계 측정
```bash
# Docker 인스턴스 성능 한계 측정
npm run test:scaling

# Next.js 서버 스케일링 테스트
TARGET_PORT=3000 artillery run scenarios/scaling-test.yml

# 프록시 서버 스케일링 테스트
TARGET_PORT=9000 artillery run scenarios/scaling-test.yml
```

#### 전체 테스트 스위트 실행
```bash
# 모든 시나리오 순차 실행
npm run test:all

# HTML 리포트 생성과 함께 실행
npm run report:html
```

## 테스트 환경

### 네트워크 구성
```
Client → Artillery.js → Target Server
                    ↓
              [localhost:3000] Next.js 직접 접근
                     또는
              [localhost:9000] Redis 캐시 프록시
```

### 서버 요구사항

#### Next.js 서버 (localhost:3000)
- Next.js 14+ 프로덕션 빌드
- SSR/ISR 활성화
- 성능 헤더 설정 권장:
  ```javascript
  // next.config.js
  headers: [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Response-Time', value: '{responseTime}' },
        { key: 'X-Render-Time', value: '{renderTime}' }
      ]
    }
  ]
  ```

#### 프록시 서버 (localhost:9000)
- Redis 기반 HTML 캐싱
- 캐시 상태 헤더 설정:
  ```
  X-Cache-Status: HIT|MISS|STALE
  X-Cache-TTL: {ttl_seconds}
  X-Redis-Time: {redis_response_time}
  ```

## 리포트 분석

### 1. 실시간 메트릭 모니터링

테스트 실행 중 콘솔에서 실시간 메트릭을 확인할 수 있습니다:

```bash
Metrics Update: 100 requests processed
   Average Response Time: 245ms
   Error Rate: 0%

Next.js Metrics Update (50 requests):
   Avg Response Time: 312ms
   Avg FCP: 512ms
   SSR: 30 | 🔄 ISR: 20
   Avg Bundle Size: 1.2MB

 Cache Metrics Update (75 requests):
   Hit Rate: 78% (58/75)
   Avg Response Time: 156ms
   Cache Hit Avg: 89ms
   Cache Miss Avg: 387ms
   Redis Avg: 12ms
```

### 2. 상세 성능 리포트

테스트 완료 후 `reports/` 디렉토리에 JSON 형태의 상세 리포트가 생성됩니다:

#### Next.js 성능 리포트 (`nextjs-performance-{timestamp}.json`)
```json
{
  "performanceAnalysis": {
    "averageResponseTime": 312,
    "p95ResponseTime": 567,
    "p99ResponseTime": 892,
    "ssrPerformance": {
      "count": 150,
      "averageRenderTime": 89,
      "averageResponseTime": 356
    },
    "webVitalsAnalysis": {
      "averageFCP": 512,
      "averageLCP": 734,
      "averageTTFB": 234,
      "goodFCPCount": 142,
      "goodLCPCount": 138
    }
  }
}
```

#### 캐시 성능 리포트 (`cache-performance-{timestamp}.json`)
```json
{
  "cacheEfficiency": {
    "hitRate": 78,
    "missRate": 22,
    "hitCount": 234,
    "missCount": 66
  },
  "performanceAnalysis": {
    "cacheHitAverageTime": 89,
    "cacheMissAverageTime": 387,
    "performanceGain": 77,
    "redisPerformance": {
      "average": 12,
      "p95": 23,
      "p99": 45
    }
  }
}
```

### 3. 성능 비교 분석

#### 핵심 지표 비교

| 메트릭 | Next.js 직접 | Redis 캐시 | 개선도 |
|--------|-------------|-----------|--------|
| 평균 응답 시간 | 312ms | 156ms | **50%** |
| P95 응답 시간 | 567ms | 234ms | **59%** |
| 최대 RPS | 400 | 800 | **100%** |
| 캐시 히트율 | - | 78% | - |

#### 비용-효율성 분석
- **캐시 구축 비용**: Redis 인프라 + 프록시 개발
- **성능 향상**: 평균 50% 응답 시간 단축
- **처리량 증대**: 2배 RPS 처리 가능
- **사용자 경험**: Core Web Vitals 개선

## 🔧 고급 사용법

### 1. 커스텀 메트릭 추가

새로운 메트릭을 추가하려면 해당 프로세서 파일을 수정하세요:

```javascript
// processors/custom-metrics.js
function captureCustomMetrics(requestParams, response, context, ee, next) {
  const customMetric = {
    businessMetric: calculateBusinessValue(response),
    userExperience: calculateUXScore(response.headers),
    costEfficiency: calculateCostPerRequest(context)
  };

  // 메트릭 저장 로직
  saveCustomMetrics(customMetric);

  return next();
}
```

### 2. 환경별 설정

환경 변수를 사용하여 다양한 설정으로 테스트할 수 있습니다:

```bash
# 다양한 환경 설정
export TARGET_PORT=3000
export TEST_DURATION=300
export MAX_RPS=1000
export THINK_TIME=2

artillery run scenarios/scaling-test.yml
```

### 3. CI/CD 파이프라인 통합

GitHub Actions 예시:

```yaml
# .github/workflows/performance-test.yml
name: Performance Testing
on: [push, pull_request]

jobs:
  performance-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Artillery
        run: npm install -g artillery@latest

      - name: Start Test Servers
        run: |
          docker-compose up -d
          sleep 30

      - name: Run Performance Tests
        run: |
          cd artillery
          npm run test:comparison

      - name: Upload Reports
        uses: actions/upload-artifact@v3
        with:
          name: performance-reports
          path: artillery/reports/
```

### 4. 대시보드 시각화

Grafana를 사용한 실시간 모니터링:

```bash
# Grafana 대시보드 설정
docker run -d -p 3001:3000 grafana/grafana

# Artillery 메트릭을 Prometheus로 전송
artillery run --output prometheus scenarios/nextjs-direct.yml
```

## 문제 해결

### 자주 발생하는 문제

#### 1. 연결 에러
```bash
Error: connect ECONNREFUSED 127.0.0.1:3000
```
**해결방법**: 테스트 대상 서버가 실행 중인지 확인
```bash
curl http://localhost:3000/
curl http://localhost:9000/
```

#### 2. 메모리 부족
```bash
Error: Request timeout
```
**해결방법**: 동시 연결 수 조정
```yaml
config:
  http:
    pool: 25  # 기본값 50에서 줄임
    timeout: 30  # 타임아웃 증가
```

#### 3. 높은 에러율
```bash
Error rate: 15%
```
**해결방법**: RPS 점진적 증가 및 think time 조정
```yaml
phases:
  - duration: 60
    arrivalRate: 10
    rampTo: 50  # 급격한 증가 대신 점진적 증가
```

### 성능 최적화 팁

#### 1. 테스트 데이터 최적화
- CSV 파일 크기 적정화 (1000줄 이하)
- 중복 데이터 제거
- 메모리 효율적인 데이터 구조 사용

#### 2. 시나리오 최적화
```yaml
# 효율적인 think time 설정
think:
  min: 1
  max: 3  # 너무 긴 think time 지양

# 적절한 phase 설정
phases:
  - duration: 30   # 짧은 시간으로 시작
    arrivalRate: 5  # 낮은 RPS로 시작
```

#### 3. 리소스 모니터링
```bash
# 시스템 리소스 모니터링
htop

# Docker 컨테이너 리소스 확인
docker stats

# 네트워크 연결 상태 확인
netstat -an | grep :3000
```

## 체크리스트

### 테스트 실행 전 확인사항
- [ ] Next.js 서버 (localhost:3000) 실행 확인
- [ ] 프록시 서버 (localhost:9000) 실행 확인
- [ ] Redis 서버 실행 및 연결 확인
- [ ] Artillery.js 최신 버전 설치 확인
- [ ] 충분한 시스템 리소스 확보
- [ ] 방화벽/보안 설정 확인

### 테스트 결과 검증
- [ ] 에러율 5% 이하 확인
- [ ] 응답 시간 임계값 준수 확인
- [ ] 캐시 히트율 70% 이상 확인 (프록시 테스트)
- [ ] 메트릭 데이터 수집 정상 확인
- [ ] 리포트 파일 생성 확인

## 추가 리소스

### 관련 문서
- [Artillery.js 공식 문서](https://www.artillery.io/docs)
- [Next.js 성능 최적화 가이드](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Redis 캐싱 전략](https://redis.io/docs/manual/clients-guide/)

### 성능 테스트 베스트 프랙티스
- 테스트 환경의 일관성 유지
- 베이스라인 메트릭 수립
- 점진적 부하 증가
- 다양한 사용자 패턴 시뮬레이션
- 정기적인 성능 회귀 테스트

### 모니터링 도구 통합
- Grafana + Prometheus
- New Relic APM
- DataDog
- CloudWatch (AWS)

## 테스트 실패 히스토리

### 2025년 8월 20일 - 최소 사양 프록시 서버 부하 테스트 실패

**테스트 환경:**
- 테스트 명령: `npm run test:proxy-cached`
- 대상 서버: 최소 사양으로 띄운 프록시 서버 (localhost:9000)
- 시나리오: Redis 캐시 프록시 부하 테스트

**실패 결과:**
- **상태**: 완전 실패 (서버 다운)
- **증상**: 부하 테스트 중 프록시 서버가 "뻥뻥" 터지는 현상 발생
- **영향**: 서버가 요청을 처리하지 못하고 연결이 끊어지거나 응답 불가 상태

**추정 원인:**
1. **리소스 부족**: 최소 사양의 Docker 컨테이너로 인한 메모리/CPU 제한
2. **Redis 연결 부족**: 동시 연결 수 초과로 인한 Redis 연결 풀 고갈
3. **Node.js 이벤트 루프 블로킹**: 높은 RPS로 인한 이벤트 루프 처리 한계 도달
4. **네트워크 버퍼 오버플로우**: 대량 요청으로 인한 네트워크 버퍼 한계 초과

**테스트 시나리오 재검토 필요:**
```yaml
# 현재 proxy-cached.yml 설정 (너무 공격적)
phases:
  - duration: 30
    arrivalRate: 15    # 초기 부하도 높음
  - duration: 60
    arrivalRate: 40
    rampTo: 80         # 너무 빠른 부하 증가
  - duration: 120
    arrivalRate: 80    # 지속적인 고부하
  - duration: 60
    arrivalRate: 120   # 과도한 부하
  - duration: 30
    arrivalRate: 150   # 극한 부하
```

**권장 개선사항:**
1. **단계적 부하 증가**: 5 → 10 → 20 → 30 RPS 형태로 점진적 증가
2. **리소스 모니터링**: 테스트 중 Docker stats 및 메모리 사용량 추적
3. **서킷 브레이커 구현**: 서버 과부하 시 자동 차단 메커니즘
4. **Redis 연결 풀 최적화**: 연결 수 제한 및 재사용 전략 개선
5. **헬스 체크 강화**: 서버 상태 모니터링 및 조기 경고 시스템

**다음 테스트 계획:**
- 최소 사양 환경에서 안전한 부하 한계 측정
- 점진적 RPS 증가를 통한 임계점 파악
- 서버 복구 시간 및 안정성 테스트
- 프로덕션 환경 대비 최적 사양 도출

### 2025년 8월 20일 - 미니멀 버전 안전 테스트 성공

**테스트 환경:**
- 미니멀 테스트 한 배경: 최소 사양 도커로 돌리는 proxy 서버 캐시 테스트에서 빵빵 터져서, 너무 보수적으로 테스트를 진행.
- 테스트 명령: 미니멀 버전 테스트 시나리오
- 대상 서버: 최소 사양으로 띄운 프록시 서버 (localhost:9000)
- 시나리오: 극도로 보수적인 부하 테스트
- **Docker 최소 사양 설정**: `docker-compose.min.yml` 기준

**프록시 서버 최소 사양:**
```yaml
proxy-server:
  deploy:
    resources:
      limits:
        cpus: '0.05'      # CPU 5% 제한
        memory: 32M       # 메모리 32MB 제한
      reservations:
        cpus: '0.02'      # CPU 2% 예약
        memory: 16M       # 메모리 16MB 예약
  environment:
    - NODE_ENV=production
    - BUN_ENV=production
```

**관련 서비스 최소 사양:**
```yaml
redis:                    # 캐시 백엔드
  cpus: '0.05' / memory: 32M

kong:                     # API Gateway
  cpus: '0.1' / memory: 64M

ecommerce-app:            # Next.js 앱
  cpus: '0.2' / memory: 128M
```

**성공 결과:**
- **상태**: 테스트 완료 성공 ✅
- **최대 RPS**: 단 3 RPS로 제한하여 안전 운영
- **테스트 지속 시간**: 한 사이클 완료
- **에러율**: 0% (완벽한 안정성)
- **응답 시간**: 모든 요청 정상 처리

**테스트 설정:**
```yaml
# 미니멀 안전 테스트 설정
phases:
  - duration: 60
    arrivalRate: 1     # 1 RPS로 시작
  - duration: 60
    arrivalRate: 2     # 2 RPS로 증가
  - duration: 60
    arrivalRate: 3     # 최대 3 RPS까지만
```

**핵심 발견사항:**
1. **안전 운영 확인**: RPS 3 수준에서는 완벽한 안정성 확보
2. **리소스 여유도**: 최소 사양에서도 3 RPS는 무리 없이 처리 가능
3. **베이스라인 설정**: 안전한 최소 성능 기준점 확보
4. **점진적 증가 필요**: 3 RPS → 5 RPS → 10 RPS 형태로 단계별 테스트 필요

**최소 사양 서버 성능 한계 분석:**
- **안전 운영 범위**: 1-3 RPS
- **위험 구간**: 15 RPS 이상에서 서버 불안정
- **권장 운영**: 5-10 RPS 수준에서 점진적 확장
- **모니터링 필수**: 실시간 리소스 모니터링 통한 안전 확보

---
