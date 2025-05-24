export interface MemberInput {
    id: string;
    email: string;
    name: string;
    password: string;
}

export interface MemberOutput {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

// fastify의 요청 타입에 prisma 추가
declare module 'fastify' {
    interface FastifyInstance {
        prisma: import('@prisma/client').PrismaClient;
    }
}