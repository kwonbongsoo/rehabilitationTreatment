# Kong API Gateway 인증 및 멱등성 설정

## JWT 인증 플러그인 적용

- Kong 공식 JWT 플러그인을 사용하여 API 인증을 처리합니다.
- Authorization 헤더에 JWT 토큰을 담아 요청하면, Kong이 토큰의 유효성을 검증합니다.
- guest, user 두 종류의 토큰을 모두 허용하며, 두 토큰 모두 같은 시크릿 값을 사용합니다.
- JWT 토큰의 `kid` 값이 `guest-key` 또는 `user-key`이면 모두 허용됩니다.
- 토큰의 최대 만료 허용 시간(`maximum_expiration`)은 4시간(14,400초)입니다.

## 멱등성(Idempotency) 플러그인 적용

- 커스텀 Kong 플러그인(idempotency)을 사용하여 POST, PUT, PATCH 요청의 멱등성을 보장합니다.
- 클라이언트는 `X-Idempotency-Key` 헤더에 고유 키를 넣어 요청합니다.
- 동일한 키로 동일 요청이 여러 번 들어오면, 최초 응답을 Redis에 저장하고 이후에는 캐시된 응답을 반환합니다.
- Redis 연결 정보와 TTL(유효기간)은 환경 변수로 관리합니다.
- 멱등성 플러그인은 인증(JWT) 플러그인과 함께 동작할 수 있습니다.

## 환경 변수 예시 (.env)
```
JWT_SECRET=공통_시크릿값
REDIS_URL=redis
REDIS_PORT=6379
REDIS_PASSWORD=비밀번호_선택
REDIS_DB=0
IDEMPOTENCY_TTL=60
```

## kong.yml.template 주요 설정
```yaml
consumers:
  - username: guest
    jwt_secrets:
      - algorithm: HS256
        key: guest-key
        secret: "${JWT_SECRET}"
  - username: user
    jwt_secrets:
      - algorithm: HS256
        key: user-key
        secret: "${JWT_SECRET}"

# JWT 플러그인 설정 예시
- name: jwt
  config:
    header_names: ["Authorization"]
    claims_to_verify: ["exp"]
    key_claim_name: "kid"
    secret_is_base64: false
    maximum_expiration: 14400

# 멱등성 플러그인 설정 예시
- name: idempotency
  config:
    redis_host: "${REDIS_URL}"
    redis_port: ${REDIS_PORT}
    redis_password: "${REDIS_PASSWORD}"
    redis_database: ${REDIS_DB}
    ttl: ${IDEMPOTENCY_TTL}
    header_name: "X-Idempotency-Key"
    paths:
      - "/api/members"
    methods:
      - "POST"
      - "PUT"
      - "PATCH"
```

## 인증 및 멱등성 흐름
1. 클라이언트가 JWT 토큰을 발급받아 Authorization 헤더에 담아 요청합니다.
2. Kong이 JWT 플러그인으로 토큰의 유효성, 만료, 시크릿을 검증합니다.
3. kid 값이 guest-key 또는 user-key인 경우 모두 허용됩니다.
4. 만료(exp) 검증 및 4시간 초과 토큰은 거부됩니다.
5. POST/PUT/PATCH 요청 시 X-Idempotency-Key 헤더가 있으면 멱등성 플러그인이 동작합니다.
6. 동일 키로 중복 요청 시 최초 응답을 Redis에서 반환합니다. 