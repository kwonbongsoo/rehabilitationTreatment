import { FastifyInstance } from 'fastify';
import productController from '../controllers/productController';

const productRoutes = async (fastify: FastifyInstance) => {
  // 상품 등록 (이미지 포함)
  fastify.post('/products', {
    schema: {
      tags: ['Products'],
      summary: '상품 등록',
      description: '상품 정보와 이미지를 함께 등록합니다.',
      consumes: ['multipart/form-data', 'application/json'],
      body: {
        type: 'object',
        properties: {
          productData: {
            type: 'string',
            description: '상품 정보 JSON 문자열 (multipart 요청 시)',
          },
          name: { type: 'string', description: '상품명' },
          description: { type: 'string', description: '상품 설명' },
          price: { type: 'number', description: '가격' },
          originalPrice: { type: 'number', description: '원가' },
          categoryId: { type: 'number', description: '카테고리 ID' },
          sellerId: { type: 'string', description: '판매자 ID' },
          mainImage: { type: 'string', description: '메인 이미지 URL' },
          rating: { type: 'number', description: '평점' },
          averageRating: { type: 'number', description: '평균 평점' },
          reviewCount: { type: 'number', description: '리뷰 수' },
          isNew: { type: 'boolean', description: '신상품 여부' },
          isFeatured: { type: 'boolean', description: '추천 상품 여부' },
          isActive: { type: 'boolean', description: '활성화 상태' },
          discount: { type: 'number', description: '할인액' },
          discountPercentage: { type: 'number', description: '할인율' },
          stock: { type: 'number', description: '재고' },
          sku: { type: 'string', description: 'SKU' },
          weight: { type: 'number', description: '무게' },
          dimensions: {
            type: 'object',
            description: '치수',
            properties: {
              length: { type: 'number' },
              width: { type: 'number' },
              height: { type: 'number' },
            },
          },
          specifications: {
            type: 'object',
            description: '상품 스펙',
          },
          options: {
            type: 'array',
            description: '상품 옵션',
            items: {
              type: 'object',
              properties: {
                optionType: { type: 'string' },
                optionName: { type: 'string' },
                optionValue: { type: 'string' },
                additionalPrice: { type: 'number' },
                stock: { type: 'number' },
                sku: { type: 'string' },
                sortOrder: { type: 'number' },
              },
            },
          },
          images: {
            type: 'array',
            description: '상품 이미지 파일들',
            items: {
              type: 'string',
              format: 'binary',
            },
          },
        },
        required: ['name', 'description', 'price', 'categoryId', 'sellerId'],
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                productId: { type: 'number' },
                imageUrls: {
                  type: 'array',
                  items: { type: 'string' },
                },
                message: { type: 'string' },
              },
            },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                status: { type: 'number' },
              },
            },
          },
        },
      },
    },
    handler: productController.registerProduct.bind(productController),
  });

  // 판매자별 상품 목록 조회
  fastify.get('/products/seller/:sellerId', {
    schema: {
      tags: ['Products'],
      summary: '판매자별 상품 목록 조회',
      description: '특정 판매자의 상품 목록을 조회합니다.',
      params: {
        type: 'object',
        properties: {
          sellerId: { type: 'string', description: '판매자 ID' },
        },
        required: ['sellerId'],
      },
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', description: '페이지 번호', default: 1 },
          limit: { type: 'number', description: '페이지 크기', default: 10 },
          search: { type: 'string', description: '검색어' },
          categoryId: { type: 'number', description: '카테고리 ID' },
          minPrice: { type: 'number', description: '최소 가격' },
          maxPrice: { type: 'number', description: '최대 가격' },
          isNew: { type: 'boolean', description: '신상품 여부' },
          isFeatured: { type: 'boolean', description: '추천 상품 여부' },
          sortBy: { type: 'string', description: '정렬 기준', default: 'createdAt' },
          sortOrder: { type: 'string', description: '정렬 순서', enum: ['ASC', 'DESC'], default: 'DESC' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                sellerId: { type: 'string' },
                queryParams: { type: 'object' },
              },
            },
          },
        },
      },
    },
    handler: productController.getProductsBySeller.bind(productController),
  });

  // 기존 상품에 이미지 업로드
  fastify.post('/products/:productId/images', {
    schema: {
      tags: ['Products'],
      summary: '상품 이미지 업로드',
      description: '기존 상품에 이미지를 추가로 업로드합니다.',
      consumes: ['multipart/form-data'],
      params: {
        type: 'object',
        properties: {
          productId: { type: 'string', description: '상품 ID' },
        },
        required: ['productId'],
      },
      body: {
        type: 'object',
        properties: {
          images: {
            type: 'array',
            description: '업로드할 이미지 파일들',
            items: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                images: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      imageId: { type: 'number' },
                      imageUrl: { type: 'string' },
                      isMainImage: { type: 'boolean' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    handler: productController.uploadProductImages.bind(productController),
  });

  // 상품 이미지 삭제
  fastify.delete('/products/:productId/images/:imageId', {
    schema: {
      tags: ['Products'],
      summary: '상품 이미지 삭제',
      description: '상품의 특정 이미지를 삭제합니다.',
      params: {
        type: 'object',
        properties: {
          productId: { type: 'string', description: '상품 ID' },
          imageId: { type: 'string', description: '이미지 ID' },
        },
        required: ['productId', 'imageId'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                message: { type: 'string' },
              },
            },
          },
        },
      },
    },
    handler: productController.deleteProductImage.bind(productController),
  });

  // 상품 옵션 조회
  fastify.get('/products/:productId/options', {
    schema: {
      tags: ['Product Options'],
      summary: '상품 옵션 조회',
      description: '특정 상품의 모든 옵션을 조회합니다.',
      params: {
        type: 'object',
        properties: {
          productId: { type: 'string', description: '상품 ID' },
        },
        required: ['productId'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  productId: { type: 'number' },
                  optionType: { type: 'string' },
                  optionName: { type: 'string' },
                  optionValue: { type: 'string' },
                  additionalPrice: { type: 'number' },
                  stock: { type: 'number' },
                  sku: { type: 'string' },
                  sortOrder: { type: 'number' },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    },
    handler: productController.getProductOptions.bind(productController),
  });

  // 상품 옵션 수정
  fastify.patch('/products/:productId/options/:optionId', {
    schema: {
      tags: ['Product Options'],
      summary: '상품 옵션 수정',
      description: '특정 상품 옵션을 수정합니다.',
      params: {
        type: 'object',
        properties: {
          productId: { type: 'string', description: '상품 ID' },
          optionId: { type: 'string', description: '옵션 ID' },
        },
        required: ['productId', 'optionId'],
      },
      body: {
        type: 'object',
        properties: {
          optionType: { type: 'string' },
          optionName: { type: 'string' },
          optionValue: { type: 'string' },
          additionalPrice: { type: 'number' },
          stock: { type: 'number' },
          sku: { type: 'string' },
          sortOrder: { type: 'number' },
          isActive: { type: 'boolean' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                message: { type: 'string' },
              },
            },
          },
        },
      },
    },
    handler: productController.updateProductOption.bind(productController),
  });

  // 상품 옵션 삭제
  fastify.delete('/products/:productId/options/:optionId', {
    schema: {
      tags: ['Product Options'],
      summary: '상품 옵션 삭제',
      description: '특정 상품 옵션을 삭제합니다.',
      params: {
        type: 'object',
        properties: {
          productId: { type: 'string', description: '상품 ID' },
          optionId: { type: 'string', description: '옵션 ID' },
        },
        required: ['productId', 'optionId'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                message: { type: 'string' },
              },
            },
          },
        },
      },
    },
    handler: productController.deleteProductOption.bind(productController),
  });
};

export default productRoutes;