'use server';

import { redirect } from 'next/navigation';
import { HeaderBuilderFactory } from '@/lib/server/headerBuilder';
import kongApiClient from '@/infrastructure/clients/kongApiClient';
import type { ProductFormData, ProductActionResult } from '../types/product';

export async function createProduct(formData: FormData): Promise<ProductActionResult> {
  try {
    // FormData에서 데이터 추출
    const productData: ProductFormData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      originalPrice: Number(formData.get('originalPrice')),
      categoryId: getCategoryId(formData.get('category') as string),
      sellerId: formData.get('sellerId') as string,
      stock: Number(formData.get('stock')),
      ...(formData.get('sku') && { sku: formData.get('sku') as string }),
      ...(formData.get('weight') && { weight: Number(formData.get('weight')) }),
      ...(formData.get('dimensions.length') && {
        dimensions: { length: Number(formData.get('dimensions.length')) },
      }),
      ...(formData.get('dimensions.width') && {
        dimensions: { width: Number(formData.get('dimensions.width')) },
      }),
      ...(formData.get('dimensions.height') && {
        dimensions: { height: Number(formData.get('dimensions.height')) },
      }),
      isNew: formData.get('isNew') === 'true',
      isFeatured: formData.get('isFeatured') === 'true',
      discountPercentage: Number(formData.get('discountPercentage')),
      ...(formData.get('specifications') && {
        specifications: JSON.parse(formData.get('specifications') as string),
      }),
    };

    console.log(productData);
    console.log(`>>>>>>>>>>> 여기서부터 상품 옵션 테이블 까지 넣어야함.`);

    // specifications 추출
    const specKeys = Array.from(formData.keys()).filter((key) => key.startsWith('spec_'));
    for (const key of specKeys) {
      const value = formData.get(key) as string;
      if (value && value.trim() && productData.specifications) {
        productData.specifications[key] = value;
      }
    }

    // 파일 추출
    const files = formData.getAll('images') as File[];
    const validFiles = files.filter((file) => file.size > 0);

    // 필수 필드 검증
    if (!productData.name?.trim()) {
      return { success: false, errors: { name: '상품명을 입력해주세요.' } };
    }
    if (!productData.description?.trim()) {
      return { success: false, errors: { description: '상품 설명을 입력해주세요.' } };
    }
    if (!productData.categoryId) {
      return { success: false, errors: { category: '카테고리를 선택해주세요.' } };
    }
    if (!productData.sellerId?.trim()) {
      return { success: false, errors: { sellerId: '판매자 ID가 누락되었습니다.' } };
    }
    if (!productData.price || isNaN(Number(productData.price)) || Number(productData.price) <= 0) {
      return { success: false, errors: { price: '올바른 가격을 입력해주세요.' } };
    }
    if (
      !productData.originalPrice ||
      isNaN(Number(productData.originalPrice)) ||
      Number(productData.originalPrice) <= 0
    ) {
      return { success: false, errors: { originalPrice: '올바른 원가를 입력해주세요.' } };
    }
    if (validFiles.length === 0) {
      return { success: false, errors: { images: '최소 1개의 상품 이미지를 업로드해주세요.' } };
    }

    // FormData에서 받은 sellerId 사용

    // multipart/form-data 준비
    const multipartFormData = new FormData();

    // 상품 데이터를 JSON 문자열로 변환하여 추가
    const productPayload = {
      name: productData.name,
      description: productData.description,
      price: Number(productData.price),
      originalPrice: Number(productData.originalPrice),
      categoryId: productData.categoryId, // 카테고리 문자열을 ID로 변환
      sellerId: productData.sellerId,
      isNew: productData.isNew,
      isFeatured: productData.isFeatured,
      stock: productData.stock ? Number(productData.stock) : 0, // NOT NULL, default 0
      sku: productData.sku || null, // nullable
      weight: productData.weight ? Number(productData.weight) : null, // nullable
      dimensions:
        productData.dimensions &&
        (productData.dimensions.length ||
          productData.dimensions.width ||
          productData.dimensions.height)
          ? {
              length: productData.dimensions.length
                ? Number(productData.dimensions.length)
                : undefined,
              width: productData.dimensions.width
                ? Number(productData.dimensions.width)
                : undefined,
              height: productData.dimensions.height
                ? Number(productData.dimensions.height)
                : undefined,
            }
          : null, // nullable JSON
      discountPercentage: productData.discountPercentage
        ? Number(productData.discountPercentage)
        : 0, // NOT NULL, default 0
      specifications:
        Object.keys(productData.specifications || {}).length > 0
          ? productData.specifications
          : null, // nullable JSON
    };

    multipartFormData.append('productData', JSON.stringify(productPayload));

    // 이미지 파일들 추가
    validFiles.forEach((file) => {
      multipartFormData.append('images', file);
    });

    // 클라이언트에서 전달받은 X-Idempotency-Key 사용
    const idempotencyKey = formData.get('idempotencyKey') as string;
    if (!idempotencyKey) {
      return { success: false, message: 'Idempotency key가 누락되었습니다.' };
    }

    // 헤더 생성 (X-Idempotency-Key 포함)
    const headers = await HeaderBuilderFactory.createForIdempotentRequest(idempotencyKey)
      .withCustomHeader('Content-Type', 'multipart/form-data')
      .build();

    // Content-Type은 브라우저가 자동으로 설정하도록 제거
    delete headers['Content-Type'];

    // BFF API 호출
    const response = await kongApiClient.createProduct(multipartFormData, {
      headers,
    });

    if (response.success) {
      // 성공 시 계정 페이지로 리다이렉트
      redirect('/account?message=상품이 성공적으로 등록되었습니다.');
    } else {
      return {
        success: false,
        message: '상품 등록에 실패했습니다.',
      };
    }
  } catch (error: any) {
    console.error('상품 등록 실패:', error);
    return {
      success: false,
      message: error.message || '상품 등록 중 오류가 발생했습니다.',
    };
  }
}

// 카테고리 문자열을 ID로 변환하는 헬퍼 함수
function getCategoryId(category: string): number {
  const categoryMap: { [key: string]: number } = {
    clothing: 1, // 의류
    shoes: 2, // 신발
    bags: 3, // 가방
    accessories: 4, // 액세서리
    beauty: 5, // 뷰티
    home: 6, // 홈리빙
    digital: 7, // 디지털
    sports: 8, // 스포츠
  };

  return categoryMap[category] || 1; // 기본값은 의류
}
