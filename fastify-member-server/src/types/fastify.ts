import { FastifyInstance } from 'fastify'

declare module 'fastify' {
    interface FastifyInstance {
        diContainer: {
            resolve<T>(key: string): T;
        };
    }
}