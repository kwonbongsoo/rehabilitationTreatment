import { FastifyInstance } from 'fastify';
import homePageController from '../controllers/homePageController';

export default async function homePageRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/api/home',
    {
      schema: {
        description:
          'Get home page data including banners, categories, products, promotions, reviews, and brands',
        tags: ['Home Page'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  components: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        type: { type: 'string' },
                        title: { type: 'string' },
                        visible: { type: 'boolean' },
                        data: {
                          type: 'object',
                          additionalProperties: true,
                        },
                      },
                      required: ['id', 'type', 'visible', 'data'],
                    },
                  },
                },
                required: ['components'],
              },
            },
            required: ['success', 'data'],
          },
          400: {
            type: 'object',
            properties: {
              error: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  status: { type: 'number' },
                  code: { type: 'string' },
                  timestamp: { type: 'string' },
                },
              },
            },
          },
          500: {
            type: 'object',
            properties: {
              error: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  status: { type: 'number' },
                  code: { type: 'string' },
                  timestamp: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    homePageController.getHomePage,
  );
}
