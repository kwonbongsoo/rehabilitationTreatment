-- kong/plugins/simple-redis-cache/schema.lua
return {
  name = "simple-redis-cache",
  fields = {
    {
      config = {
        type = "record",
        fields = {
          -- Redis 연결 설정
          {
            redis_host = {
              type = "string",
              default = "redis",
              description = "Redis server hostname"
            }
          },
          {
            redis_port = {
              type = "number",
              default = 6379,
              description = "Redis server port"
            }
          },
          {
            redis_password = {
              type = "string",
              description = "Redis password (optional)"
            }
          },
          {
            redis_database = {
              type = "number",
              default = 1,
              description = "Redis database number for cache"
            }
          },
          {
            redis_timeout = {
              type = "number",
              default = 2000,
              description = "Redis connection timeout in milliseconds"
            }
          },
          
          -- 캐시 설정
          {
            cache_ttl = {
              type = "number",
              default = 300,
              description = "Cache TTL in seconds (default: 5 minutes)"
            }
          },
          {
            max_body_size = {
              type = "number",
              default = 1048576,  -- 1MB
              description = "Maximum response body size to cache in bytes"
            }
          },
          
          -- 단순화된 설정 (OpenResty 기본값 사용)
        }
      }
    }
  }
}