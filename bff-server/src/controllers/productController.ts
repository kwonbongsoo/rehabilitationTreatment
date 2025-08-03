import { FastifyRequest, FastifyReply } from 'fastify';
import productService from '../services/productService';
import { CreateProductRequest } from '../types/productTypes';

export class ProductController {
  /**
   * 상품 등록 (이미지 포함)
   */
  async registerProduct(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = request.body as CreateProductRequest & { images?: any[] };

      // multipart 요청에서 파일과 데이터 분리
      let productData: CreateProductRequest;
      let files: File[] = [];

      if (request.isMultipart()) {
        const parts = request.parts();
        const formData: any = {};

        for await (const part of parts) {
          if (part.type === 'file') {
            // 파일 데이터를 File 객체로 변환
            const buffer = await part.toBuffer();
            const file = new File([buffer], part.filename || 'upload', {
              type: part.mimetype,
            });
            files.push(file);
          } else {
            // 일반 필드 데이터
            formData[part.fieldname] = part.value;
          }
        }

        // 문자열로 전송된 JSON 데이터 파싱
        if (formData.productData) {
          productData = JSON.parse(formData.productData);
        } else {
          productData = formData;
        }
      } else {
        productData = data;
        files = data.images || [];
      }

      // 파일을 productData에 추가
      productData.images = files;

      // 필수 필드 검증
      if (
        !productData.name ||
        !productData.description ||
        !productData.price ||
        !productData.categoryId ||
        !productData.sellerId
      ) {
        return reply.status(400).send({
          error: {
            message: '필수 필드가 누락되었습니다. (name, description, price, categoryId, sellerId)',
            status: 400,
          },
        });
      }

      const result = await productService.registerProduct(productData);

      return reply.status(201).send({
        success: true,
        data: result,
      });
    } catch (error: any) {
      request.log.error('상품 등록 실패:', error);

      return reply.status(error.statusCode || 500).send({
        error: {
          message: error.message || '상품 등록 중 오류가 발생했습니다.',
          status: error.statusCode || 500,
        },
      });
    }
  }

  /**
   * 기존 상품에 이미지 업로드
   */
  async uploadProductImages(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { productId } = request.params as { productId: string };
      const files: File[] = [];

      if (!request.isMultipart()) {
        return reply.status(400).send({
          error: {
            message: '파일 업로드는 multipart/form-data 형식이어야 합니다.',
            status: 400,
          },
        });
      }

      const parts = request.parts();
      for await (const part of parts) {
        if (part.type === 'file') {
          const buffer = await part.toBuffer();
          const file = new File([buffer], part.filename || 'upload', {
            type: part.mimetype,
          });
          files.push(file);
        }
      }

      if (files.length === 0) {
        return reply.status(400).send({
          error: {
            message: '업로드할 파일이 없습니다.',
            status: 400,
          },
        });
      }

      const result = await productService.uploadImagesForProduct(parseInt(productId), files);

      return reply.status(200).send({
        success: true,
        data: result,
      });
    } catch (error: any) {
      request.log.error('이미지 업로드 실패:', error);

      return reply.status(error.statusCode || 500).send({
        error: {
          message: error.message || '이미지 업로드 중 오류가 발생했습니다.',
          status: error.statusCode || 500,
        },
      });
    }
  }

  /**
   * 판매자별 상품 목록 조회
   */
  async getProductsBySeller(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { sellerId } = request.params as { sellerId: string };
      const queryParams = request.query as any;

      // Product Domain API 호출 (이 부분은 productDomainClient에서 구현되어야 함)
      // 임시로 직접 구현 또는 클라이언트 메서드 호출

      return reply.status(200).send({
        success: true,
        message: `판매자 ${sellerId}의 상품 목록 조회 기능이 구현될 예정입니다.`,
        data: {
          sellerId,
          queryParams,
        },
      });
    } catch (error: any) {
      request.log.error('판매자별 상품 조회 실패:', error);

      return reply.status(error.statusCode || 500).send({
        error: {
          message: error.message || '판매자별 상품 조회 중 오류가 발생했습니다.',
          status: error.statusCode || 500,
        },
      });
    }
  }

  /**
   * 상품 이미지 삭제
   */
  async deleteProductImage(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { productId, imageId } = request.params as { productId: string; imageId: string };

      const result = await productService.deleteProductImage(
        parseInt(productId),
        parseInt(imageId),
      );

      return reply.status(200).send({
        success: true,
        data: result,
      });
    } catch (error: any) {
      request.log.error('이미지 삭제 실패:', error);

      return reply.status(error.statusCode || 500).send({
        error: {
          message: error.message || '이미지 삭제 중 오류가 발생했습니다.',
          status: error.statusCode || 500,
        },
      });
    }
  }
}

// 싱글톤 인스턴스 생성
const productController = new ProductController();
export default productController;
