import { FastifyRequest, FastifyReply } from 'fastify';
import productService from '../services/productService';
import { CreateProductRequest } from '../types/productTypes';

export class ProductController {
  /**
   * 상품 등록 (이미지 및 옵션 포함)
   */
  async registerProduct(request: FastifyRequest, reply: FastifyReply) {
    try {
      const productData = await this.parseProductData(request);
      
      // 기본 필수 필드 검증
      this.validateRequiredFields(productData);

      const result = await productService.registerProduct(productData);

      return reply.status(201).send({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return this.handleError(request, reply, error, '상품 등록');
    }
  }

  /**
   * 요청에서 상품 데이터 파싱
   */
  private async parseProductData(request: FastifyRequest): Promise<CreateProductRequest> {
    const data = request.body as CreateProductRequest & { images?: any[] };
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

      // 옵션 데이터 파싱 (문자열로 전송된 경우)
      if (formData.options && typeof formData.options === 'string') {
        try {
          productData.options = JSON.parse(formData.options);
        } catch (error) {
          throw new Error('옵션 데이터 파싱에 실패했습니다.');
        }
      }
    } else {
      productData = data;
      files = data.images || [];
    }

    // 파일을 productData에 추가
    productData.images = files;
    
    return productData;
  }

  /**
   * 필수 필드 검증
   */
  private validateRequiredFields(productData: CreateProductRequest): void {
    const requiredFields = ['name', 'description', 'price', 'categoryId', 'sellerId'];
    const missingFields = requiredFields.filter(field => !productData[field as keyof CreateProductRequest]);

    if (missingFields.length > 0) {
      throw new Error(`필수 필드가 누락되었습니다: ${missingFields.join(', ')}`);
    }
  }

  /**
   * 에러 처리 헬퍼
   */
  private handleError(
    request: FastifyRequest, 
    reply: FastifyReply, 
    error: any, 
    operation: string
  ) {
    request.log.error(`${operation} 실패:`, error);

    // BaseError 타입의 에러인 경우
    if (error.statusCode && error.toResponse) {
      const errorResponse = error.toResponse();
      return reply.status(error.statusCode).send({
        error: errorResponse,
      });
    }

    // 일반 에러
    return reply.status(error.statusCode || 500).send({
      error: {
        message: error.message || `${operation} 중 오류가 발생했습니다.`,
        status: error.statusCode || 500,
      },
    });
  }

  /**
   * 기존 상품에 이미지 업로드
   */
  async uploadProductImages(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { productId } = request.params as { productId: string };
      
      if (!request.isMultipart()) {
        throw new Error('파일 업로드는 multipart/form-data 형식이어야 합니다.');
      }

      const files = await this.extractFilesFromRequest(request);
      
      if (files.length === 0) {
        throw new Error('업로드할 파일이 없습니다.');
      }

      const result = await productService.uploadImagesForProduct(parseInt(productId), files);

      return reply.status(200).send({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return this.handleError(request, reply, error, '이미지 업로드');
    }
  }

  /**
   * 요청에서 파일 추출
   */
  private async extractFilesFromRequest(request: FastifyRequest): Promise<File[]> {
    const files: File[] = [];
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
    
    return files;
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
      return this.handleError(request, reply, error, '이미지 삭제');
    }
  }

  /**
   * 상품 옵션 조회
   */
  async getProductOptions(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { productId } = request.params as { productId: string };
      const options = await productService.getProductOptions(parseInt(productId));

      return reply.status(200).send({
        success: true,
        data: options,
      });
    } catch (error: any) {
      return this.handleError(request, reply, error, '상품 옵션 조회');
    }
  }

  /**
   * 상품 옵션 수정
   */
  async updateProductOption(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { productId, optionId } = request.params as { productId: string; optionId: string };
      const updateData = request.body as any;

      const result = await productService.updateProductOption(
        parseInt(productId),
        parseInt(optionId),
        updateData
      );

      return reply.status(200).send({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return this.handleError(request, reply, error, '상품 옵션 수정');
    }
  }

  /**
   * 상품 옵션 삭제
   */
  async deleteProductOption(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { productId, optionId } = request.params as { productId: string; optionId: string };

      const result = await productService.deleteProductOption(
        parseInt(productId),
        parseInt(optionId)
      );

      return reply.status(200).send({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return this.handleError(request, reply, error, '상품 옵션 삭제');
    }
  }
}

// 싱글톤 인스턴스 생성
const productController = new ProductController();
export default productController;
