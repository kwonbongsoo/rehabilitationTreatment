import { FastifyRequest, FastifyReply } from 'fastify';
import productService from '../services/productService';
import { CreateProductRequest } from '../types/productTypes';

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
  // === 상수 정의 ===

  /** 허용되는 이미지 MIME 타입 목록 */
  private static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ] as const;

  /** 최대 파일 크기 (10MB) */
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024;

  /** 최대 이미지 업로드 개수 */
  private static readonly MAX_IMAGE_COUNT = 5;

  /** 상품명 최대 길이 */
  private static readonly MAX_NAME_LENGTH = 200;

  /** 상품 설명 최대 길이 */
  private static readonly MAX_DESCRIPTION_LENGTH = 2000;

  // === 메서드 정의 ===
  /**
   * 상품 등록 (이미지 및 옵션 포함)
   *
   * @description
   * 멀티파트 폼 데이터로 전송된 상품 정보와 이미지를 처리하여 새 상품을 등록합니다.
   * - productData: JSON 문자열로 전송된 상품 기본 정보
   * - images: 업로드된 이미지 파일들 (최대 5개)
   * - 철저한 검증 로직과 에러 처리 포함
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
   * formData.append('productData', JSON.stringify({
   *   name: '상품명',
   *   description: '상품 설명',
   *   price: 10000,
   *   originalPrice: 15000,
   *   categoryId: 1,
   *   sellerId: 'seller123'
   * }));
   * formData.append('images', file1);
   * formData.append('images', file2);
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
   * 멀티파트 요청에서 상품 데이터 파싱 및 검증
   *
   * @description
   * multipart/form-data 요청을 파싱하여 상품 정보와 이미지 파일을 추출합니다.
   * - productData 필드에서 JSON 문자열을 파싱하여 상품 기본 정보 추출
   * - images 필드에서 업로드된 파일들을 File 객체로 변환
   * - 파일 타입, 크기, 개수 등 철저한 검증 수행
   * - 숫자 타입 자동 변환 및 불린 타입 정규화
   *
   * @param request - multipart/form-data 형식의 Fastify 요청 객체
   * @returns 파싱되고 검증된 상품 생성 요청 데이터
   *
   * @throws {Error} multipart 형식이 아닌 경우
   * @throws {Error} productData 필드가 누락된 경우
   * @throws {Error} JSON 파싱 실패
   * @throws {Error} 파일 검증 실패 (타입, 크기, 개수 등)
   * @throws {Error} 숫자 타입 변환 실패
   *
   * @private
   */
  private async parseProductData(request: FastifyRequest): Promise<CreateProductRequest> {
    console.log('=== 요청 분석 시작 ===');
    console.log('request.isMultipart():', request.isMultipart());
    console.log('request content-type:', request.headers['content-type']);
    console.log('request.body:', request.body);
    console.log('request.raw.method:', request.raw.method);

    // body가 이미 파싱되었는지 확인하고 사용
    if (request.body && typeof request.body === 'object') {
      console.log('Body already parsed, using body data');
      const bodyData = request.body as any;

      let productData: CreateProductRequest = {
        name: bodyData.name,
        description: bodyData.description,
        price: Number(bodyData.price) || 0,
        originalPrice: Number(bodyData.originalPrice) || 0,
        categoryId: Number(bodyData.categoryId) || 0,
        sellerId: bodyData.sellerId,
        stock: Number(bodyData.stock) || 0,
        isNew: bodyData.isNew === 'true' || bodyData.isNew === true,
        isFeatured: bodyData.isFeatured === 'true' || bodyData.isFeatured === true,
        discountPercentage: Number(bodyData.discountPercentage) || 0,
        ...(bodyData.sku && { sku: bodyData.sku }),
        ...(bodyData.weight && { weight: Number(bodyData.weight) }),
      };

      console.log('Body-based productData:', productData);
      return productData;
    }

    // 멀티파트 요청만 지원하도록 변경
    if (!request.isMultipart()) {
      throw new Error('상품 등록은 multipart/form-data 형식만 지원합니다.');
    }

    const parts = request.parts();
    const formData: any = {};
    const files: File[] = [];

    console.log('parts', parts);
    console.log('has parts iterator:', typeof request.parts === 'function');
    console.log('request content-type:', request.headers['content-type']);
    console.log('request body:', request.body);

    // parts 가 실제로 비어있는지 확인
    let partsCount = 0;

    try {
      // parts 스트림이 이미 소비되었는지 감지하고 대안 제공
      const partsIterator = parts[Symbol.asyncIterator]();
      console.log('Parts iterator created:', partsIterator);

      let firstPart;
      try {
        const result = await partsIterator.next();
        firstPart = result.value;
        console.log('First part result:', result);

        if (result.done) {
          console.log('Parts stream is empty - no multipart data received');
          throw new Error(
            'multipart 데이터가 비어있습니다. 클라이언트에서 데이터를 전송하지 않았습니다.',
          );
        }
      } catch (error: any) {
        console.error('Error getting first part:', error);
        throw new Error('multipart 스트림 읽기 실패: ' + error.message);
      }

      // 첫 번째 부분을 처리
      if (firstPart) {
        partsCount++;
        console.log(`Processing part ${partsCount}:`, {
          type: firstPart.type,
          fieldname: firstPart.fieldname,
          value: firstPart.value?.toString?.() || firstPart.value,
          filename: firstPart.filename,
        });

        if (firstPart.type === 'file') {
          await this.validateFileUpload(firstPart);
          const buffer = await firstPart.toBuffer();
          const file = new File([buffer], firstPart.filename || 'upload', {
            type: firstPart.mimetype,
          });
          files.push(file);
        } else {
          const fieldValue = firstPart.value;
          if (fieldValue !== undefined && fieldValue !== null) {
            formData[firstPart.fieldname] = fieldValue;
          }
        }
      }

      // 나머지 부분들 처리
      for await (const part of partsIterator as any) {
        partsCount++;
        console.log(`Processing part ${partsCount}:`, {
          type: part.type,
          fieldname: part.fieldname,
          filename: part.filename,
          value: part.value?.toString?.() || part.value,
        });

        if (part.type === 'file') {
          await this.validateFileUpload(part);
          const buffer = await part.toBuffer();
          const file = new File([buffer], part.filename || 'upload', {
            type: part.mimetype,
          });
          files.push(file);
        } else {
          const fieldValue = part.value;
          if (fieldValue !== undefined && fieldValue !== null) {
            formData[part.fieldname] = fieldValue;
          }
        }
      }
    } catch (error: any) {
      throw new Error(`파일 파싱 실패: ${error.message}`);
    }

    console.log(`Total parts processed: ${partsCount}`);
    console.log('Final formData keys:', Object.keys(formData));
    console.log('Final formData:', formData);

    // 개별 프로퍼티에서 상품 데이터 구성
    let productData: CreateProductRequest = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      originalPrice: formData.originalPrice,
      categoryId: formData.categoryId,
      sellerId: formData.sellerId,
      stock: formData.stock,
      isNew: formData.isNew,
      isFeatured: formData.isFeatured,
      discountPercentage: formData.discountPercentage,
      ...(formData.sku && { sku: formData.sku }),
      ...(formData.weight && { weight: formData.weight }),
    };

    // JSON으로 전송된 복잡한 객체들 파싱
    if (formData.dimensions) {
      try {
        productData.dimensions = JSON.parse(formData.dimensions);
      } catch (error) {
        throw new Error('치수 데이터 JSON 파싱에 실패했습니다.');
      }
    }

    if (formData.specifications) {
      try {
        productData.specifications = JSON.parse(formData.specifications);
      } catch (error) {
        throw new Error('사양 데이터 JSON 파싱에 실패했습니다.');
      }
    }

    if (formData.options) {
      try {
        productData.options = JSON.parse(formData.options);
      } catch (error) {
        throw new Error('옵션 데이터 JSON 파싱에 실패했습니다.');
      }
    }

    console.log('productData', productData);

    // 필수 필드 검증
    if (!productData.name?.trim()) {
      throw new Error('상품명이 누락되었습니다.');
    }
    if (!productData.description?.trim()) {
      throw new Error('상품 설명이 누락되었습니다.');
    }
    if (!productData.sellerId?.trim()) {
      throw new Error('판매자 ID가 누락되었습니다.');
    }

    // 숫자 타입 변환 및 검증
    productData = this.normalizeProductData(productData);

    // 파일을 productData에 추가
    productData.images = files;
    console.log('productData.images', productData.images);

    return productData;
  }

  /**
   * 업로드 파일 검증 (MIME 타입, 크기, 파일명)
   *
   * @description
   * 멀티파트 요청으로 업로드된 파일의 유효성을 검증합니다.
   * - MIME 타입: image/jpeg, image/png, image/gif, image/webp만 허용
   * - 파일 크기: 최대 10MB 제한
   * - 파일명: 빈 값이나 공백만 있는 파일명 거부
   *
   * @param part - multipart 파싱된 파일 부분 객체
   * @returns 검증 성공 시 void (Promise<void>)
   *
   * @throws {Error} 지원하지 않는 MIME 타입
   * @throws {Error} 파일 크기 초과 (10MB)
   * @throws {Error} 유효하지 않은 파일명
   *
   * @private
   */
  private async validateFileUpload(part: any): Promise<void> {
    // MIME 타입 검증
    if (!ProductController.ALLOWED_MIME_TYPES.includes(part.mimetype)) {
      throw new Error(
        `지원하지 않는 파일 형식입니다: ${part.mimetype}. ` +
          `지원 형식: ${ProductController.ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    // 파일 크기 제한
    if (part.file && part.file.bytesRead > ProductController.MAX_FILE_SIZE) {
      const maxSizeMB = ProductController.MAX_FILE_SIZE / (1024 * 1024);
      throw new Error(`파일 크기가 너무 큽니다. 최대 ${maxSizeMB}MB까지 업로드 가능합니다.`);
    }

    // 파일명 검증
    if (!part.filename || part.filename.trim() === '') {
      throw new Error('파일명이 유효하지 않습니다.');
    }
  }

  /**
   * 상품 데이터 정규화 및 타입 변환
   */
  private normalizeProductData(data: any): CreateProductRequest {
    return {
      ...data,
      price: this.parseNumber(data.price, '가격'),
      originalPrice: this.parseNumber(data.originalPrice, '원가'),
      categoryId: this.parseNumber(data.categoryId, '카테고리 ID'),
      stock: data.stock !== undefined ? this.parseNumber(data.stock, '재고') : undefined,
      weight: data.weight !== undefined ? this.parseNumber(data.weight, '무게') : undefined,
      discountPercentage:
        data.discountPercentage !== undefined
          ? this.parseNumber(data.discountPercentage, '할인율')
          : undefined,
      isNew: Boolean(data.isNew),
      isFeatured: Boolean(data.isFeatured),
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
    };
  }

  /**
   * 숫자 파싱 헬퍼
   */
  private parseNumber(value: any, fieldName: string): number {
    const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
    if (isNaN(parsed)) {
      throw new Error(`${fieldName}은(는) 올바른 숫자여야 합니다: ${value}`);
    }
    return parsed;
  }

  /**
   * 필수 필드 및 비즈니스 로직 검증
   */
  private validateRequiredFields(productData: CreateProductRequest): void {
    // 필수 필드 검증
    const validationErrors: string[] = [];

    if (!productData.name || productData.name.trim() === '') {
      validationErrors.push('상품명은 필수입니다.');
    }

    if (!productData.description || productData.description.trim() === '') {
      validationErrors.push('상품 설명은 필수입니다.');
    }

    if (!productData.sellerId || productData.sellerId.trim() === '') {
      validationErrors.push('판매자 ID는 필수입니다.');
    }

    // 숫자 필드 검증 (이미 parseNumber에서 검증되었지만 추가 비즈니스 로직 검증)
    if (productData.price <= 0) {
      validationErrors.push('가격은 0보다 커야 합니다.');
    }

    if (productData.originalPrice <= 0) {
      validationErrors.push('원가는 0보다 커야 합니다.');
    }

    if (productData.categoryId <= 0) {
      validationErrors.push('올바른 카테고리를 선택해주세요.');
    }

    // 비즈니스 로직 검증
    if (productData.price > productData.originalPrice) {
      validationErrors.push('판매가격은 원가보다 높을 수 없습니다.');
    }

    // 할인율 검증
    if (
      productData.discountPercentage !== undefined &&
      (productData.discountPercentage < 0 || productData.discountPercentage > 100)
    ) {
      validationErrors.push('할인율은 0%에서 100% 사이여야 합니다.');
    }

    // 재고 검증
    if (productData.stock !== undefined && productData.stock < 0) {
      validationErrors.push('재고는 0 이상이어야 합니다.');
    }

    // 무게 검증
    if (productData.weight !== undefined && productData.weight < 0) {
      validationErrors.push('무게는 0 이상이어야 합니다.');
    }

    // 이미지 검증
    if (!productData.images || productData.images.length === 0) {
      validationErrors.push('최소 1개의 상품 이미지가 필요합니다.');
    }

    if (productData.images && productData.images.length > ProductController.MAX_IMAGE_COUNT) {
      validationErrors.push(
        `상품 이미지는 최대 ${ProductController.MAX_IMAGE_COUNT}개까지 업로드 가능합니다.`,
      );
    }

    // 상품명 길이 검증
    if (productData.name && productData.name.length > ProductController.MAX_NAME_LENGTH) {
      validationErrors.push(
        `상품명은 ${ProductController.MAX_NAME_LENGTH}자를 초과할 수 없습니다.`,
      );
    }

    // 상품 설명 길이 검증
    if (
      productData.description &&
      productData.description.length > ProductController.MAX_DESCRIPTION_LENGTH
    ) {
      validationErrors.push(
        `상품 설명은 ${ProductController.MAX_DESCRIPTION_LENGTH}자를 초과할 수 없습니다.`,
      );
    }

    if (validationErrors.length > 0) {
      throw new Error(`검증 실패: ${validationErrors.join(' | ')}`);
    }
  }

  /**
   * 에러 처리 헬퍼 (개선된 에러 분류 및 로깅)
   */
  private handleError(request: FastifyRequest, reply: FastifyReply, error: any, operation: string) {
    // 에러 유형별 상태 코드 결정
    const statusCode = this.determineStatusCode(error);

    // 구조화된 에러 로깅
    request.log.error(
      {
        operation,
        error: {
          message: error.message,
          stack: error.stack,
          statusCode,
        },
        requestInfo: {
          method: request.method,
          url: request.url,
          userAgent: request.headers['user-agent'],
        },
      },
      `${operation} 실패`,
    );

    // BaseError 타입의 에러인 경우
    if (error.statusCode && error.toResponse) {
      const errorResponse = error.toResponse();
      return reply.status(error.statusCode).send({
        error: errorResponse,
      });
    }

    // 클라이언트 친화적 에러 메시지 생성
    const clientMessage = this.getClientFriendlyMessage(error, operation);

    // 응답 전송
    return reply.status(statusCode).send({
      error: {
        message: clientMessage,
        status: statusCode,
        timestamp: new Date().toISOString(),
        operation,
      },
    });
  }

  /**
   * 에러 유형에 따른 HTTP 상태 코드 결정
   */
  private determineStatusCode(error: any): number {
    if (error.statusCode) {
      return error.statusCode;
    }

    const message = error.message?.toLowerCase() || '';

    // 검증 에러 (400)
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

    // 인증 에러 (401)
    if (message.includes('인증') || message.includes('권한')) {
      return 401;
    }

    // 리소스 없음 (404)
    if (message.includes('찾을 수 없') || message.includes('존재하지')) {
      return 404;
    }

    // 충돌 에러 (409)
    if (message.includes('중복') || message.includes('이미 존재')) {
      return 409;
    }

    // 기본값: 내부 서버 에러 (500)
    return 500;
  }

  /**
   * 클라이언트 친화적 에러 메시지 생성
   */
  private getClientFriendlyMessage(error: any, operation: string): string {
    const originalMessage = error.message || '';

    // 이미 클라이언트 친화적인 메시지인 경우
    if (
      originalMessage.includes('필수') ||
      originalMessage.includes('검증') ||
      originalMessage.includes('형식') ||
      originalMessage.includes('크기')
    ) {
      return originalMessage;
    }

    // 운영 환경에서는 일반적인 메시지로 변환
    if (process.env.NODE_ENV === 'production') {
      return `${operation} 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.`;
    }

    // 개발 환경에서는 상세한 메시지 제공
    return originalMessage || `${operation} 중 오류가 발생했습니다.`;
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
   * 요청에서 파일 추출 (개선된 검증 포함)
   */
  private async extractFilesFromRequest(request: FastifyRequest): Promise<File[]> {
    const files: File[] = [];
    const parts = request.parts();

    try {
      for await (const part of parts) {
        console.log('0000000000000000000000000000');
        if (part.type === 'file') {
          // 파일 검증
          console.log('1111111111111111111111111111');
          await this.validateFileUpload(part);
          console.log('2222222222222222222222222222');
          const buffer = await part.toBuffer();
          console.log('3333333333333333333333333333');
          const file = new File([buffer], part.filename || 'upload', {
            type: part.mimetype,
          });
          console.log('4444444444444444444444444444');
          files.push(file);
          console.log('5555555555555555555555555555');
          console.log('files', files);
        }
      }
    } catch (error: any) {
      throw new Error(`이미지 파일 추출 실패: ${error.message}`);
    }

    // 파일 개수 검증
    if (files.length === 0) {
      throw new Error('업로드할 이미지 파일이 없습니다.!!!!');
    }

    if (files.length > ProductController.MAX_IMAGE_COUNT) {
      throw new Error(
        `한 번에 최대 ${ProductController.MAX_IMAGE_COUNT}개의 이미지만 업로드할 수 있습니다.`,
      );
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
        updateData,
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
        parseInt(optionId),
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
