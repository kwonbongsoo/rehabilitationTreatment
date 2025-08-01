export interface TokenData {
  access_token: string;
  role: string;
  maxAge: number;
}

export interface AuthServiceResponse {
  success: boolean;
  data?: {
    access_token: string;
    role: string;
    exp: number;
    iat: number;
  };
  message?: string;
  error?: string;
}

export interface ProxyConfig {
  port: number;
  nextServer: string;
  kongGatewayUrl: string;
  nodeEnv: string;
  enableRequestLogging: boolean;
  logLevel: string;
  authServiceUrl: string;
  warmupToken: string;
  redis: {
    url: string;
    port: number;
    db: number;
    password: string;
  };
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  timestamp: string;
}
