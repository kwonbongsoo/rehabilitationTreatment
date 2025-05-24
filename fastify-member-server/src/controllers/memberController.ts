
import { FastifyRequest, FastifyReply } from 'fastify';
import { MemberService } from '../services/memberService';
import { MemberInput } from '../types/member';

interface RequestParams {
    id: string;
}

// 멤버 생성
export async function createMemberHandler(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    const { prisma } = request.server;
    const memberService = new MemberService(prisma);

    try {
        // 스키마에 의해 이미 검증된 데이터
        const body = request.body as MemberInput;
        const newMember = await memberService.create(body);
        reply.code(201).send(newMember);
    } catch (error) {
        // 에러 핸들러로 전달
        throw error;
    }
}

// 단일 멤버 조회
export async function getMemberHandler(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    const { prisma } = request.server;
    const memberService = new MemberService(prisma);

    const parmas = request.params as RequestParams;
    const id = parmas.id;

    const member = await memberService.findById(id);
    reply.send(member);
}

// 멤버 정보 업데이트
export async function updateMemberHandler(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    const { prisma } = request.server;
    const memberService = new MemberService(prisma);

    const parmas = request.params as RequestParams;
    const id = parmas.id;
    const updateData = request.body as Partial<MemberInput>;

    const updatedMember = await memberService.update(id, updateData);
    reply.send(updatedMember);
}

// 멤버 삭제
export async function deleteMemberHandler(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    const { prisma } = request.server;
    const memberService = new MemberService(prisma);

    const parmas = request.params as RequestParams;
    const id = parmas.id;

    await memberService.delete(id);
    reply.code(204).send();
}