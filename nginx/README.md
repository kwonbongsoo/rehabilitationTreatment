# 🌐 Nginx 로드밸런서 가이드

프로덕션 환경에서 **nginx가 로드밸런서 역할**을 하는 완전한 설정입니다.

## 🔄 아키텍처 플로우

```
Client → nginx (80/443) → proxy-server (9000) → Kong Gateway (8000) → Backend Services
                     └→ Kong Gateway (8000) → Backend Services
```

### 상세 라우팅

1. **정적 자산 및 Next.js**: `Client → nginx → proxy-server → ecommerce-app`
2. **API 요청**: `Client → nginx → Kong Gateway → Backend Services`
3. **SSL 종료**: nginx에서 HTTPS 처리
4. **로드밸런싱**: nginx에서 업스트림 서버 분산

## 📁 디렉토리 구조

```
nginx/
├── nginx.conf          # nginx 메인 설정 파일
├── README.md           # 이 가이드
└── ssl/
    ├── README.md       # SSL 인증서 가이드
    ├── generate-cert.sh # 자체 서명 인증서 생성 스크립트
    ├── .gitignore      # SSL 파일 Git 제외
    ├── server.crt      # SSL 인증서 (생성 후)
    └── server.key      # SSL 개인키 (생성 후)
```

## 🚀 프로덕션 환경 실행

### 1. SSL 인증서 생성 (개발/테스트용)
```bash
# Git Bash 또는 WSL에서 실행
cd nginx/ssl
bash generate-cert.sh
```

### 2. 프로덕션 모드로 실행
```bash
docker-compose -f docker-compose.yaml -f docker-compose.prod.yml up --build -d
```

### 3. 서비스 확인
```bash
# HTTP (자동으로 HTTPS로 리다이렉트)
curl http://localhost/health

# HTTPS (실제 서비스)
curl -k https://localhost/health
curl -k https://localhost/api/health
```

## ⚙️ nginx 설정 특징

### 🔒 보안 기능
- **HTTPS 강제**: HTTP → HTTPS 자동 리다이렉트
- **보안 헤더**: XSS, CSRF, Clickjacking 방어
- **Rate Limiting**: DDoS 공격 방어
- **SSL/TLS**: 최신 암호화 프로토콜

### ⚡ 성능 최적화
- **Gzip 압축**: 텍스트 파일 압축 전송
- **Keep-Alive**: HTTP 연결 재사용
- **정적 자산 캐싱**: 1년 캐시 설정
- **업스트림 연결 풀**: 백엔드 연결 최적화

### 📊 모니터링
- **액세스 로그**: 상세한 요청 로그
- **업스트림 메트릭**: 응답 시간, 연결 상태
- **nginx 상태**: `/nginx_status` 엔드포인트

## 🛣️ 라우팅 규칙

### API 요청 (`/api/`)
```nginx
location /api/ {
    # Kong Gateway로 프록시
    proxy_pass http://kong_backend;
    # Rate Limiting: 100 RPS
    limit_req zone=api burst=20 nodelay;
}
```

### 정적 자산 및 Next.js (`/`)
```nginx
location / {
    # Proxy Server로 프록시
    proxy_pass http://proxy_backend;
    # Rate Limiting: 10 RPS
    limit_req zone=general burst=10 nodelay;
}
```

### 정적 파일 캐싱
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 📈 성능 메트릭

### 업스트림 서버 상태
```bash
# nginx 상태 확인 (내부 네트워크에서만)
curl http://localhost/nginx_status
```

### 로그 분석
```bash
# 액세스 로그 실시간 확인
docker logs nginx-lb -f

# 에러 로그 확인
docker exec nginx-lb tail -f /var/log/nginx/error.log

# 응답 시간 통계
docker exec nginx-lb awk '{print $NF}' /var/log/nginx/access.log | grep -E '^[0-9]' | sort -n
```

## 🔧 설정 커스터마이징

### Rate Limiting 조정
```nginx
# nginx.conf에서
limit_req_zone $binary_remote_addr zone=api:10m rate=200r/s;  # API 200 RPS
limit_req_zone $binary_remote_addr zone=general:10m rate=50r/s;  # 일반 50 RPS
```

### 업스트림 서버 추가
```nginx
upstream proxy_backend {
    server proxy-server-1:9000 weight=2;
    server proxy-server-2:9000 weight=1;
    keepalive 32;
}
```

### SSL 설정 강화
```nginx
# HSTS 설정 강화
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

# OCSP Stapling 활성화 (공인 인증서 사용시)
ssl_stapling on;
ssl_stapling_verify on;
```

## 🚨 트러블슈팅

### SSL 인증서 문제
```bash
# 인증서 유효성 확인
openssl x509 -in nginx/ssl/server.crt -text -noout

# SSL 연결 테스트
openssl s_client -connect localhost:443 -servername localhost
```

### 업스트림 서버 연결 문제
```bash
# nginx 설정 테스트
docker exec nginx-lb nginx -t

# 업스트림 서버 연결 확인
docker exec nginx-lb nslookup proxy-server
docker exec nginx-lb nslookup kong
```

### 로드밸런싱 확인
```bash
# 여러 요청으로 분산 테스트
for i in {1..10}; do curl -s https://localhost/api/health; echo; done
```

## ⚠️ 주의사항

1. **SSL 인증서**: 프로덕션에서는 공인 SSL 인증서 사용
2. **방화벽**: 80, 443 포트만 외부에 노출
3. **로그 관리**: 로그 파일 크기 모니터링 및 로테이션
4. **보안 업데이트**: nginx 이미지 정기 업데이트

## 🎯 권장사항

1. **모니터링**: nginx 메트릭 수집 및 알림 설정
2. **백업**: nginx 설정 파일 정기 백업
3. **테스트**: 설정 변경 후 반드시 테스트
4. **문서화**: 커스텀 설정 변경사항 문서화

이제 **nginx가 완전한 로드밸런서 역할**을 하여 고가용성과 보안을 제공합니다! 🚀