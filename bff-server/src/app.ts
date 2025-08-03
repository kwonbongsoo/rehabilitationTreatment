import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { requestLogger } from './middleware/requestLogger';
import homePageRoutes from './routes/homePageRoutes';
import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
// import { authRoutes } from './routes/authRoutes';
// import { memberRoutes } from './routes/memberRoutes';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
    bodyLimit: 20 * 1024 * 1024, // 20MB
  });

  // Register Swagger
  await app.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'BFF Server API',
        description: 'Backend for Frontend server that aggregates auth and member services',
        version: '1.0.0',
      },
      servers: [
        {
          url: process.env.SERVER_URL || 'http://localhost:3001',
          description: 'Development server',
        },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject) => {
      return swaggerObject;
    },
  });

  // Register plugins
  await app.register(helmet);
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || true,
  });
  await app.register(compress);
  
  // Register multipart support for file uploads
  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB per file
      files: 10, // Maximum 10 files
    },
  });

  // Request logging hook
  app.addHook('onRequest', requestLogger);

  // Global error handler
  app.setErrorHandler(async (error, request, reply) => {
    const status = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    app.log.error(`Error ${status}: ${message}`, {
      url: request.url,
      method: request.method,
      error: error.stack,
    });

    reply.status(status).send({
      error: {
        message,
        status,
        code: error.code,
        timestamp: new Date().toISOString(),
      },
    });
  });

  // Health check endpoint
  app.get('/health', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'bff-server',
      uptime: process.uptime(),
    };
  });

  // API routes will be registered here
  await app.register(homePageRoutes);
  await app.register(categoryRoutes);
  await app.register(productRoutes, { prefix: '/api' });
  // await app.register(authRoutes, { prefix: '/api/auth' });
  // await app.register(memberRoutes, { prefix: '/api/members' });

  return app;
}
