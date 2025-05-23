import { UserUpdate } from '../types/member';
import { PrismaClient } from '../../prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export class MemberService {
    async register(user: { username: string; email: string; password: string }) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return prisma.user.create({
            data: {
                username: user.username,
                email: user.email,
                password: hashedPassword,
            },
            select: { id: true, username: true, email: true },
        });
    }

    async login(username: string, password: string) {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) throw { status: 404, message: '사용자 없음' };
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw { status: 401, message: '비밀번호 불일치' };
        const { password: _, ...userInfo } = user;
        return userInfo;
    }

    async update(id: string, update: UserUpdate) {
        const data: any = {};
        if (update.password) data.password = await bcrypt.hash(update.password, 10);
        if (update.username) data.username = update.username;
        if (update.email) data.email = update.email;

        const user = await prisma.user.update({
            where: { id },
            data,
            select: { id: true, username: true, email: true },
        });
        return user;
    }

    async getById(id: string) {
        const user = await prisma.user.findUnique({
            where: { id },
            select: { id: true, username: true, email: true },
        });
        if (!user) throw { status: 404, message: '사용자 없음' };
        return user;
    }

    async delete(id: string) {
        try {
            await prisma.user.delete({ where: { id } });
        } catch {
            throw { status: 404, message: '사용자 없음' };
        }
    }
}