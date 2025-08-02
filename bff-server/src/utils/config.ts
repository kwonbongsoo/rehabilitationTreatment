import { ServiceEndpoints } from '../types';

export const serviceEndpoints: ServiceEndpoints = {
  auth: {
    baseURL: process.env.AUTH_SERVICE_URL || 'http://koa-auth-server:4000',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
    },
  },
  member: {
    baseURL: process.env.MEMBER_SERVICE_URL || 'http://fastify-member-server:5000',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
    },
  },
  product: {
    baseURL: process.env.PRODUCT_SERVICE_URL || 'http://product-domain-server:3002/api/v1',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
    },
  },
};

export const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 3001,
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  requestTimeout: process.env.REQUEST_TIMEOUT ? Number(process.env.REQUEST_TIMEOUT) : 30000,
  productServiceUrl: process.env.PRODUCT_SERVICE_URL || 'http://product-domain-server:3002/api/v1',
  memberServiceUrl: process.env.MEMBER_SERVICE_URL || 'http://fastify-member-server:5000',
};
