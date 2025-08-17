# 이메일 알림 설정 가이드

## Gmail SMTP 설정 (권장)

### 필요한 정보
- Gmail 계정 (2단계 인증 필수)
- 앱 비밀번호 (Google에서 생성)

### 🔧 설정 단계

#### 1. Google 계정 설정
```
1. Google 계정 → 보안 페이지 이동
2. 2단계 인증 활성화 (필수!)
3. 앱 비밀번호 생성:
   - 보안 → 앱 비밀번호
   - 앱 선택: "메일"
   - 기기 선택: "기타(사용자 지정 이름)"
   - 이름 입력: "E-Commerce Monitoring"
   - 생성 버튼 클릭
   - 16자리 앱 비밀번호 복사 (예: abcd efgh ijkl mnop)
```

#### 2. 환경변수 설정
```bash
# monitoring/.env 파일 수정
ALERTMANAGER_SMTP_HOST=smtp.gmail.com:587
ALERTMANAGER_SMTP_FROM=alerts@your-domain.com           # 발신자 표시 이름
ALERTMANAGER_SMTP_USERNAME=your-email@gmail.com         # 실제 Gmail 주소
ALERTMANAGER_SMTP_PASSWORD=abcd-efgh-ijkl-mnop         # 16자리 앱 비밀번호 (공백 제거)
```

#### 3. 수신자 설정
AlertManager에서 알림을 받을 이메일 주소는 별도로 설정:
```yaml
# monitoring/alertmanager/alertmanager.yml
receivers:
  - name: 'email-alerts'
    email_configs:
    - to: 'admin@your-company.com'          # 실제 수신할 이메일
      subject: '[ALERT] {{ .GroupLabels.alertname }}'
```

## 🔧 다른 이메일 서비스 설정

### Microsoft Outlook/Office 365
```bash
ALERTMANAGER_SMTP_HOST=smtp-mail.outlook.com:587
ALERTMANAGER_SMTP_USERNAME=your-email@outlook.com
ALERTMANAGER_SMTP_PASSWORD=your-account-password
```

### Yahoo Mail
```bash
ALERTMANAGER_SMTP_HOST=smtp.mail.yahoo.com:587
ALERTMANAGER_SMTP_USERNAME=your-email@yahoo.com
ALERTMANAGER_SMTP_PASSWORD=your-app-password           # Yahoo 앱 비밀번호 필요
```

### Naver Mail
```bash
ALERTMANAGER_SMTP_HOST=smtp.naver.com:587
ALERTMANAGER_SMTP_USERNAME=your-email@naver.com
ALERTMANAGER_SMTP_PASSWORD=your-account-password
```

### 기업용 SMTP 서버
```bash
ALERTMANAGER_SMTP_HOST=mail.your-company.com:587
ALERTMANAGER_SMTP_USERNAME=alerts@your-company.com
ALERTMANAGER_SMTP_PASSWORD=your-smtp-password
```

## 설정 확인 방법

### 1. SMTP 연결 테스트
```bash
# telnet으로 SMTP 서버 연결 확인
telnet smtp.gmail.com 587

# 또는 openssl로 보안 연결 확인
openssl s_client -connect smtp.gmail.com:587 -starttls smtp
```

### 2. AlertManager 설정 검증
```bash
# AlertManager 재시작 후 로그 확인
docker-compose -f docker-compose.monitoring.yml logs alertmanager

# 테스트 알림 발송 (AlertManager API 사용)
curl -X POST http://localhost:9093/api/v1/alerts \
  -H "Content-Type: application/json" \
  -d '[{
    "labels": {"alertname": "TestAlert", "instance": "test"},
    "annotations": {"summary": "This is a test alert"}
  }]'
```

## 보안 주의사항

### 환경변수 보안
```bash
# 1. 파일 권한 제한
chmod 600 monitoring/.env

# 2. Git에서 제외 확인
git status  # monitoring/.env가 추적되지 않는지 확인

# 3. 앱 비밀번호 관리
# - 정기적으로 앱 비밀번호 교체
# - 사용하지 않는 앱 비밀번호는 즉시 삭제
```

### 이메일 보안
- ✅ 앱 비밀번호 사용 (Gmail, Yahoo)
- ✅ TLS/STARTTLS 암호화 (포트 587)
- ❌ 일반 계정 비밀번호 사용 금지
- ❌ 평문 연결 (포트 25) 사용 금지

## 알림 설정 예시

### 기본 알림 설정
```yaml
# monitoring/alertmanager/alertmanager.yml
route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'email-alerts'

receivers:
- name: 'email-alerts'
  email_configs:
  - to: 'admin@company.com'
    from: 'alerts@ecommerce-app.com'
    subject: '[{{ .Status | toUpper }}] {{ .GroupLabels.alertname }}'
    body: |
      {{ range .Alerts }}
      Alert: {{ .Annotations.summary }}
      Description: {{ .Annotations.description }}
      {{ end }}
```

### 심각도별 알림 설정
```yaml
route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'default'
  routes:
  - match:
      severity: critical
    receiver: 'critical-alerts'
  - match:
      severity: warning
    receiver: 'warning-alerts'

receivers:
- name: 'critical-alerts'
  email_configs:
  - to: 'oncall@company.com'
    subject: '[CRITICAL] {{ .GroupLabels.alertname }}'

- name: 'warning-alerts'
  email_configs:
  - to: 'team@company.com'
    subject: '[WARNING] {{ .GroupLabels.alertname }}'
```

## 테스트 방법

### 1. 설정 완료 후 테스트
```bash
# 1. 모니터링 스택 재시작
./start-monitoring.sh

# 2. AlertManager 웹 UI 접속
# http://localhost:9093

# 3. 임시 알림 생성하여 이메일 발송 확인
```

### 2. 실제 알림 트리거
```bash
# CPU 사용률 100% 만들어서 알림 확인
stress --cpu 8 --timeout 60s

# 또는 서비스 중단으로 알림 확인
docker stop prometheus
```

## 트러블슈팅

### Gmail 연결 실패
```
원인: 2단계 인증 미활성화 또는 일반 비밀번호 사용
해결: Google 계정에서 2단계 인증 활성화 후 앱 비밀번호 생성
```

### 이메일 미발송
```
원인: AlertManager 설정 오류 또는 SMTP 인증 실패
해결: AlertManager 로그 확인 및 SMTP 설정 검증
```

### 스팸 메일함 이동
```
원인: 발신자 신뢰도 부족
해결: SPF, DKIM 레코드 설정 (도메인 보유 시)
```

## PagerDuty 연동 (향후 사용)

### 언제 필요한가요?
PagerDuty는 **24/7 운영이 필요한 프로덕션 환경**에서 사용하는 전문적인 인시던트 관리 시스템입니다.

**개인/소규모 프로젝트**: Gmail + Slack 알림으로 충분
**기업/대규모 서비스**: PagerDuty 필요 (온콜 로테이션, 전화 알림, 에스컬레이션)

### 향후 PagerDuty 설정 방법
```bash
# 1. PagerDuty.com에서 계정 생성
# 2. Service 생성 후 Integration Key 발급
# 3. 환경변수 추가
PAGERDUTY_INTEGRATION_KEY=your-integration-key

# 4. AlertManager 설정 추가
receivers:
  - name: 'pagerduty-critical'
    pagerduty_configs:
      - routing_key: '${PAGERDUTY_INTEGRATION_KEY}'
        description: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
```

### PagerDuty 장점
- **전화/SMS 알림**: 이메일을 놓칠 수 있는 Critical 장애
- **온콜 로테이션**: 여러 개발자 간 교대 근무
- **자동 에스컬레이션**: 1차 담당자 미응답 시 상급자에게 알림
- **인시던트 추적**: 장애 대응 기록 및 분석

---

💡 **팁**: 개발/테스트 환경에서는 Gmail로 시작하고, 프로덕션에서는 기업용 SMTP 서버 사용을 권장합니다.
