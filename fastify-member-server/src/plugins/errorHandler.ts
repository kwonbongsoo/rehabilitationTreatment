import { FastifyInstance } from 'fastify';

export default async function errorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler((error, request, reply) => {
    const statusCode = error.statusCode || 500;
    
    fastify.log.error(error);
    
    reply
      .status(statusCode)
      .send({
        error: error.name || 'InternalServerError',
        message: error.message || 'An internal server error occurred',
        statusCode
      });
  });
}