import { FastifyRequest, FastifyReply } from 'fastify';

export async function requestLogger(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const start = Date.now();

  // Store start time for later use
  (request as any)._startTime = start;

  request.log.info(`${request.method} ${request.url} - Started - ${request.ip}`);
}
