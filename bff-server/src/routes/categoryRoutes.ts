import { FastifyInstance } from 'fastify';
import categoryController from '../controllers/categoryController';

async function categoryRoutes(fastify: FastifyInstance) {
  // See All 페이지 - 모든 카테고리와 상품 조회
  fastify.get('/api/categories', categoryController.getCategories.bind(categoryController));
  
  // 특정 카테고리 상세 조회
  fastify.get('/api/categories/:slug', categoryController.getCategoryDetail.bind(categoryController));
  
  // Health check
  fastify.get('/api/categories/health', async (request, reply) => {
    return reply.code(200).send({ status: 'ok', service: 'categories' });
  });
}

export default categoryRoutes;