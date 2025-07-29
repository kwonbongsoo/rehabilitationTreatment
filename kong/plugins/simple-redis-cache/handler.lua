-- kong/plugins/simple-redis-cache/handler.lua
local redis = require "resty.redis"
local json = require "cjson"
local ngx = ngx
local kong = kong

local SimpleRedisCacheHandler = {
  PRIORITY = 1000,  -- 높은 우선순위
  VERSION = "1.0.0"
}

-- 단순화된 Redis 연결 함수 (베스트 프랙티스)
local function get_redis_connection(conf)
  local red = redis:new()
  red:set_timeout(conf.redis_timeout or 2000)
  
  -- 기본 Redis 연결 (OpenResty 내장 연결 풀 사욨)
  local ok, err = red:connect(conf.redis_host, conf.redis_port or 6379)
  if not ok then
    kong.log.err("Redis connection failed: ", err)
    return nil, err
  end
  
  -- Redis 인증
  if conf.redis_password then
    local res, err = red:auth(conf.redis_password)
    if not res then
      kong.log.err("Redis auth failed: ", err)
      red:close()
      return nil, err
    end
  end
  
  -- Redis DB 선택
  if conf.redis_database then
    local select_ok, select_err = red:select(conf.redis_database)
    if not select_ok then
      kong.log.err("Redis DB select failed: ", select_err)
      red:close()
      return nil, select_err
    end
  end
  
  return red, nil
end

-- 단순화된 Redis 연결 반환 함수
local function return_redis_connection(red, success)
  if not red then
    return
  end
  
  if success then
    -- 성공 시 OpenResty 내장 연결 풀에 반환
    local keepalive_timeout = 10000  -- 10초
    local pool_size = 20             -- 최대 20개 연결
    
    local keepalive_ok, keepalive_err = red:set_keepalive(keepalive_timeout, pool_size)
    if not keepalive_ok then
      kong.log.warn("Failed to set keepalive: ", keepalive_err)
      red:close()
    end
  else
    -- 실패 시 연결 닫기
    red:close()
  end
end

-- 요청 처리 전: 캐시 조회
function SimpleRedisCacheHandler:access(conf)
  -- GET 요청만 캐시
  local method = kong.request.get_method()
  if method ~= "GET" then
    return
  end
  
  -- 캐시 키 생성: "cache:METHOD:PATH" 형식 (쿼리 파라미터 제외)
  local path = kong.request.get_path()
  local cache_key = "cache:" .. method .. ":" .. path
  
  -- X-Cache-Refresh 헤더 확인 (warmup 요청 감지)
  local cache_refresh = kong.request.get_header("X-Cache-Refresh")
  if cache_refresh then
    kong.ctx.shared.cache_key = cache_key
    kong.ctx.shared.force_refresh = true
    return
  end

  -- Redis 연결 (풀에서 가져오기)
  local red, err = get_redis_connection(conf)
  if not red then
    kong.log.err("Failed to get Redis connection: ", err)
    return  -- 캐시 실패해도 원본 서비스로 진행
  end
  
  -- 캐시 조회
  local cached_response, err = red:get(cache_key)
  if err then
    kong.log.err("Redis GET error: ", err)
    return_redis_connection(red, false)
    return
  end
  
  -- 캐시 히트
  if cached_response and cached_response ~= ngx.null then
    
    local response_data = json.decode(cached_response)
    
    -- 캐시된 헤더 설정
    if response_data.headers then
      for key, value in pairs(response_data.headers) do
        kong.response.set_header(key, value)
      end
    end
    
    -- 캐시 상태 헤더 추가
    kong.response.set_header("X-Cache-Status", "HIT")
    kong.response.set_header("X-Cache-Key", cache_key)
    kong.response.set_header("X-Cache-Age", ngx.time() - (response_data.cached_at or 0))
    
    -- 연결을 풀에 반환
    return_redis_connection(red, true)
    
    -- 캐시된 응답으로 즉시 응답
    kong.response.exit(response_data.status or 200, response_data.body)
  end
  
  -- 캐시 미스: 캐시 키만 저장
  kong.ctx.shared.cache_key = cache_key
  
  -- 연결을 풀에 반환
  return_redis_connection(red, true)
end

-- 응답 헤더 처리: 캐시 상태 헤더 설정 및 캐시 저장 준비
function SimpleRedisCacheHandler:header_filter(conf)
  local cache_key = kong.ctx.shared.cache_key
  
  if not cache_key then
    return
  end
  
  local status = kong.response.get_status()
  
  -- 캐시할 상태 코드 확인
  local cacheable_codes = {200, 301, 302}
  local should_cache = false
  
  for _, code in ipairs(cacheable_codes) do
    if status == code then
      should_cache = true
      break
    end
  end
  
  if not should_cache then
    kong.log.info("Status code not cacheable: ", status)
    return
  end
  
  -- Cache-Control 헤더 확인
  local cache_control = kong.response.get_header("cache-control")
  if cache_control then
    if string.find(cache_control:lower(), "no-cache") or 
       string.find(cache_control:lower(), "no-store") or 
       string.find(cache_control:lower(), "private") then
      kong.log.info("Cache-Control prevents caching")
      return
    end
  end
  
  -- 캐시 가능하므로 상태 저장
  kong.ctx.shared.should_cache = true
  kong.ctx.shared.cache_status = status
  kong.ctx.shared.cache_headers = kong.response.get_headers()
  kong.ctx.shared.cache_ttl = conf.cache_ttl or 300
  
  -- 캐시 상태 헤더 추가
  kong.response.set_header("X-Cache-Status", "MISS")
  kong.response.set_header("X-Cache-Key", cache_key)
  kong.response.set_header("X-Cache-TTL", tostring(conf.cache_ttl or 300))
end

-- 단순화된 비동기 캐시 저장 함수
local function async_cache_store(premature, cache_key, cache_data, conf)
  if premature then
    return
  end
  
  -- 백그라운드 Redis 연결
  local red, err = get_redis_connection(conf)
  if not red then
    kong.log.err("Background cache failed - connection: ", err)
    return
  end
  
  -- JSON 직렬화
  local cache_json, err = json.encode(cache_data)
  if not cache_json then
    kong.log.err("Background cache failed - encode: ", err)
    return_redis_connection(red, false)
    return
  end
  
  -- Redis 저장
  local ttl = conf.cache_ttl or 300
  local ok, err = red:setex(cache_key, ttl, cache_json)
  
  if not ok then
    kong.log.err("Background cache failed: ", err)
    return_redis_connection(red, false)
  else
    kong.log.info("Cached: ", cache_key, " (", ttl, "s, ", #cache_json, " bytes)")
    return_redis_connection(red, true)
  end
end

-- 응답 본문 처리: 비동기 캐시 전략
function SimpleRedisCacheHandler:body_filter(conf)
  if not kong.ctx.shared.should_cache then
    return
  end
  
  -- 응답 본문 수집
  local body = kong.response.get_raw_body()
  if not body or #body == 0 then
    return
  end
  
  -- 응답 크기 체크
  if #body > (conf.max_body_size or 1024 * 1024) then
    return
  end
  
  -- 캐시 데이터 준비
  local cache_data = {
    status = kong.ctx.shared.cache_status,
    headers = kong.ctx.shared.cache_headers,
    body = body,
    cached_at = ngx.time(),
    content_type = kong.ctx.shared.cache_headers["content-type"]
  }
  
  -- 비동기 백그라운드 저장 (네트워크 비차단 방식)
  local ok, err = ngx.timer.at(0, async_cache_store, kong.ctx.shared.cache_key, cache_data, conf)
  if not ok then
    kong.log.err("Failed to create background cache timer: ", err)
  end
end

return SimpleRedisCacheHandler