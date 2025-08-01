#!/bin/bash
# SSL 자체 서명 인증서 생성 스크립트
# 개발/테스트 환경용 - 프로덕션에서는 실제 SSL 인증서 사용

echo "🔐 SSL 자체 서명 인증서 생성 중..."

# 개인키 생성 (2048비트 RSA)
openssl genrsa -out server.key 2048

# 인증서 서명 요청(CSR) 생성
openssl req -new -key server.key -out server.csr -subj "/C=KR/ST=Seoul/L=Seoul/O=Development/OU=IT/CN=localhost"

# 자체 서명 인증서 생성 (365일 유효)
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt

# Subject Alternative Name (SAN) 포함한 인증서 생성
cat > server.conf <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = KR
ST = Seoul
L = Seoul
O = Development
OU = IT Department
CN = localhost

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
DNS.3 = 127.0.0.1
IP.1 = 127.0.0.1
IP.2 = ::1
EOF

# SAN이 포함된 새로운 인증서 생성
openssl req -new -x509 -key server.key -out server.crt -days 365 -config server.conf -extensions v3_req

# CSR 파일 정리
rm server.csr server.conf

# 권한 설정
chmod 600 server.key
chmod 644 server.crt

echo "✅ SSL 인증서 생성 완료!"
echo "📁 생성된 파일:"
echo "   - server.key (개인키)"
echo "   - server.crt (인증서)"
echo ""
echo "⚠️  주의: 이는 개발/테스트용 자체 서명 인증서입니다."
echo "   프로덕션 환경에서는 공인 SSL 인증서를 사용하세요."