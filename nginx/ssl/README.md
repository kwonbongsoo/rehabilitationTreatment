# SSL 인증서 설정 가이드

## 🔐 개발/테스트 환경 (자체 서명 인증서)

### Windows에서 SSL 인증서 생성
```powershell
# Git Bash 또는 WSL에서 실행
cd nginx/ssl
bash generate-cert.sh
```

### 수동으로 SSL 인증서 생성
```bash
# 1. 개인키 생성
openssl genrsa -out server.key 2048

# 2. 인증서 생성 (365일 유효)
openssl req -new -x509 -key server.key -out server.crt -days 365 \
  -subj "/C=KR/ST=Seoul/L=Seoul/O=Development/OU=IT/CN=localhost"
```

### 브라우저에서 자체 서명 인증서 허용
1. Chrome/Edge: `thisisunsafe` 타이핑
2. Firefox: "고급" → "위험을 감수하고 계속"
3. 또는 브라우저에 인증서 추가

## 🚀 프로덕션 환경 (공인 SSL 인증서)

### Let's Encrypt 무료 SSL 인증서
```bash
# Certbot 설치 (Ubuntu/Debian)
sudo apt update
sudo apt install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d yourdomain.com

# 자동 갱신 설정
sudo crontab -e
# 다음 라인 추가:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### 상용 SSL 인증서 사용
1. SSL 인증서 구매 (Comodo, DigiCert 등)
2. 파일을 다음과 같이 배치:
   ```
   nginx/ssl/
   ├── server.crt    # SSL 인증서
   ├── server.key    # 개인키
   └── chain.crt     # 중간 인증서 (선택)
   ```

### nginx 설정에서 체인 인증서 사용 (필요시)
```nginx
# nginx.conf에서
ssl_certificate /etc/nginx/ssl/fullchain.crt;  # 인증서 + 체인
ssl_certificate_key /etc/nginx/ssl/server.key;
```

## 🔒 보안 권장사항

### 파일 권한 설정
```bash
# 개인키는 읽기 전용으로 설정
chmod 600 server.key

# 인증서는 읽기 가능하게 설정
chmod 644 server.crt
```

### SSL 설정 점검
```bash
# SSL 인증서 정보 확인
openssl x509 -in server.crt -text -noout

# SSL 연결 테스트
openssl s_client -connect localhost:443 -servername localhost
```

### SSL 보안 등급 테스트
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)
- [testssl.sh](https://testssl.sh/)

## 📁 디렉토리 구조

```
nginx/
├── nginx.conf          # nginx 메인 설정
└── ssl/
    ├── README.md        # 이 파일
    ├── generate-cert.sh # 인증서 생성 스크립트
    ├── server.crt       # SSL 인증서 (생성 후)
    └── server.key       # 개인키 (생성 후)
```

## ⚠️ 주의사항

1. **개인키 보안**: `server.key` 파일은 절대 공개하지 마세요
2. **Git 제외**: 인증서 파일은 `.gitignore`에 추가하세요
3. **프로덕션**: 자체 서명 인증서는 개발/테스트용으로만 사용
4. **갱신**: SSL 인증서는 만료 전에 갱신해야 합니다