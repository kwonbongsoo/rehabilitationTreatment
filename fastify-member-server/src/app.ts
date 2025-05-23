import Fastify from 'fastify';
import { setMemberRoutes } from './routes/memberRoutes';

const fastify = Fastify();

fastify.register(setMemberRoutes);

async function start() {
  try {
    const address = await fastify.listen({ port: 5000, host: '0.0.0.0' });
    console.log(`Server is running at ${address}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();