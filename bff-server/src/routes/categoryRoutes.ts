import { FastifyInstance } from 'fastify';
import categoryController from '../controllers/categoryController';

async function categoryRoutes(fastify: FastifyInstance) {
  // See All 페이지 - 모든 카테고리와 상품 조회
  fastify.get('/api/categories', categoryController.getCategories.bind(categoryController));
}

export default categoryRoutes;
