import productDomainClient from '../clients/productDomainClient';
import {
  CreateProductRequest,
  ProductRegistrationResponse,
  ImageUploadResult,
} from '../types/productTypes';
import { BaseError, ErrorCode } from '@ecommerce/common';
import { productValidator } from '../utils/ProductValidator';

export class ProductService {
  /**
   * 상품 등록 메인 플로우 (2단계)
   * 1. 이미지 업로드
   * 2. 상품 생성 (이미지 URL 포함)
   */
  async registerProduct(productData: CreateProductRequest): Promise<ProductRegistrationResponse> {
    // 입력 유효성 검사
    productValidator.validateAndThrow(productData);

    try {
      let imageUrls: string[] = [];

      // 1단계: 이미지가 있으면 먼저 업로드
      if (productData.images && productData.images.length > 0) {
        imageUrls = await this.uploadImagesOnly(productData.images);
      }

      // 2단계: 상품 데이터 생성 (이미지 URL 포함)
      console.log('🔍 2단계: 상품 생성 시작');
      const { images, ...productDataWithoutImages } = productData;
      const productPayload = this.normalizeProductPayload({
        ...productDataWithoutImages,
        imageUrls,
        mainImage: imageUrls[0],
      } as any);

      // 디버그: 전송 페이로드 타입 맵 출력
      const typeMap: Record<string, string> = {};
      Object.entries(productPayload).forEach(
        ([k, v]) => (typeMap[k] = Array.isArray(v) ? 'array' : typeof v),
      );

      const createdProduct = await productDomainClient.createProduct(productPayload);

      return {
        productId: createdProduct.id,
        imageUrls,
        message: '상품이 성공적으로 등록되었습니다.',
      };
    } catch (error: unknown) {
      if (error instanceof BaseError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      throw new BaseError(
        ErrorCode.EXTERNAL_SERVICE_ERROR,
        `상품 등록 중 오류가 발생했습니다: ${errorMessage}`,
        { context: { productName: productData.name } },
      );
    }
  }

  /**
   * 이미지만 업로드 (상품 생성 전)
   */
  async uploadImagesOnly(images: File[]): Promise<string[]> {
    try {
      const uploadResult = await productDomainClient.uploadImagesOnly(images);
      return uploadResult.imageUrls;
    } catch (error: unknown) {
      if (error instanceof BaseError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      throw new BaseError(ErrorCode.EXTERNAL_SERVICE_ERROR, `이미지 업로드 실패: ${errorMessage}`, {
        context: { imageCount: images.length },
      });
    }
  }

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
   * 상품 이미지만 별도 업로드 (기존 상품에 이미지 추가)
   */
  // TODO: 상품 이미지 업로드 - 미구현
  async uploadImagesForProduct(
    productId: number,
    images: File[],
  ): Promise<{ message: string; images: ImageUploadResult[] }> {
    throw new BaseError(
      ErrorCode.INTERNAL_ERROR,
      '상품 이미지 업로드 기능이 아직 구현되지 않았습니다.',
      { context: { productId, imageCount: images.length } },
    );
  }

  /**
   * 상품 이미지 삭제
   */
  // TODO: 상품 이미지 삭제 - 미구현
  async deleteProductImage(productId: number, imageId: number): Promise<{ message: string }> {
    throw new BaseError(
      ErrorCode.INTERNAL_ERROR,
      '상품 이미지 삭제 기능이 아직 구현되지 않았습니다.',
      { context: { productId, imageId } },
    );
  }

  /**
   * 상품 옵션 조회
   */
  // TODO: 상품 옵션 조회 - 미구현
  async getProductOptions(productId: number): Promise<any[]> {
    throw new BaseError(
      ErrorCode.INTERNAL_ERROR,
      '상품 옵션 조회 기능이 아직 구현되지 않았습니다.',
      { context: { productId } },
    );
  }

  /**
   * 상품 옵션 수정
   */
  // TODO: 상품 옵션 수정 - 미구현
  async updateProductOption(
    productId: number,
    optionId: number,
    updateData: any,
  ): Promise<{ message: string }> {
    throw new BaseError(
      ErrorCode.INTERNAL_ERROR,
      '상품 옵션 수정 기능이 아직 구현되지 않았습니다.',
      { context: { productId, optionId } },
    );
  }

  /**
   * 상품 옵션 삭제
   */
  // TODO: 상품 옵션 삭제 - 미구현
  async deleteProductOption(productId: number, optionId: number): Promise<{ message: string }> {
    throw new BaseError(
      ErrorCode.INTERNAL_ERROR,
      '상품 옵션 삭제 기능이 아직 구현되지 않았습니다.',
      { context: { productId, optionId } },
    );
  }

  /**
   * Product Domain으로 전달하기 전에 타입을 강제 변환/정규화
   */
  private normalizeProductPayload(data: any): any {
    const toNumber = (v: unknown): number | undefined => {
      if (v === undefined || v === null || v === '') return undefined;
      const n = typeof v === 'number' ? v : parseFloat(String(v));
      return Number.isFinite(n) ? n : undefined;
    };

    const toBoolean = (v: unknown): boolean | undefined => {
      if (v === undefined || v === null || v === '') return undefined;
      if (typeof v === 'boolean') return v;
      const s = String(v).toLowerCase();
      if (s === 'true' || s === '1') return true;
      if (s === 'false' || s === '0') return false;
      return undefined;
    };

    const cleaned: Record<string, any> = {
      name: data.name,
      description: data.description,
      price: toNumber(data.price),
      originalPrice: toNumber(data.originalPrice),
      categoryId: toNumber(data.categoryId),
      sellerId: data.sellerId,
      mainImage: data.mainImage ?? undefined,
      rating: toNumber(data.rating),
      averageRating: toNumber(data.averageRating),
      reviewCount: toNumber(data.reviewCount),
      isNew: toBoolean(data.isNew),
      isFeatured: toBoolean(data.isFeatured),
      isActive: toBoolean(data.isActive),
      discount: toNumber(data.discount),
      discountPercentage: toNumber(data.discountPercentage),
      stock: toNumber(data.stock),
      sku: data.sku ?? undefined,
      weight: toNumber(data.weight),
      dimensions: data.dimensions ?? undefined,
      specifications: data.specifications ?? undefined,
      options: Array.isArray(data.options)
        ? data.options.map((opt: any) => ({
            optionType: opt.optionType,
            optionName: opt.optionName,
            optionValue: opt.optionValue,
            additionalPrice: toNumber(opt.additionalPrice),
            stock: toNumber(opt.stock),
            sku: opt.sku ?? undefined,
            sortOrder: toNumber(opt.sortOrder),
          }))
        : undefined,
      imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : undefined,
    };

    // undefined 값 제거 (whitelist 효과 보조)
    Object.keys(cleaned).forEach((k) => cleaned[k] === undefined && delete cleaned[k]);

    return cleaned;
  }
}

const productService = new ProductService();
export default productService;
