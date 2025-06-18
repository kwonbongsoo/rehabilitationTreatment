import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { MemberService } from '../services/memberService';
import { MemberController } from '../controllers/memberController';

interface Container {
  [key: string]: any;
}

export default async function diContainer(fastify: FastifyInstance): Promise<void> {
  const container: Container = {};

  // Prisma 인스턴스 등록 (싱글톤)
  const prisma = new PrismaClient();
  container.prisma = prisma;

  // 서비스 등록 (싱글톤)
  container.memberService = MemberService.getInstance(prisma);

  // 컨트롤러 등록 (싱글톤)
  container.memberController = MemberController.getInstance(container.memberService);

  // fastify 인스턴스에 컨테이너 추가
  fastify.decorate('diContainer', {
    resolve: (key: string) => {
      if (!container[key]) {
        throw new Error(`No dependency found for key: ${key}`);
      }
      return container[key];
    },
  });

  // 앱 종료 시 Prisma 연결 종료
  fastify.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
}
