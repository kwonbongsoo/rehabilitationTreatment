import { FastifyRequest, FastifyReply } from 'fastify';

type RequestHandler = (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

// 비동기 핸들러를 에러 처리로 감싸는 고차 함수
export function withErrorHandling(
    handler: RequestHandler,
    errorHandler: (error: any, request: FastifyRequest, reply: FastifyReply) => void
): RequestHandler {
    return async (request, reply) => {
        try {
            await handler(request, reply);
        } catch (error) {
            errorHandler(error, request, reply);
        }
    };
}