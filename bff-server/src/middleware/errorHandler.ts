import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';

export interface ApiError extends FastifyError {
  status?: number;
}

export async function errorHandler(
  error: ApiError,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const status = error.statusCode || error.status || 500;
  const message = error.message || 'Internal Server Error';

  request.log.error(`Error ${status}: ${message}`, {
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
}
