import { BaseError, ErrorCode, ValidationError } from '@ecommerce/common';
import { CreateProductRequest, CreateProductOptionRequest } from '../types/productTypes';

interface ValidationRule<T> {
  validate(value: T): ValidationResult;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

interface ProductValidationConfig {
  name: {
    maxLength: number;
    required: boolean;
  };
  description: {
    maxLength: number;
    required: boolean;
  };
  price: {
    min: number;
    required: boolean;
  };
  originalPrice: {
    min: number;
    required: boolean;
  };
  images: {
    maxCount: number;
    maxFileSize: number;
    allowedTypes: readonly string[];
    required: boolean;
  };
  options: {
    maxCount: number;
    name: { maxLength: number };
    value: { maxLength: number };
    sku: { maxLength: number };
  };
}

export class ProductValidator {
  private readonly config: ProductValidationConfig;

  constructor(config?: Partial<ProductValidationConfig>) {
    this.config = {
      name: {
        maxLength: 200,
        required: true,
        ...config?.name,
      },
      description: {
        maxLength: 2000,
        required: true,
        ...config?.description,
      },
      price: {
        min: 0,
        required: true,
        ...config?.price,
      },
      originalPrice: {
        min: 0,
        required: true,
        ...config?.originalPrice,
      },
      images: {
        maxCount: 5,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
          'image/avif',
        ],
        required: true,
        ...config?.images,
      },
      options: {
        maxCount: 50,
        name: { maxLength: 100 },
        value: { maxLength: 100 },
        sku: { maxLength: 100 },
        ...config?.options,
      },
    };
  }

  validate(productData: CreateProductRequest): ValidationResult {
    const errors: ValidationError[] = [];

    // 기본 필드 검증
    errors.push(...this.validateBasicFields(productData));

    // 비즈니스 로직 검증
    errors.push(...this.validateBusinessRules(productData));

    // 이미지 검증
    if (productData.images) {
      errors.push(...this.validateImages(productData.images));
    }

    // 옵션 검증
    if (productData.options) {
      errors.push(...this.validateOptions(productData.options));
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateAndThrow(productData: CreateProductRequest): void {
    const result = this.validate(productData);

    if (!result.isValid) {
      const errorMessages = result.errors.map((e) => e.message).join(' | ');
      throw new ValidationError(`상품 검증 실패: ${errorMessages}`, {
        field: 'productData',
        reason: 'validation_failed',
        context: { errors: result.errors },
      });
    }
  }

  private validateBasicFields(data: CreateProductRequest): ValidationError[] {
    const errors: ValidationError[] = [];

    // 상품명 검증
    if (this.config.name.required && (!data.name || data.name.trim() === '')) {
      errors.push(
        new ValidationError('상품명은 필수입니다.', {
          field: 'name',
          reason: 'required',
        }),
      );
    }

    if (data.name && data.name.length > this.config.name.maxLength) {
      errors.push(
        new ValidationError(`상품명은 ${this.config.name.maxLength}자를 초과할 수 없습니다.`, {
          field: 'name',
          reason: 'max_length',
          context: {
            current: data.name.length,
            max: this.config.name.maxLength,
          },
        }),
      );
    }

    // 상품 설명 검증
    if (this.config.description.required && (!data.description || data.description.trim() === '')) {
      errors.push(
        new ValidationError('상품 설명은 필수입니다.', {
          field: 'description',
          reason: 'required',
        }),
      );
    }

    if (data.description && data.description.length > this.config.description.maxLength) {
      errors.push(
        new ValidationError(
          `상품 설명은 ${this.config.description.maxLength}자를 초과할 수 없습니다.`,
          {
            field: 'description',
            reason: 'max_length',
            context: {
              current: data.description.length,
              max: this.config.description.maxLength,
            },
          },
        ),
      );
    }

    // 판매자 ID 검증
    if (!data.sellerId || data.sellerId.trim() === '') {
      errors.push(
        new ValidationError('판매자 ID는 필수입니다.', {
          field: 'sellerId',
          reason: 'required',
        }),
      );
    }

    // 가격 검증
    if (this.config.price.required && (!data.price || data.price <= this.config.price.min)) {
      errors.push(
        new ValidationError('가격은 0보다 커야 합니다.', {
          field: 'price',
          reason: 'positive_number',
        }),
      );
    }

    // 원가 검증
    if (
      this.config.originalPrice.required &&
      (!data.originalPrice || data.originalPrice <= this.config.originalPrice.min)
    ) {
      errors.push(
        new ValidationError('원가는 0보다 커야 합니다.', {
          field: 'originalPrice',
          reason: 'positive_number',
        }),
      );
    }

    // 카테고리 ID 검증
    if (!data.categoryId || data.categoryId <= 0) {
      errors.push(
        new ValidationError('올바른 카테고리를 선택해주세요.', {
          field: 'categoryId',
          reason: 'invalid',
        }),
      );
    }

    return errors;
  }

  private validateBusinessRules(data: CreateProductRequest): ValidationError[] {
    const errors: ValidationError[] = [];

    // 가격 vs 원가 검증
    if (data.price && data.originalPrice && data.price > data.originalPrice) {
      errors.push(
        new ValidationError('판매가격은 원가보다 높을 수 없습니다.', {
          field: 'price',
          reason: 'price_exceeds_original',
          context: {
            price: data.price,
            originalPrice: data.originalPrice,
          },
        }),
      );
    }

    // 할인율 검증
    if (data.discountPercentage !== undefined) {
      if (data.discountPercentage < 0 || data.discountPercentage > 100) {
        errors.push(
          new ValidationError('할인율은 0%에서 100% 사이여야 합니다.', {
            field: 'discountPercentage',
            reason: 'out_of_range',
            context: {
              value: data.discountPercentage,
              min: 0,
              max: 100,
            },
          }),
        );
      }
    }

    // 재고 검증
    if (data.stock !== undefined && data.stock < 0) {
      errors.push(
        new ValidationError('재고는 0 이상이어야 합니다.', {
          field: 'stock',
          reason: 'negative_value',
        }),
      );
    }

    // 무게 검증
    if (data.weight !== undefined && data.weight < 0) {
      errors.push(
        new ValidationError('무게는 0 이상이어야 합니다.', {
          field: 'weight',
          reason: 'negative_value',
        }),
      );
    }

    return errors;
  }

  private validateImages(images: File[]): ValidationError[] {
    const errors: ValidationError[] = [];

    if (this.config.images.required && images.length === 0) {
      errors.push(
        new ValidationError('최소 1개의 상품 이미지가 필요합니다.', {
          field: 'images',
          reason: 'required',
        }),
      );
    }

    if (images.length > this.config.images.maxCount) {
      errors.push(
        new ValidationError(
          `상품 이미지는 최대 ${this.config.images.maxCount}개까지 업로드 가능합니다.`,
          {
            field: 'images',
            reason: 'max_count_exceeded',
            context: {
              current: images.length,
              max: this.config.images.maxCount,
            },
          },
        ),
      );
    }

    // 각 이미지 파일 검증
    images.forEach((file, index) => {
      if (file.size > this.config.images.maxFileSize) {
        const maxSizeMB = this.config.images.maxFileSize / (1024 * 1024);
        errors.push(
          new ValidationError(
            `이미지 파일 크기가 ${maxSizeMB}MB를 초과합니다. (파일: ${file.name})`,
            {
              field: `images[${index}]`,
              reason: 'file_size_exceeded',
              context: {
                fileName: file.name,
                size: file.size,
                maxSize: this.config.images.maxFileSize,
              },
            },
          ),
        );
      }

      if (!this.config.images.allowedTypes.includes(file.type)) {
        errors.push(
          new ValidationError(
            `지원하지 않는 이미지 형식입니다. (파일: ${file.name}, 형식: ${file.type})`,
            {
              field: `images[${index}]`,
              reason: 'invalid_file_type',
              context: {
                fileName: file.name,
                fileType: file.type,
                allowedTypes: this.config.images.allowedTypes,
              },
            },
          ),
        );
      }

      if (!file.name || file.name.trim() === '') {
        errors.push(
          new ValidationError('이미지 파일명이 유효하지 않습니다.', {
            field: `images[${index}]`,
            reason: 'invalid_filename',
          }),
        );
      }
    });

    return errors;
  }

  private validateOptions(options: CreateProductOptionRequest[]): ValidationError[] {
    const errors: ValidationError[] = [];

    if (options.length > this.config.options.maxCount) {
      errors.push(
        new ValidationError(
          `상품 옵션은 최대 ${this.config.options.maxCount}개까지 등록 가능합니다.`,
          {
            field: 'options',
            reason: 'max_count_exceeded',
            context: {
              current: options.length,
              max: this.config.options.maxCount,
            },
          },
        ),
      );
    }

    // 개별 옵션 검증
    options.forEach((option, index) => {
      const optionErrors = this.validateSingleOption(option, index);
      errors.push(...optionErrors);
    });

    // 중복 옵션 검증
    const duplicateErrors = this.validateDuplicateOptions(options);
    errors.push(...duplicateErrors);

    return errors;
  }

  private validateSingleOption(
    option: CreateProductOptionRequest,
    index: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    const optionLabel = `옵션 ${index + 1}`;

    if (!option.optionType || option.optionType.trim() === '') {
      errors.push(
        new ValidationError(`${optionLabel}: 옵션 유형은 필수입니다.`, {
          field: `options[${index}].optionType`,
          reason: 'required',
        }),
      );
    }

    if (!option.optionName || option.optionName.trim() === '') {
      errors.push(
        new ValidationError(`${optionLabel}: 옵션명은 필수입니다.`, {
          field: `options[${index}].optionName`,
          reason: 'required',
        }),
      );
    }

    if (!option.optionValue || option.optionValue.trim() === '') {
      errors.push(
        new ValidationError(`${optionLabel}: 옵션값은 필수입니다.`, {
          field: `options[${index}].optionValue`,
          reason: 'required',
        }),
      );
    }

    if (option.optionName && option.optionName.length > this.config.options.name.maxLength) {
      errors.push(
        new ValidationError(
          `${optionLabel}: 옵션명은 ${this.config.options.name.maxLength}자를 초과할 수 없습니다.`,
          {
            field: `options[${index}].optionName`,
            reason: 'max_length',
          },
        ),
      );
    }

    if (option.optionValue && option.optionValue.length > this.config.options.value.maxLength) {
      errors.push(
        new ValidationError(
          `${optionLabel}: 옵션값은 ${this.config.options.value.maxLength}자를 초과할 수 없습니다.`,
          {
            field: `options[${index}].optionValue`,
            reason: 'max_length',
          },
        ),
      );
    }

    if (option.additionalPrice !== undefined && option.additionalPrice < 0) {
      errors.push(
        new ValidationError(`${optionLabel}: 추가 가격은 0 이상이어야 합니다.`, {
          field: `options[${index}].additionalPrice`,
          reason: 'negative_value',
        }),
      );
    }

    if (option.stock !== undefined && option.stock < 0) {
      errors.push(
        new ValidationError(`${optionLabel}: 재고는 0 이상이어야 합니다.`, {
          field: `options[${index}].stock`,
          reason: 'negative_value',
        }),
      );
    }

    if (option.sku && option.sku.length > this.config.options.sku.maxLength) {
      errors.push(
        new ValidationError(
          `${optionLabel}: SKU는 ${this.config.options.sku.maxLength}자를 초과할 수 없습니다.`,
          {
            field: `options[${index}].sku`,
            reason: 'max_length',
          },
        ),
      );
    }

    return errors;
  }

  private validateDuplicateOptions(options: CreateProductOptionRequest[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const optionKeys = new Set<string>();

    options.forEach((option, index) => {
      const key = `${option.optionType}:${option.optionValue}`;

      if (optionKeys.has(key)) {
        errors.push(
          new ValidationError(
            '중복된 옵션이 있습니다. 같은 유형의 같은 값을 가진 옵션은 한 번만 등록할 수 있습니다.',
            {
              field: `options[${index}]`,
              reason: 'duplicate_option',
              context: {
                duplicateKey: key,
                optionType: option.optionType,
                optionValue: option.optionValue,
              },
            },
          ),
        );
      } else {
        optionKeys.add(key);
      }
    });

    return errors;
  }

  validateProductId(productId: number): void {
    if (!productId || productId <= 0) {
      throw new ValidationError('유효하지 않은 상품 ID입니다.', {
        field: 'productId',
        reason: 'invalid',
      });
    }
  }

  validateImageId(imageId: number): void {
    if (!imageId || imageId <= 0) {
      throw new ValidationError('유효하지 않은 이미지 ID입니다.', {
        field: 'imageId',
        reason: 'invalid',
      });
    }
  }

  validateOptionId(optionId: number): void {
    if (!optionId || optionId <= 0) {
      throw new ValidationError('유효하지 않은 옵션 ID입니다.', {
        field: 'optionId',
        reason: 'invalid',
      });
    }
  }
}

// 기본 설정으로 인스턴스 생성
export const productValidator = new ProductValidator();
