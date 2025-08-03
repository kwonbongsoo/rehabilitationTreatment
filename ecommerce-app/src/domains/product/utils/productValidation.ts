import type { ProductFormData, ProductOption } from '@/domains/product/types/product';

interface ProductFormWithImages extends ProductFormData {
  images: File[];
}

export const validateField = (name: string, value: string | boolean): string => {
  switch (name) {
    case 'name':
      if (!value || typeof value !== 'string') return '상품명을 입력해주세요.';
      if (value.trim().length < 2) return '상품명은 2글자 이상 입력해주세요.';
      if (value.trim().length > 100) return '상품명은 100글자 이하로 입력해주세요.';
      break;

    case 'description':
      if (!value || typeof value !== 'string') return '상품 설명을 입력해주세요.';
      if (value.trim().length < 10) return '상품 설명은 10글자 이상 입력해주세요.';
      if (value.trim().length > 1000) return '상품 설명은 1000글자 이하로 입력해주세요.';
      break;

    case 'price':
    case 'originalPrice': {
      if (!value || typeof value !== 'string') return '가격을 입력해주세요.';
      const price = parseFloat(value);
      if (isNaN(price) || price <= 0) return '0보다 큰 숫자를 입력해주세요.';
      if (price > 10000000) return '1천만원 이하로 입력해주세요.';
      break;
    }

    case 'stock': {
      if (value && typeof value === 'string') {
        const stock = parseInt(value);
        if (isNaN(stock) || stock < 0) return '0 이상의 숫자를 입력해주세요.';
        if (stock > 999999) return '999,999개 이하로 입력해주세요.';
      }
      break;
    }

    case 'weight': {
      if (value && typeof value === 'string') {
        const weight = parseFloat(value);
        if (isNaN(weight) || weight < 0) return '0 이상의 숫자를 입력해주세요.';
        if (weight > 10000) return '10,000kg 이하로 입력해주세요.';
      }
      break;
    }

    case 'sku':
      if (value && typeof value === 'string' && value.trim().length > 50) {
        return 'SKU는 50글자 이하로 입력해주세요.';
      }
      break;

    case 'discountPercentage': {
      if (value && typeof value === 'string') {
        const percent = parseFloat(value);
        if (isNaN(percent) || percent < 0 || percent > 100) {
          return '0~100 사이의 숫자를 입력해주세요.';
        }
      }
      break;
    }
  }
  return '';
};

export const validateForm = (formData: ProductFormWithImages): string | null => {
  // 필수 필드 검증
  if (!formData.name.trim()) {
    return '상품명을 입력해주세요.';
  }
  if (formData.name.trim().length < 2) {
    return '상품명은 2글자 이상 입력해주세요.';
  }
  if (formData.name.trim().length > 100) {
    return '상품명은 100글자 이하로 입력해주세요.';
  }

  if (!formData.description.trim()) {
    return '상품 설명을 입력해주세요.';
  }
  if (formData.description.trim().length < 10) {
    return '상품 설명은 10글자 이상 입력해주세요.';
  }
  if (formData.description.trim().length > 1000) {
    return '상품 설명은 1000글자 이하로 입력해주세요.';
  }

  if (!formData.categoryId) {
    return '카테고리를 선택해주세요.';
  }

  // 가격 검증
  const price = Number(formData.price);
  const originalPrice = Number(formData.originalPrice);

  if (!formData.price || isNaN(price) || price <= 0) {
    return '올바른 판매가격을 입력해주세요. (0보다 큰 숫자)';
  }
  if (price > 10000000) {
    return '판매가격은 1천만원 이하로 입력해주세요.';
  }

  if (!formData.originalPrice || isNaN(originalPrice) || originalPrice <= 0) {
    return '올바른 원가를 입력해주세요. (0보다 큰 숫자)';
  }
  if (originalPrice > 10000000) {
    return '원가는 1천만원 이하로 입력해주세요.';
  }

  if (price > originalPrice) {
    return '판매가격은 원가보다 높을 수 없습니다.';
  }

  // 선택적 필드 검증
  if (formData.stock && (isNaN(Number(formData.stock)) || Number(formData.stock) < 0)) {
    return '재고는 0 이상의 숫자로 입력해주세요.';
  }
  if (formData.stock && Number(formData.stock) > 999999) {
    return '재고는 999,999개 이하로 입력해주세요.';
  }

  if (formData.weight) {
    const weight = Number(formData.weight);
    if (isNaN(weight) || weight < 0) {
      return '무게는 0 이상의 숫자로 입력해주세요.';
    }
    if (weight > 10000) {
      return '무게는 10,000kg 이하로 입력해주세요.';
    }
  }

  if (formData.discountPercentage) {
    const discountPercent = Number(formData.discountPercentage);
    if (isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100) {
      return '할인율은 0~100 사이의 숫자로 입력해주세요.';
    }
  }

  // 치수 검증
  if (formData.dimensions) {
    const { length, width, height } = formData.dimensions;
    if (length || width || height) {
      const lengthNum = Number(length);
      const widthNum = Number(width);
      const heightNum = Number(height);

      if (length && (isNaN(lengthNum) || lengthNum <= 0)) {
        return '길이는 0보다 큰 숫자로 입력해주세요.';
      }
      if (width && (isNaN(widthNum) || widthNum <= 0)) {
        return '너비는 0보다 큰 숫자로 입력해주세요.';
      }
      if (height && (isNaN(heightNum) || heightNum <= 0)) {
        return '높이는 0보다 큰 숫자로 입력해주세요.';
      }

      if (lengthNum > 10000 || widthNum > 10000 || heightNum > 10000) {
        return '치수는 각각 10,000cm 이하로 입력해주세요.';
      }
    }
  }

  // SKU 검증
  if (formData.sku && formData.sku.trim().length > 50) {
    return 'SKU는 50글자 이하로 입력해주세요.';
  }

  // 이미지 검증
  if (formData.images.length === 0) {
    return '최소 1개의 상품 이미지를 업로드해주세요.';
  }

  // 사양 검증
  if (formData.specifications) {
    const specs = Object.entries(formData.specifications);
    for (const [key, value] of specs) {
      const specName = key.replace('spec_', '').trim();
      if (!specName) {
        return '사양 이름을 입력해주세요.';
      }
      if (!value.trim()) {
        return `"${specName}" 사양의 값을 입력해주세요.`;
      }
      if (specName.length > 50) {
        return '사양 이름은 50글자 이하로 입력해주세요.';
      }
      if (value.length > 200) {
        return '사양 값은 200글자 이하로 입력해주세요.';
      }
    }
  }

  // 옵션 검증
  if (formData.options && formData.options.length > 0) {
    for (let i = 0; i < formData.options.length; i++) {
      const option = formData.options[i];
      if (!option) continue;
      
      const optionIndex = i + 1;

      if (!option.optionType.trim()) {
        return `옵션 ${optionIndex}: 옵션 유형을 선택해주세요.`;
      }

      if (!option.optionName.trim()) {
        return `옵션 ${optionIndex}: 옵션명을 입력해주세요.`;
      }

      if (option.optionName.trim().length > 100) {
        return `옵션 ${optionIndex}: 옵션명은 100글자 이하로 입력해주세요.`;
      }

      if (!option.optionValue.trim()) {
        return `옵션 ${optionIndex}: 옵션값을 입력해주세요.`;
      }

      if (option.optionValue.trim().length > 100) {
        return `옵션 ${optionIndex}: 옵션값은 100글자 이하로 입력해주세요.`;
      }

      if (option.additionalPrice < 0) {
        return `옵션 ${optionIndex}: 추가 가격은 0 이상이어야 합니다.`;
      }

      if (option.additionalPrice > 10000000) {
        return `옵션 ${optionIndex}: 추가 가격은 1천만원 이하로 입력해주세요.`;
      }

      if (option.stock < 0) {
        return `옵션 ${optionIndex}: 재고는 0 이상이어야 합니다.`;
      }

      if (option.stock > 999999) {
        return `옵션 ${optionIndex}: 재고는 999,999개 이하로 입력해주세요.`;
      }

      if (option.sku && option.sku.trim().length > 100) {
        return `옵션 ${optionIndex}: SKU는 100글자 이하로 입력해주세요.`;
      }
    }

    // 중복 옵션 체크 (같은 optionType + optionValue 조합)
    const optionKeys = formData.options.map(opt => `${opt.optionType}:${opt.optionValue}`);
    const duplicates = optionKeys.filter((key, index) => optionKeys.indexOf(key) !== index);
    
    if (duplicates.length > 0) {
      return '중복된 옵션이 있습니다. 같은 유형의 같은 값을 가진 옵션은 한 번만 등록할 수 있습니다.';
    }
  }

  return null; // 검증 통과
};