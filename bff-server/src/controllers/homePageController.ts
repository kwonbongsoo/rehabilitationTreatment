import { FastifyRequest, FastifyReply } from 'fastify';
import { BaseError, ErrorCode } from '@ecommerce/common';
import homePageService from '../services/homePageService';

class HomePageController {
  async getHomePage(request: FastifyRequest, reply: FastifyReply) {
    try {
      const homePageData = await homePageService.getHomePageData();

      const response = {
        success: true,
        data: homePageData,
      };
      return reply.code(200).send(response);
    } catch (error) {
      console.error('HomePageController: error occurred', error);
      if (error instanceof BaseError) {
        const errorResponse = error.toResponse();
        return reply.code(error.statusCode).send(errorResponse);
      } else {
        const internalError = new BaseError(
          ErrorCode.INTERNAL_ERROR,
          'Failed to fetch home page data',
          { context: error instanceof Error ? error.message : 'Unknown error' },
          500,
        );
        const errorResponse = internalError.toResponse();
        return reply.code(500).send(errorResponse);
      }
    }
  }
}

export default new HomePageController();
