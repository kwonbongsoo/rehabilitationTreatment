-- Kong 멱등성 플러그인 스키마
local typedefs = require "kong.db.schema.typedefs"

return {
    name = "idempotency",
    fields = {
        { consumer = typedefs.no_consumer },
        { protocols = typedefs.protocols_http },
        { config = {
            type = "record",
            fields = {
                { redis_host = { type = "string", default = "localhost" } },
                { redis_port = { type = "integer", default = 6379 } },
                { redis_password = { type = "string" } },
                { redis_database = { type = "integer", default = 0 } },
                { ttl = { type = "integer", default = 60 } }, -- 1분
                { paths = { 
                    type = "array", 
                    elements = { type = "string" },
                    default = { "/.*" }
                } },
                { header_name = { type = "string", default = "X-Idempotency-Key" } },
                { methods = {
                    type = "array",
                    elements = { type = "string" },
                    default = { "POST", "PUT", "PATCH" }
                } }
            }
        } }
    }
}
