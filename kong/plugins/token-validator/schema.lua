local typedefs = require "kong.db.schema.typedefs"

return {
  name = "token-validator",
  fields = {
    { consumer = typedefs.no_consumer },
    { protocols = typedefs.protocols_http },
    {
      config = {
        type = "record",
        fields = {
          { auth_server_url = { type = "string", required = true } },
          { token_header = { type = "string", required = true } },
          { token_prefix = { type = "string", required = true } }
        }
      }
    }
  }
} 