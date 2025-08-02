import type { ProxyConfig } from '../types';

export const config: ProxyConfig = {
  port: parseInt(process.env.PORT || '9000'),
  nextServer: process.env.NEXT_SERVER || 'http://localhost:3000',
  kongGatewayUrl: process.env.KONG_GATEWAY_URL || 'http://localhost:8000',
  nodeEnv: process.env.NODE_ENV || 'development',
  enableRequestLogging:
    process.env.ENABLE_REQUEST_LOGGING === 'true' || process.env.NODE_ENV === 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  authServiceUrl: process.env.AUTH_SERVICE_URL || '',
  authPrefix: process.env.AUTH_PREFIX || '',
  authBasicKey: process.env.AUTH_BASIC_KEY || '',
  warmupToken: process.env.WARMUP_TOKEN || '',
  redis: {
    url: process.env.REDIS_URL || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    db: parseInt(process.env.REDIS_DB || '0'),
    password: process.env.REDIS_PASSWORD || '',
  },
};

export function validateConfig(): void {
  const requiredFields = ['authServiceUrl'] as const;

  for (const field of requiredFields) {
    if (!config[field]) {
      throw new Error(`Missing required environment variable: ${field.toUpperCase()}`);
    }
  }
}

export function logConfig(): void {
  console.log('📋 Configuration:');
  console.log(`   - Environment: ${config.nodeEnv}`);
  console.log(`   - Port: ${config.port}`);
  console.log(`   - Next.js Server: ${config.nextServer}`);
  console.log(`   - Kong Gateway: ${config.kongGatewayUrl}`);
  console.log(`   - Request Logging: ${config.enableRequestLogging}`);
  console.log(`   - Log Level: ${config.logLevel}`);
  console.log(`   - Auth Service: ${config.authServiceUrl ? 'Configured' : 'Missing'}`);
}
