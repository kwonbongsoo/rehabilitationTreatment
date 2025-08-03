'use server';

import { redirect } from 'next/navigation';
import { HeaderBuilderFactory } from '@/lib/server/headerBuilder';
import kongApiClient from '@/infrastructure/clients/kongApiClient';
import type { ProductFormData, ProductActionResult } from '../types/product';

export async function createProduct(formData: FormData): Promise<ProductActionResult> {
  try {
    // FormData에서 데이터 추출
    const extractedData = extractFormData(formData);
    
    const productData: ProductFormData = {
      name: extractedData.name,
      description: extractedData.description,
      price: extractedData.price,
      originalPrice: extractedData.originalPrice,
      categoryId: extractedData.categoryId,
      sellerId: extractedData.sellerId,
      stock: extractedData.stock,
      ...(extractedData.sku && { sku: extractedData.sku }),
      ...(extractedData.weight && { weight: extractedData.weight }),
      ...(extractedData.dimensions && { dimensions: extractedData.dimensions }),
      isNew: extractedData.isNew,
      isFeatured: extractedData.isFeatured,
      discountPercentage: extractedData.discountPercentage,
      ...(extractedData.specifications && { specifications: extractedData.specifications }),
      ...(extractedData.options && { options: extractedData.options }),
    };

    console.log('Product data with options:', productData);


    // 파일 추출
    const files = formData.getAll('images') as File[];
    const validFiles = files.filter((file) => file.size > 0);

    // 필수 필드 및 비즈니스 로직 검증
    const validationResult = validateProductData(productData, validFiles.length);
    if (validationResult) {
      return validationResult;
    }

    // 옵션 검증 (options가 있는 경우)
    if (productData.options && productData.options.length > 0) {
      const optionValidationResult = validateProductOptions(productData.options);
      if (optionValidationResult) {
        return optionValidationResult;
      }
    }

    // FormData에서 받은 sellerId 사용

    // multipart/form-data 준비
    const multipartFormData = new FormData();

    // 상품 데이터를 JSON 문자열로 변환하여 추가
    const productPayload = createProductPayload(productData);

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

// FormData에서 모든 데이터를 추출하는 헬퍼 함수
function extractFormData(formData: FormData) {
  // 기본 상품 정보
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = Number(formData.get('price'));
  const originalPrice = Number(formData.get('originalPrice'));
  const categoryId = Number(formData.get('categoryId'));
  const sellerId = formData.get('sellerId') as string;
  const stock = Number(formData.get('stock')) || 0;
  const sku = formData.get('sku') as string | null;
  const weight = formData.get('weight') ? Number(formData.get('weight')) : null;
  const isNew = formData.get('isNew') === 'true';
  const isFeatured = formData.get('isFeatured') === 'true';
  const discountPercentage = Number(formData.get('discountPercentage')) || 0;

  // 치수 정보
  const lengthValue = formData.get('dimensions.length');
  const widthValue = formData.get('dimensions.width');
  const heightValue = formData.get('dimensions.height');
  
  const dimensions = (lengthValue || widthValue || heightValue) ? {
    ...(lengthValue && { length: Number(lengthValue) }),
    ...(widthValue && { width: Number(widthValue) }),
    ...(heightValue && { height: Number(heightValue) }),
  } : null;

  // 사양 정보
  const specKeys = Array.from(formData.keys()).filter(key => key.startsWith('spec_'));
  const specifications = specKeys.length > 0 ? 
    Object.fromEntries(
      specKeys.map(key => [key, formData.get(key) as string]).filter(([, value]) => value?.trim())
    ) : null;

  // 옵션 정보
  const optionsData = formData.get('options') as string;
  const options = optionsData ? JSON.parse(optionsData) : null;

  return {
    name,
    description,
    price,
    originalPrice,
    categoryId,
    sellerId,
    stock,
    sku,
    weight,
    dimensions,
    isNew,
    isFeatured,
    discountPercentage,
    specifications,
    options,
  };
}

// 서버로 전송할 payload 생성
// 서버로 전송할 payload 생성
function createProductPayload(productData: ProductFormData) {
  return {
    name: productData.name,
    description: productData.description,
    price: Number(productData.price),
    originalPrice: Number(productData.originalPrice),
    categoryId: productData.categoryId,
    sellerId: productData.sellerId,
    isNew: productData.isNew,
    isFeatured: productData.isFeatured,
    stock: productData.stock || 0,
    sku: productData.sku || null,
    weight: productData.weight || null,
    dimensions: productData.dimensions || null,
    discountPercentage: productData.discountPercentage || 0,
    specifications: (productData.specifications && Object.keys(productData.specifications).length > 0) 
      ? productData.specifications : null,
    options: (productData.options && productData.options.length > 0) 
      ? productData.options : null,
  };
}

// 상품 데이터 검증
function validateProductData(productData: ProductFormData, imageCount: number): ProductActionResult | null {
  if (!productData.name?.trim()) {
    return { success: false, errors: { name: '상품명을 입력해주세요.' } };
  }
  if (!productData.description?.trim()) {
    return { success: false, errors: { description: '상품 설명을 입력해주세요.' } };
  }
  if (!productData.categoryId || productData.categoryId <= 0) {
    return { success: false, errors: { categoryId: '올바른 카테고리를 선택해주세요.' } };
  }
  if (!productData.sellerId?.trim()) {
    return { success: false, errors: { sellerId: '판매자 ID가 누락되었습니다.' } };
  }
  if (!productData.price || isNaN(Number(productData.price)) || Number(productData.price) <= 0) {
    return { success: false, errors: { price: '올바른 가격을 입력해주세요.' } };
  }
  if (!productData.originalPrice || isNaN(Number(productData.originalPrice)) || Number(productData.originalPrice) <= 0) {
    return { success: false, errors: { originalPrice: '올바른 원가를 입력해주세요.' } };
  }
  if (Number(productData.price) > Number(productData.originalPrice)) {
    return { success: false, errors: { price: '판매가격은 원가보다 높을 수 없습니다.' } };
  }
  if (imageCount === 0) {
    return { success: false, errors: { images: '최소 1개의 상품 이미지를 업로드해주세요.' } };
  }
  return null;
}

// 상품 옵션 검증
function validateProductOptions(options: any[]): ProductActionResult | null {
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    const optionIndex = i + 1;

    if (!option.optionType?.trim()) {
      return { success: false, errors: { options: `옵션 ${optionIndex}: 옵션 유형을 선택해주세요.` } };
    }
    if (!option.optionName?.trim()) {
      return { success: false, errors: { options: `옵션 ${optionIndex}: 옵션명을 입력해주세요.` } };
    }
    if (!option.optionValue?.trim()) {
      return { success: false, errors: { options: `옵션 ${optionIndex}: 옵션값을 입력해주세요.` } };
    }
    if (option.additionalPrice < 0) {
      return { success: false, errors: { options: `옵션 ${optionIndex}: 추가 가격은 0 이상이어야 합니다.` } };
    }
    if (option.stock < 0) {
      return { success: false, errors: { options: `옵션 ${optionIndex}: 재고는 0 이상이어야 합니다.` } };
    }
  }

  // 중복 옵션 체크
  const optionKeys = options.map(opt => `${opt.optionType}:${opt.optionValue}`);
  const duplicates = optionKeys.filter((key, index) => optionKeys.indexOf(key) !== index);
  
  if (duplicates.length > 0) {
    return { success: false, errors: { options: '중복된 옵션이 있습니다. 같은 유형의 같은 값을 가진 옵션은 한 번만 등록할 수 있습니다.' } };
  }

  return null;
}
