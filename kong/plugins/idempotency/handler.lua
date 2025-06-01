-- Kong 멱등성 플러그인 핸들러
local IdempotencyHandler = {}

IdempotencyHandler.VERSION = "1.0.0"
IdempotencyHandler.PRIORITY = 1000

local redis = require "resty.redis"
local cjson = require "cjson"

function IdempotencyHandler:access(conf)
    local method = kong.request.get_method()
    local path = kong.request.get_path()
    
    -- 멱등성이 필요한 요청인지 확인
    if not self:needs_idempotency_check(method, path, conf) then
        return
    end
    
    local idempotency_key = kong.request.get_header(conf.header_name or "X-Idempotency-Key")
    
    if not idempotency_key then
        return kong.response.exit(400, {
            error = "Missing " .. (conf.header_name or "X-Idempotency-Key") .. " header for idempotent operation"
        })
    end
      -- Redis 연결 개선
    local red = redis:new()
    -- 타임아웃 설정: connect, send, read (모두 5초로 증가)
    red:set_timeouts(5000, 5000, 5000)
    
    local ok, err = red:connect(conf.redis_host, conf.redis_port)
    if not ok then
        kong.log.err("Failed to connect to Redis: ", err)
        return -- 멱등성 체크 실패 시 요청 계속 진행
    end
    
    -- Redis 인증 (패스워드가 있는 경우)
    if conf.redis_password and conf.redis_password ~= "" then
        local auth_res, auth_err = red:auth(conf.redis_password)
        if not auth_res then
            kong.log.err("Failed to authenticate with Redis: ", auth_err)
            red:close()
            return
        end
    end
    
    -- Redis DB 선택 (0번 DB만 사용)
    if conf.redis_database and conf.redis_database > 0 then
        local select_res, select_err = red:select(conf.redis_database)
        if not select_res then
            kong.log.err("Failed to select Redis database: ", select_err)
            red:close()
            return
        end
    end
    
    -- 멱등성 키로 기존 응답 확인
    local cache_key = "kong-idempotency:" .. idempotency_key
    local cached_response, err = red:get(cache_key)
    
    if cached_response and cached_response ~= ngx.null then
        -- 이미 처리된 요청 - 캐시된 응답 반환
        local response_data = cjson.decode(cached_response)
        
        -- 헤더 설정
        for key, value in pairs(response_data.headers or {}) do
            kong.response.set_header(key, value)
        end
        
        kong.response.set_header("X-Idempotency-Replayed", "true")
        
        red:close()
        
        return kong.response.exit(
            response_data.status or 200,
            response_data.body
        )
    end
    
    -- 새로운 요청 - 컨텍스트에 멱등성 키 저장
    kong.ctx.plugin.idempotency_key = idempotency_key
    kong.ctx.plugin.cache_key = cache_key
    kong.ctx.plugin.redis_connection = red
    kong.ctx.plugin.ttl = conf.ttl or 60
end

function IdempotencyHandler:body_filter(conf)
    local ctx = kong.ctx.plugin
    if not ctx.idempotency_key then
        return
    end
    
    -- 응답 캐싱 (성공한 경우만)
    local status = kong.response.get_status()
    if status >= 200 and status < 300 then
        local body = kong.response.get_raw_body()
        local headers = kong.response.get_headers()
        
        local response_data = {
            status = status,
            body = cjson.decode(body or "{}"),
            headers = headers,
            timestamp = ngx.time()
        }
          -- Redis에 응답 캐시 (안전한 처리)
        local red = ctx.redis_connection
        if red then
            local success, cache_result = pcall(function()
                return red:setex(ctx.cache_key, ctx.ttl, cjson.encode(response_data))
            end)
            
            if not success then
                kong.log.err("Failed to cache response: ", cache_result)
            elseif not cache_result then
                kong.log.err("Redis setex returned false")
            else
                kong.log.info("Response successfully cached for key: ", ctx.idempotency_key)
            end
            
            -- 연결 안전하게 종료
            pcall(function() red:close() end)
        end
    elseif ctx.redis_connection then
        -- 실패한 경우 Redis 연결만 닫기
        pcall(function() ctx.redis_connection:close() end)
    end
end

function IdempotencyHandler:needs_idempotency_check(method, path, conf)
    -- 설정된 메서드에 대해서만 체크
    local methods = conf.methods or { "POST", "PUT", "PATCH" }
    local method_allowed = false
    
    for _, allowed_method in ipairs(methods) do
        if method == allowed_method then
            method_allowed = true
            break
        end
    end
    
    if not method_allowed then
        return false
    end
    
    -- 설정된 경로 패턴과 매칭
    for _, pattern in ipairs(conf.paths or {}) do
        if ngx.re.match(path, pattern) then
            return true
        end
    end
    
    return false
end

function IdempotencyHandler:log(conf)
    local ctx = kong.ctx.plugin
    
    if ctx.idempotency_key then
        -- 멱등성 키 사용 로그
        kong.log.info("Idempotency key used: ", ctx.idempotency_key)
        
        -- 메트릭 수집
        local replayed = kong.response.get_header("X-Idempotency-Replayed")
        if replayed then
            kong.log.info("Idempotent request replayed")
        end
    end
end

return IdempotencyHandler
