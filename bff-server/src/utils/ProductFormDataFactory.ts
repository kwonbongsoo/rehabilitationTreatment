import { CreateProductRequest } from '../types/productTypes';

interface FormDataField {
  key: string;
  value: string | File;
  required?: boolean;
}

export class ProductFormDataFactory {
  static create(productData: CreateProductRequest): FormData {
    const formData = new FormData();
    
    // 기본 필드들 추가
    this.addBasicFields(formData, productData);
    
    // 선택적 필드들 추가
    this.addOptionalFields(formData, productData);
    
    // 복잡한 객체들을 JSON으로 변환하여 추가
    this.addComplexFields(formData, productData);
    
    // 이미지 파일들 추가
    this.addImageFiles(formData, productData);

    return formData;
  }

  private static addBasicFields(formData: FormData, data: CreateProductRequest): void {
    const basicFields: FormDataField[] = [
      { key: 'name', value: data.name, required: true },
      { key: 'description', value: data.description, required: true },
      { key: 'price', value: data.price.toString(), required: true },
      { key: 'originalPrice', value: data.originalPrice.toString(), required: true },
      { key: 'categoryId', value: data.categoryId.toString(), required: true },
      { key: 'sellerId', value: data.sellerId, required: true },
    ];

    basicFields.forEach(field => {
      if (field.required || field.value) {
        formData.append(field.key, field.value as string);
      }
    });
  }

  private static addOptionalFields(formData: FormData, data: CreateProductRequest): void {
    const optionalFields = [
      { key: 'stock', value: data.stock },
      { key: 'sku', value: data.sku },
      { key: 'weight', value: data.weight },
      { key: 'isNew', value: data.isNew },
      { key: 'isFeatured', value: data.isFeatured },
      { key: 'isActive', value: data.isActive },
      { key: 'discountPercentage', value: data.discountPercentage },
      { key: 'discount', value: data.discount },
      { key: 'mainImage', value: data.mainImage },
      { key: 'rating', value: data.rating },
      { key: 'averageRating', value: data.averageRating },
      { key: 'reviewCount', value: data.reviewCount },
    ];

    optionalFields.forEach(field => {
      if (field.value !== undefined && field.value !== null) {
        formData.append(field.key, this.formatFieldValue(field.value));
      }
    });
  }

  private static addComplexFields(formData: FormData, data: CreateProductRequest): void {
    // 치수 정보
    if (data.dimensions) {
      formData.append('dimensions', JSON.stringify(data.dimensions));
    }

    // 사양 정보
    if (data.specifications) {
      formData.append('specifications', JSON.stringify(data.specifications));
    }

    // 옵션 정보
    if (data.options && data.options.length > 0) {
      formData.append('options', JSON.stringify(data.options));
    }
  }

  private static addImageFiles(formData: FormData, data: CreateProductRequest): void {
    if (data.images && data.images.length > 0) {
      data.images.forEach(image => {
        formData.append('images', image);
      });
    }
  }

  private static formatFieldValue(value: any): string {
    if (typeof value === 'boolean') {
      return value.toString();
    }
    
    if (typeof value === 'number') {
      return value.toString();
    }
    
    return String(value);
  }

  static createForImageUpload(productId: number, images: File[]): FormData {
    const formData = new FormData();
    
    images.forEach(image => {
      formData.append('images', image);
    });

    return formData;
  }

  static createForOptionUpdate(options: CreateProductRequest['options']): FormData {
    const formData = new FormData();
    
    if (options && options.length > 0) {
      formData.append('options', JSON.stringify(options));
    }

    return formData;
  }
}