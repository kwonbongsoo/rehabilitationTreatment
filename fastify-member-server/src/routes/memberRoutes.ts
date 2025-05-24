import { FastifyInstance } from 'fastify';
import {
    createMemberHandler,
    getMemberHandler,
    updateMemberHandler,
    deleteMemberHandler,
} from '../controllers/memberController';
import {
    getMemberSchema,
    createMemberSchema,
    updateMemberSchema
} from '../schemas/memberSchemas';

async function memberRoutes(fastify: FastifyInstance) {
    // 인증이 필요 없는 엔드포인트
    fastify.post('/', { schema: createMemberSchema }, createMemberHandler);

    // 인증이 필요한 엔드포인트
    fastify.get('/:id', {
        schema: getMemberSchema
    }, getMemberHandler);

    fastify.put('/:id', {
        schema: updateMemberSchema
    }, updateMemberHandler);

    fastify.delete('/:id', {
        schema: getMemberSchema,
    }, deleteMemberHandler);
}

export default memberRoutes;