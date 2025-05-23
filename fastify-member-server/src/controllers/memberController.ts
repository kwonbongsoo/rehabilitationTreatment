import { FastifyRequest, FastifyReply } from 'fastify';
import { MemberService } from '../services/memberService';

export class MemberController {
    private memberService = new MemberService();

    async registerUser(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { username, email, password } = request.body as any;
            const user = await this.memberService.register({ username, email, password });
            reply.status(201).send(user);
        } catch (err: any) {
            reply.status(err.status || 400).send({ message: err.message });
        }
    }

    async updateUser(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as any;
            const update = request.body as any;
            const user = await this.memberService.update(id, update);
            reply.send(user);
        } catch (err: any) {
            reply.status(err.status || 400).send({ message: err.message });
        }
    }

    async getUser(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as any;
            const user = await this.memberService.getById(id);
            reply.send(user);
        } catch (err: any) {
            reply.status(err.status || 404).send({ message: err.message });
        }
    }

    async deleteUser(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as any;
            await this.memberService.delete(id);
            reply.send({ message: '탈퇴 완료' });
        } catch (err: any) {
            reply.status(err.status || 404).send({ message: err.message });
        }
    }

    async login(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { username, password } = request.body as any;
            const user = await this.memberService.login(username, password);
            reply.send({ message: '로그인 성공', user });
        } catch (err: any) {
            reply.status(err.status || 401).send({ message: err.message });
        }
    }
}