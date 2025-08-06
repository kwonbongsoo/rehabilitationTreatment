import productDomainClient from '../clients/productDomainClient';
import {
  CreateProductRequest,
  ProductRegistrationResponse,
  ImageUploadResult,
} from '../types/productTypes';
import { BaseError, ErrorCode, ValidationError, NotFoundError } from '@ecommerce/common';

export class ProductService {
  /**
   * 상품 등록 메인 플로우
   * 1. 유효성 검사
   * 2. 상품 등록
   * 3. 상품 옵션 등록
   * 4. 이미지 업로드
   * 5. 실패 시 롤백 처리
   */
  async registerProduct(productData: CreateProductRequest): Promise<ProductRegistrationResponse> {
    // 입력 유효성 검사
    this.validateProductData(productData);

    let createdProductId: number | null = null;
    let uploadedImageIds: number[] = [];
    let createdOptionIds: number[] = [];

    try {
      // 1. 상품 데이터 먼저 등록 (이미지와 옵션 제외)
      const { images, options, ...productCreateData } = productData;
      const createdProduct = await productDomainClient.createProduct(productCreateData);
      createdProductId = createdProduct.id;

      // 2. 상품 옵션 등록
      if (options && options.length > 0) {
        createdOptionIds = await this.createProductOptions(createdProductId, options);
      }

      // 3. 이미지 업로드
      const imageUrls: string[] = [];
      if (images && images.length > 0) {
        const uploadResult = await this.uploadProductImages(createdProductId, images);
        uploadedImageIds = uploadResult.map((img) => img.imageId);
        imageUrls.push(...uploadResult.map((img) => img.imageUrl));

        // 첫 번째 이미지를 메인 이미지로 설정
        if (imageUrls.length > 0 && !productCreateData.mainImage) {
          await productDomainClient.updateProduct(createdProductId, {
            mainImage: imageUrls[0],
          });
        }
      }

      return {
        productId: createdProductId,
        imageUrls,
        message: '상품이 성공적으로 등록되었습니다.',
      };
    } catch (error: unknown) {
      // 롤백 처리
      await this.rollbackProductRegistration(createdProductId, uploadedImageIds, createdOptionIds);

      // 에러 타입에 따른 적절한 에러 던지기
      if (error instanceof BaseError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      throw new BaseError(
        ErrorCode.EXTERNAL_SERVICE_ERROR,
        `상품 등록 중 오류가 발생했습니다: ${errorMessage}`,
        { context: { productData: productData.name } },
      );
    }
  }

  /**
   * 상품 이미지 업로드
   */
  private async uploadProductImages(
    productId: number,
    images: File[],
  ): Promise<ImageUploadResult[]> {
    try {
      const uploadResult = await productDomainClient.uploadProductImages(productId, images);

      return uploadResult.images.map((img: any, index: number) => ({
        imageId: img.id,
        imageUrl: img.imageUrl || img.url,
        isMainImage: index === 0,
      }));
    } catch (error: unknown) {
      if (error instanceof BaseError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      throw new BaseError(ErrorCode.EXTERNAL_SERVICE_ERROR, `이미지 업로드 실패: ${errorMessage}`, {
        context: { productId, imageCount: images.length },
      });
    }
  }

  /**
   * 상품 옵션 생성
   */
  private async createProductOptions(
    productId: number,
    options: CreateProductRequest['options'],
  ): Promise<number[]> {
    if (!options || options.length === 0) {
      return [];
    }

    try {
      const createdOptions = await productDomainClient.createProductOptions(productId, options);
      return createdOptions.map((option) => option.id);
    } catch (error: unknown) {
      if (error instanceof BaseError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      throw new BaseError(
        ErrorCode.EXTERNAL_SERVICE_ERROR,
        `상품 옵션 생성 실패: ${errorMessage}`,
        { context: { productId, optionCount: options.length } },
      );
    }
  }

  /**
   * 상품 등록 실패 시 롤백 처리
   */
  private async rollbackProductRegistration(
    productId: number | null,
    uploadedImageIds: number[],
    createdOptionIds: number[] = [],
  ): Promise<void> {
    const rollbackErrors: string[] = [];

    // 생성된 옵션들 삭제
    if (productId && createdOptionIds.length > 0) {
      for (const optionId of createdOptionIds) {
        try {
          await productDomainClient.deleteProductOption(optionId);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          rollbackErrors.push(`옵션 삭제 실패 (optionId: ${optionId}): ${errorMessage}`);
        }
      }
    }

    // 업로드된 이미지들 삭제
    if (productId && uploadedImageIds.length > 0) {
      for (const imageId of uploadedImageIds) {
        try {
          await productDomainClient.deleteProductImage(productId, imageId);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          rollbackErrors.push(`이미지 삭제 실패 (imageId: ${imageId}): ${errorMessage}`);
        }
      }
    }

    // 생성된 상품 삭제
    if (productId) {
      try {
        await productDomainClient.deleteProduct(productId);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        rollbackErrors.push(`상품 삭제 실패 (productId: ${productId}): ${errorMessage}`);
      }
    }

    // 롤백 중 에러가 있었다면 로깅
    if (rollbackErrors.length > 0) {
      const rollbackError = new BaseError(
        ErrorCode.INTERNAL_ERROR,
        '롤백 처리 중 일부 작업이 실패했습니다.',
        { context: { errors: rollbackErrors, productId, uploadedImageIds, createdOptionIds } },
      );
      console.error('Rollback Error:', rollbackError.toResponse());
    }
  }

  /**
   * 상품 이미지만 별도 업로드 (기존 상품에 이미지 추가)
   */
  async uploadImagesForProduct(
    productId: number,
    images: File[],
  ): Promise<{ message: string; images: ImageUploadResult[] }> {
    // 유효성 검사
    this.validateProductId(productId);

    if (!images || images.length === 0) {
      throw new ValidationError('업로드할 이미지가 없습니다.', {
        field: 'images',
        reason: 'required',
      });
    }

    if (images.length > 10) {
      throw new ValidationError('이미지는 최대 10개까지 업로드 가능합니다.', {
        field: 'images',
        reason: 'max_count',
      });
    }

    // 이미지 파일 검증 (용량, 포맷 등)
    this.validateImageFiles(images);

    try {
      const uploadResult = await this.uploadProductImages(productId, images);

      return {
        message: '이미지가 성공적으로 업로드되었습니다.',
        images: uploadResult,
      };
    } catch (error: unknown) {
      if (error instanceof BaseError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      throw new BaseError(ErrorCode.EXTERNAL_SERVICE_ERROR, `이미지 업로드 실패: ${errorMessage}`, {
        context: { productId, imageCount: images.length },
      });
    }
  }

  /**
   * 상품 이미지 삭제
   */
  async deleteProductImage(productId: number, imageId: number): Promise<{ message: string }> {
    // 유효성 검사
    this.validateProductId(productId);
    this.validateImageId(imageId);

    try {
      return await productDomainClient.deleteProductImage(productId, imageId);
    } catch (error: unknown) {
      if (error instanceof BaseError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      throw new BaseError(ErrorCode.EXTERNAL_SERVICE_ERROR, `이미지 삭제 실패: ${errorMessage}`, {
        context: { productId, imageId },
      });
    }
  }

  /**
   * 상품 데이터 유효성 검사
   */
  private validateProductData(productData: CreateProductRequest): void {
    // 기본 상품 정보 검증
    this.validateBasicProductInfo(productData);

    // 상품 옵션 검증
    if (productData.options && productData.options.length > 0) {
      this.validateProductOptions(productData.options);
    }

    // 이미지 파일 검증
    if (productData.images && productData.images.length > 0) {
      this.validateImageFiles(productData.images);
    }
  }

  /**
   * 기본 상품 정보 검증
   */
  private validateBasicProductInfo(productData: CreateProductRequest): void {
    if (!productData.name || productData.name.trim() === '') {
      throw new ValidationError('상품명은 필수입니다.', { field: 'name', reason: 'required' });
    }

    if (productData.name.length > 100) {
      throw new ValidationError('상품명은 100자를 초과할 수 없습니다.', {
        field: 'name',
        reason: 'max_length',
      });
    }

    if (!productData.price || productData.price <= 0) {
      throw new ValidationError('가격은 0보다 킀 값이어야 합니다.', {
        field: 'price',
        reason: 'positive_number',
      });
    }

    if (!productData.originalPrice || productData.originalPrice <= 0) {
      throw new ValidationError('원가는 0보다 킀 값이어야 합니다.', {
        field: 'originalPrice',
        reason: 'positive_number',
      });
    }

    if (productData.price > productData.originalPrice) {
      throw new ValidationError('판매가격은 원가보다 높을 수 없습니다.', {
        field: 'price',
        reason: 'price_exceeds_original',
      });
    }

    if (productData.description && productData.description.length > 1000) {
      throw new ValidationError('상품 설명은 1000자를 초과할 수 없습니다.', {
        field: 'description',
        reason: 'max_length',
      });
    }

    if (productData.images && productData.images.length > 10) {
      throw new ValidationError('이미지는 최대 10개까지 업로드 가능합니다.', {
        field: 'images',
        reason: 'max_count',
      });
    }
  }

  /**
   * 상품 옵션 검증
   */
  private validateProductOptions(options: CreateProductRequest['options']): void {
    if (!options || options.length === 0) {
      return;
    }

    if (options.length > 50) {
      throw new ValidationError('상품 옵션은 최대 50개까지 등록 가능합니다.', {
        field: 'options',
        reason: 'max_count',
      });
    }

    // 각 옵션의 유효성 검사
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      const optionIndex = i + 1;

      if (!option.optionType || option.optionType.trim() === '') {
        throw new ValidationError(`옵션 ${optionIndex}: 옵션 유형은 필수입니다.`, {
          field: `options[${i}].optionType`,
          reason: 'required',
        });
      }

      if (!option.optionName || option.optionName.trim() === '') {
        throw new ValidationError(`옵션 ${optionIndex}: 옵션명은 필수입니다.`, {
          field: `options[${i}].optionName`,
          reason: 'required',
        });
      }

      if (!option.optionValue || option.optionValue.trim() === '') {
        throw new ValidationError(`옵션 ${optionIndex}: 옵션값은 필수입니다.`, {
          field: `options[${i}].optionValue`,
          reason: 'required',
        });
      }

      if (option.optionName.length > 100) {
        throw new ValidationError(`옵션 ${optionIndex}: 옵션명은 100자를 초과할 수 없습니다.`, {
          field: `options[${i}].optionName`,
          reason: 'max_length',
        });
      }

      if (option.optionValue.length > 100) {
        throw new ValidationError(`옵션 ${optionIndex}: 옵션값은 100자를 초과할 수 없습니다.`, {
          field: `options[${i}].optionValue`,
          reason: 'max_length',
        });
      }

      if (option.additionalPrice !== undefined && option.additionalPrice < 0) {
        throw new ValidationError(`옵션 ${optionIndex}: 추가 가격은 0 이상이어야 합니다.`, {
          field: `options[${i}].additionalPrice`,
          reason: 'negative_value',
        });
      }

      if (option.stock !== undefined && option.stock < 0) {
        throw new ValidationError(`옵션 ${optionIndex}: 재고는 0 이상이어야 합니다.`, {
          field: `options[${i}].stock`,
          reason: 'negative_value',
        });
      }

      if (option.sku && option.sku.length > 100) {
        throw new ValidationError(`옵션 ${optionIndex}: SKU는 100자를 초과할 수 없습니다.`, {
          field: `options[${i}].sku`,
          reason: 'max_length',
        });
      }
    }

    // 중복 옵션 체크
    const optionKeys = options.map((opt) => `${opt.optionType}:${opt.optionValue}`);
    const duplicates = optionKeys.filter((key, index) => optionKeys.indexOf(key) !== index);

    if (duplicates.length > 0) {
      throw new ValidationError(
        '중복된 옵션이 있습니다. 같은 유형의 같은 값을 가진 옵션은 한 번만 등록할 수 있습니다.',
        { field: 'options', reason: 'duplicate_options' },
      );
    }
  }

  /**
   * 상품 ID 유효성 검사
   */
  private validateProductId(productId: number): void {
    if (!productId || productId <= 0) {
      throw new ValidationError('유효하지 않은 상품 ID입니다.', {
        field: 'productId',
        reason: 'invalid',
      });
    }
  }

  /**
   * 이미지 ID 유효성 검사
   */
  private validateImageId(imageId: number): void {
    if (!imageId || imageId <= 0) {
      throw new ValidationError('유효하지 않은 이미지 ID입니다.', {
        field: 'imageId',
        reason: 'invalid',
      });
    }
  }

  /**
   * 이미지 파일 유효성 검사 (용량, 포맷 등)
   */
  private validateImageFiles(images: File[]): void {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    for (let i = 0; i < images.length; i++) {
      const file = images[i];

      // 파일 크기 검증
      if (file.size > MAX_FILE_SIZE) {
        throw new ValidationError(
          `이미지 파일 크기가 10MB를 초과합니다. (파일: ${file.name}, 크기: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
          {
            field: `images[${i}]`,
            reason: 'file_size_exceeded',
            context: { fileName: file.name, fileSize: file.size, maxSize: MAX_FILE_SIZE },
          },
        );
      }

      // 파일 타입 검증
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new ValidationError(
          `지원하지 않는 이미지 형식입니다. (파일: ${file.name}, 형식: ${file.type})`,
          {
            field: `images[${i}]`,
            reason: 'invalid_file_type',
            context: { fileName: file.name, fileType: file.type, allowedTypes: ALLOWED_TYPES },
          },
        );
      }

      // 파일명 검증
      if (!file.name || file.name.trim() === '') {
        throw new ValidationError('이미지 파일명이 유효하지 않습니다.', {
          field: `images[${i}]`,
          reason: 'invalid_filename',
        });
      }
    }
  }

  /**
   * 상품 옵션 조회
   */
  async getProductOptions(productId: number): Promise<any[]> {
    this.validateProductId(productId);

    try {
      return await productDomainClient.getProductOptions(productId);
    } catch (error: unknown) {
      if (error instanceof BaseError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      throw new BaseError(
        ErrorCode.EXTERNAL_SERVICE_ERROR,
        `상품 옵션 조회 실패: ${errorMessage}`,
        { context: { productId } },
      );
    }
  }

  /**
   * 상품 옵션 수정
   */
  async updateProductOption(
    productId: number,
    optionId: number,
    updateData: any,
  ): Promise<{ message: string }> {
    this.validateProductId(productId);

    if (!optionId || optionId <= 0) {
      throw new ValidationError('유효하지 않은 옵션 ID입니다.', {
        field: 'optionId',
        reason: 'invalid',
      });
    }

    try {
      await productDomainClient.updateProductOption(productId, optionId, updateData);
      return { message: '상품 옵션이 성공적으로 수정되었습니다.' };
    } catch (error: unknown) {
      if (error instanceof BaseError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      throw new BaseError(
        ErrorCode.EXTERNAL_SERVICE_ERROR,
        `상품 옵션 수정 실패: ${errorMessage}`,
        { context: { productId, optionId } },
      );
    }
  }

  /**
   * 상품 옵션 삭제
   */
  async deleteProductOption(productId: number, optionId: number): Promise<{ message: string }> {
    this.validateProductId(productId);

    if (!optionId || optionId <= 0) {
      throw new ValidationError('유효하지 않은 옵션 ID입니다.', {
        field: 'optionId',
        reason: 'invalid',
      });
    }

    try {
      return await productDomainClient.deleteProductOption(optionId);
    } catch (error: unknown) {
      if (error instanceof BaseError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      throw new BaseError(
        ErrorCode.EXTERNAL_SERVICE_ERROR,
        `상품 옵션 삭제 실패: ${errorMessage}`,
        { context: { productId, optionId } },
      );
    }
  }
}

// 싱글톤 인스턴스 생성
const productService = new ProductService();
export default productService;
