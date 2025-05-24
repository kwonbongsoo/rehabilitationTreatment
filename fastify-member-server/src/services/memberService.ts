import { PrismaClient } from '@prisma/client';
import { MemberInput, MemberOutput } from '../types/member';
import { BadRequestError, NotFoundError } from '../utils/errors';
import bcrypt from 'bcryptjs';

export class MemberService {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async create(memberData: MemberInput): Promise<MemberOutput> {
        // 중복 이메일 체크
        const existingEmailMember = await this.prisma.member.findUnique({
            where: { email: memberData.email }
        });

        const existingIdMember = await this.prisma.member.findUnique({
            where: { id: memberData.id }
        });

        if (existingEmailMember && existingIdMember) {
            throw new BadRequestError('Email already registered');
        }

        // 비밀번호 해시화
        const hashedPassword = await bcrypt.hash(memberData.password, 10);

        const newMember = await this.prisma.member.create({
            data: {
                ...memberData,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return newMember;
    }

    async findById(id: string): Promise<MemberOutput> {
        const member = await this.prisma.member.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!member) {
            throw new NotFoundError(`Member with ID ${id} not found`);
        }

        return member;
    }

    async findByEmail(email: string): Promise<MemberOutput | null> {
        const member = await this.prisma.member.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return member;
    }

    async update(id: string, updateData: Partial<MemberInput>): Promise<MemberOutput> {
        // 존재하는 멤버인지 확인
        const existingMember = await this.prisma.member.findUnique({
            where: { id }
        });

        if (!existingMember) {
            throw new NotFoundError(`Member with ID ${id} not found`);
        }

        // 이메일 변경 시 중복 체크
        if (updateData.email && updateData.email !== existingMember.email) {
            const emailExists = await this.prisma.member.findFirst({
                where: {
                    email: updateData.email,
                    id: { not: id }
                }
            });

            if (emailExists) {
                throw new BadRequestError('Email already in use');
            }
        }

        // 비밀번호 변경 시 해시화
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        const updatedMember = await this.prisma.member.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return updatedMember;
    }

    async delete(id: string): Promise<void> {
        const member = await this.prisma.member.findUnique({
            where: { id }
        });

        if (!member) {
            throw new NotFoundError(`Member with ID ${id} not found`);
        }

        await this.prisma.member.delete({
            where: { id }
        });
    }
}