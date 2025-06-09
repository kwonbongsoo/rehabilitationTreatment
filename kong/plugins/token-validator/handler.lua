local TokenValidator = {}

-- 플러그인 우선순위 설정 (높을수록 먼저 실행)
TokenValidator.PRIORITY = 1000

-- 플러그인 버전 설정
TokenValidator.VERSION = "1.0.0"

-- 토큰 검증 함수
local function validate_token(token, config)
  local http = require "resty.http"
  local httpc = http.new()
  
  local res, err = httpc:request_uri(config.auth_server_url .. "/api/auth/verify", {
    method = "GET",
    headers = {
      ["Authorization"] = config.token_prefix .. token
    }
  })
  
  if not res then
    return nil, "Unauthorized"
  end
  
  if res.status ~= 200 then
    return false, "Unauthorized"
  end
  
  return true
end

-- 경로가 예외 목록에 있는지 확인
local function is_path_excluded(path, config)
  if not config.skip_paths then
    return false
  end
  
  for _, skip_path in ipairs(config.skip_paths) do
    if path:match("^" .. skip_path) then
      return true
    end
  end
  
  return false
end

-- Kong 플러그인 메서드 구현
function TokenValidator:init_worker()
  -- 워커 초기화 시 필요한 작업
end

function TokenValidator:access(config)
  local path = ngx.var.request_uri
  
  -- 예외 경로 체크
  if is_path_excluded(path, config) then
    return
  end
  
  local token = ngx.req.get_headers()[config.token_header]
  if not token then
    return kong.response.exit(403, { 
      message = "Forbidden"
    })
  end
  
  -- Bearer 토큰에서 실제 토큰 추출
  local token_value = token:match(config.token_prefix .. "(.+)")
  if not token_value then
    return kong.response.exit(403, { 
      message = "Forbidden"
    })
  end
  
  -- Auth 서버에서 토큰 검증
  local is_valid, err = validate_token(token_value, config)
  if not is_valid then
    return kong.response.exit(401, { 
      message = "Unauthorized"
    })
  end
end

return TokenValidator 