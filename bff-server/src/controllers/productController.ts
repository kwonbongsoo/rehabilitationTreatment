import { FastifyRequest, FastifyReply } from 'fastify';
import productService from '../services/productService';
import { CreateProductRequest } from '../types/productTypes';
import { MultipartParser } from '../utils/MultipartParser';
import { BaseError, ErrorCode } from '@ecommerce/common';

/**
 * 상품 관리 컨트롤러
 *
 * @description
 * 멀티파트 폼 데이터를 처리하여 상품 등록, 이미지 업로드, 옵션 관리 등의 기능을 제공합니다.
 * 베스트 프랙티스를 적용한 검증, 에러 처리, 로깅을 포함합니다.
 *
 * @author BFF Team
 * @version 2.0.0
 * @since 2024-01-01
 */
export class ProductController {
  private readonly multipartParser: MultipartParser;

  constructor() {
    this.multipartParser = new MultipartParser({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFileCount: 10, // 상품도메인서버와 동일하게 10개로 증가
      allowedMimeTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/avif',
      ],
      requiredFields: ['name', 'description', 'price', 'originalPrice', 'categoryId', 'sellerId'],
    });
  }

  // === 메서드 정의 ===
  /**
   * 상품 등록 (2단계 워크플로우)
   *
   * @description
   * 멀티파트 폼 데이터로 전송된 상품 정보와 이미지를 처리하여 새 상품을 등록합니다.
   *
   * 1단계: 이미지 업로드 (상품도메인서버 /products/images)
   * 2단계: 상품 생성 (상품도메인서버 /products + imageUrls)
   *
   * @param request - Fastify 요청 객체 (multipart/form-data 형식)
   * @param reply - Fastify 응답 객체
   * @returns 등록된 상품 정보 또는 에러 응답
   *
   * @throws {400} 검증 실패, 파싱 오류, 필수 필드 누락
   * @throws {500} 서버 내부 오류
   *
   * @example
   * // 프론트엔드에서 FormData 전송
   * const formData = new FormData();
   * formData.append('name', '상품명');
   * formData.append('description', '상품 설명');
   * formData.append('price', '10000');
   * formData.append('originalPrice', '15000');
   * formData.append('categoryId', '1');
   * formData.append('sellerId', 'seller123');
   * formData.append('images', file1);
   * formData.append('images', file2);
   */
  async registerProduct(request: FastifyRequest, reply: FastifyReply) {
    try {
      request.log.info('🔍 상품 등록 시작 - 2단계 워크플로우');

      // 1. multipart 데이터 파싱
      const parsedData = await this.multipartParser.parse(request);

      request.log.info('🔍 파싱된 데이터:', parsedData);

      // 2. 상품 데이터 변환
      const productData = this.transformToProductData(parsedData);

      // 3. 2단계 워크플로우로 상품 등록
      const result = await productService.registerProduct(productData);

      return reply.status(201).send({
        success: true,
        data: result,
        message: '상품이 성공적으로 등록되었습니다.',
      });
    } catch (error) {
      request.log.error('❌ 상품 등록 실패', {
        error: error instanceof Error ? error.message : error,
      });
      return this.handleError(request, reply, error, '상품 등록');
    }
  }

  private transformToProductData(parsedData: {
    fields: Record<string, string>;
    files: File[];
  }): CreateProductRequest {
    const { fields, files } = parsedData;

    // 필수 필드 검증
    this.validateRequiredFields(fields);

    const productData: CreateProductRequest = {
      name: fields.name || '',
      description: fields.description || '',
      price: this.parseNumber(fields.price || '', '가격'),
      originalPrice: this.parseNumber(fields.originalPrice || '', '원가'),
      categoryId: this.parseNumber(fields.categoryId || '', '카테고리 ID'),
      sellerId: fields.sellerId || '',
      images: files,
    };

    // 선택적 필드들 추가
    this.addOptionalFields(productData, fields);

    // 복잡한 객체들 파싱
    this.parseComplexFields(productData, fields);

    return productData;
  }

  private validateRequiredFields(fields: Record<string, string>): void {
    const requiredFields = [
      'name',
      'description',
      'price',
      'originalPrice',
      'categoryId',
      'sellerId',
    ];
    const missingFields = requiredFields.filter(
      (field) => !fields[field] || fields[field]?.trim() === '',
    );

    if (missingFields.length > 0) {
      throw new BaseError(
        ErrorCode.VALIDATION_ERROR,
        `필수 필드가 누락되었습니다: ${missingFields.join(', ')}`,
        { context: { missingFields } },
      );
    }
  }

  private addOptionalFields(
    productData: CreateProductRequest,
    fields: Record<string, string>,
  ): void {
    if (fields.stock) productData.stock = this.parseNumber(fields.stock, '재고');
    if (fields.sku) productData.sku = fields.sku;
    if (fields.weight) productData.weight = this.parseNumber(fields.weight, '무게');
    if (fields.isNew) productData.isNew = this.parseBoolean(fields.isNew);
    if (fields.isFeatured) productData.isFeatured = this.parseBoolean(fields.isFeatured);
    if (fields.isActive) productData.isActive = this.parseBoolean(fields.isActive);
    if (fields.discountPercentage)
      productData.discountPercentage = this.parseNumber(fields.discountPercentage, '할인율');
    if (fields.discount) productData.discount = this.parseNumber(fields.discount, '할인');
    if (fields.mainImage) productData.mainImage = fields.mainImage;
    if (fields.rating) productData.rating = this.parseNumber(fields.rating, '평점');
    if (fields.averageRating)
      productData.averageRating = this.parseNumber(fields.averageRating, '평균 평점');
    if (fields.reviewCount)
      productData.reviewCount = this.parseNumber(fields.reviewCount, '리뷰 수');
  }

  private parseComplexFields(
    productData: CreateProductRequest,
    fields: Record<string, string>,
  ): void {
    if (fields.dimensions) {
      try {
        productData.dimensions = JSON.parse(fields.dimensions);
      } catch (error) {
        throw new BaseError(ErrorCode.VALIDATION_ERROR, '치수 데이터 JSON 파싱에 실패했습니다.', {
          context: { rawValue: fields.dimensions },
        });
      }
    }

    if (fields.specifications) {
      try {
        productData.specifications = JSON.parse(fields.specifications);
      } catch (error) {
        throw new BaseError(ErrorCode.VALIDATION_ERROR, '사양 데이터 JSON 파싱에 실패했습니다.', {
          context: { rawValue: fields.specifications },
        });
      }
    }

    if (fields.options) {
      try {
        productData.options = JSON.parse(fields.options);
      } catch (error) {
        throw new BaseError(ErrorCode.VALIDATION_ERROR, '옵션 데이터 JSON 파싱에 실패했습니다.', {
          context: { rawValue: fields.options },
        });
      }
    }
  }

  private parseNumber(value: string, fieldName: string): number {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      throw new BaseError(
        ErrorCode.VALIDATION_ERROR,
        `${fieldName}은(는) 올바른 숫자여야 합니다: ${value}`,
        { context: { field: fieldName, value } },
      );
    }
    return parsed;
  }

  private parseBoolean(value: string): boolean {
    return value === 'true' || value === '1';
  }

  private handleError(
    request: FastifyRequest,
    reply: FastifyReply,
    error: unknown,
    operation: string,
  ) {
    // BaseError 타입의 에러인 경우
    if (error instanceof BaseError) {
      this.logStructuredError(request, error, operation);
      const errorResponse = error.toResponse();
      return reply.status(error.statusCode).send({
        success: false,
        error: errorResponse,
      });
    }

    // 일반 에러 처리
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    const statusCode = this.determineStatusCode(error);

    this.logGeneralError(request, error, operation);

    return reply.status(statusCode).send({
      success: false,
      error: {
        message,
        status: statusCode,
        timestamp: new Date().toISOString(),
        operation,
      },
    });
  }

  private logStructuredError(request: FastifyRequest, error: BaseError, operation: string): void {
    request.log.error(
      {
        operation,
        error: {
          code: error.code,
          message: error.message,
          statusCode: error.statusCode,
          details: error.details,
        },
        requestInfo: {
          method: request.method,
          url: request.url,
          userAgent: request.headers['user-agent'],
        },
      },
      `${operation} 실패 - ${error.code}`,
    );
  }

  private logGeneralError(request: FastifyRequest, error: unknown, operation: string): void {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    const errorStack = error instanceof Error ? error.stack : undefined;

    request.log.error(
      {
        operation,
        error: {
          message: errorMessage,
          stack: errorStack,
        },
        requestInfo: {
          method: request.method,
          url: request.url,
          userAgent: request.headers['user-agent'],
        },
      },
      `${operation} 실패`,
    );
  }

  private determineStatusCode(error: unknown): number {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      return (error as any).statusCode;
    }

    const message = error instanceof Error ? error.message.toLowerCase() : '';

    if (
      message.includes('필수') ||
      message.includes('검증') ||
      message.includes('파싱') ||
      message.includes('형식') ||
      message.includes('크기') ||
      message.includes('타입')
    ) {
      return 400;
    }

    if (message.includes('인증') || message.includes('권한')) {
      return 401;
    }

    if (message.includes('찾을 수 없') || message.includes('존재하지')) {
      return 404;
    }

    if (message.includes('중복') || message.includes('이미 존재')) {
      return 409;
    }

    return 500;
  }

  // TODO: 기존 상품에 이미지 업로드 - 미구현
  async uploadProductImages(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(501).send({
      success: false,
      error: {
        message: '상품 이미지 업로드 기능이 아직 구현되지 않았습니다.',
        status: 501,
      },
    });
  }

  // TODO: 판매자별 상품 목록 조회 - 미구현
  async getProductsBySeller(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(501).send({
      success: false,
      error: {
        message: '판매자별 상품 목록 조회 기능이 아직 구현되지 않았습니다.',
        status: 501,
      },
    });
  }

  // TODO: 상품 이미지 삭제 - 미구현
  async deleteProductImage(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(501).send({
      success: false,
      error: {
        message: '상품 이미지 삭제 기능이 아직 구현되지 않았습니다.',
        status: 501,
      },
    });
  }

  // TODO: 상품 옵션 조회 - 미구현
  async getProductOptions(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(501).send({
      success: false,
      error: {
        message: '상품 옵션 조회 기능이 아직 구현되지 않았습니다.',
        status: 501,
      },
    });
  }

  // TODO: 상품 옵션 수정 - 미구현
  async updateProductOption(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(501).send({
      success: false,
      error: {
        message: '상품 옵션 수정 기능이 아직 구현되지 않았습니다.',
        status: 501,
      },
    });
  }

  // TODO: 상품 옵션 삭제 - 미구현
  async deleteProductOption(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(501).send({
      success: false,
      error: {
        message: '상품 옵션 삭제 기능이 아직 구현되지 않았습니다.',
        status: 501,
      },
    });
  }
}

const productController = new ProductController();
export default productController;
