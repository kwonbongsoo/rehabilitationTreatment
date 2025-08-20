# 감소된 강도 캐시 테스트

프록시 서버 안정성을 위한 낮은 강도의 Artillery 테스트 설정들입니다.

## 📊 테스트 유형

### 1. 최소 강도 테스트 (`minimal-cache-test.yml`)
- **최대 부하**: 5 req/s
- **지속 시간**: 3분
- **용도**: 기본 기능 검증, 초기 테스트
- **안전성**: 매우 높음

```bash
npm run test:minimal
# 또는
npm run test:safe
```

### 2. 감소된 강도 테스트 (`reduced-cache-test.yml`)
- **최대 부하**: 25 req/s
- **지속 시간**: 8분
- **용도**: 실제 캐시 성능 측정
- **안전성**: 높음

```bash
npm run test:reduced
# 또는
npm run test:safe-moderate
```

## 테스트 시나리오

모든 테스트는 동일한 시나리오를 포함합니다:

1. **Homepage Cache Performance** (50-60%)
   - 메인 페이지 캐시 효율성 테스트
   - 캐시 히트율 및 응답 시간 측정

2. **Categories Cache Performance** (30-35%)
   - 카테고리 페이지 캐시 성능 테스트
   - 다양한 캐시 키 패턴 검증

3. **Cache Invalidation Test** (10%)
   - 캐시 무효화 동작 검증
   - no-cache 헤더 처리 테스트

4. **Mixed Cache Strategy Test** (5%)
   - 캐시/비캐시 혼합 요청 패턴
   - 실제 사용자 행동 시뮬레이션

## 메트릭 수집

각 테스트는 다음 메트릭을 수집합니다:

- **캐시 히트율** (`cache_hit_ratio`)
- **캐시 응답 시간** (`cache_response_time`)
- **캐시 미스 패널티** (`cache_miss_penalty`)
- **Redis 메모리 사용량** (`redis_memory_usage`)

## 설정 차이점

| 설정 | 최소 강도 | 감소된 강도 | 원본 (높은 강도) |
|------|-----------|-------------|------------------|
| 최대 RPS | 5 | 25 | 150 |
| HTTP 타임아웃 | 20s | 15s | 10s |
| 연결 풀 | 10 | 50 | 100 |
| Think 시간 | 2-6s | 1-4s | 0.5-3s |

## 실행 방법

1. **직접 Artillery 실행**:
```bash
artillery run scenarios/minimal-cache-test.yml
artillery run scenarios/reduced-cache-test.yml
```

2. **npm 스크립트 사용**:
```bash
npm run test:minimal      # 최소 강도
npm run test:reduced      # 감소된 강도
npm run test:safe         # 최소 강도 (helper 스크립트)
npm run test:safe-moderate # 감소된 강도 (helper 스크립트)
```

3. **helper 스크립트 직접 실행**:
```bash
node run-reduced-test.js minimal
node run-reduced-test.js reduced
```

## 결과 분석

테스트 완료 후 확인할 사항:

1. **실시간 콘솔 출력**: 50개 요청마다 캐시 메트릭 업데이트
2. **상세 리포트**: `reports/` 폴더에 JSON 형태로 저장
3. **캐시 효율성**: 히트율 80% 이상 목표
4. **응답 시간**: 캐시 히트 < 50ms, 캐시 미스 < 500ms 목표

## 주의사항

- 테스트 전 프록시 서버와 Redis가 실행 중인지 확인
- `http://localhost:9000` 에서 서버가 응답하는지 확인
- 시스템 리소스 모니터링 권장
- 필요시 더욱 낮은 강도로 수정 가능

## 점진적 테스트 전략

1. **1단계**: `minimal` 테스트로 기본 기능 확인
2. **2단계**: `reduced` 테스트로 실제 성능 측정
3. **3단계**: 결과 분석 후 필요시 강도 조정
4. **4단계**: 안정성 확인 후 원본 테스트 시도
