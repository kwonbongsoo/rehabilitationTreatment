import Fastify, { FastifyInstance } from 'fastify';
import dotenv from 'dotenv';
import { buildApp } from './app';

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const HOST = process.env.HOST || '0.0.0.0';

async function startServer() {
  const app = await buildApp();

  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`🚀 BFF Server is running on ${HOST}:${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⚡ Using Fastify for optimal performance`);

    process.on('SIGINT', () => gracefulShutdown(app));
    process.on('SIGTERM', () => gracefulShutdown(app));
  } catch (error) {
    console.error('❌ Failed to start BFF server:', error);
    process.exit(1);
  }
}

async function gracefulShutdown(app: FastifyInstance) {
  console.log('🛑 Shutting down BFF server gracefully...');
  try {
    await app.close();
    console.log('✅ Server closed successfully');
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
  }
  process.exit(0);
}

if (require.main === module) {
  startServer();
}
