import { FastifyRequest, FastifyReply } from 'fastify';
import { BaseError, ErrorCode } from '@ecommerce/common';
import categoryService from '../services/categoryService';

interface CategoryDetailParams {
  slug: string;
}

class CategoryController {
  // See All 페이지 - 모든 카테고리 조회
  async getCategories(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await categoryService.getCategoryPageData();
      return reply.code(200).send(result);
    } catch (error) {
      console.error('CategoryController: error occurred in getCategories', error);
      if (error instanceof BaseError) {
        const errorResponse = error.toResponse();
        return reply.code(error.statusCode).send(errorResponse);
      } else {
        const internalError = new BaseError(
          ErrorCode.INTERNAL_ERROR,
          'Failed to fetch categories',
          { context: error instanceof Error ? error.message : 'Unknown error' },
          500,
        );
        const errorResponse = internalError.toResponse();
        return reply.code(500).send(errorResponse);
      }
    }
  }
}

export default new CategoryController();
