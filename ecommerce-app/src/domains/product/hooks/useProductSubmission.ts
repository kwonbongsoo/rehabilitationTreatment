import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/domains/auth/stores/useAuthStore';
import { createProduct } from '@/domains/product/services';
import { validateForm } from '@/domains/product/utils/productValidation';
import type { ProductSubmissionData, ProductActionResult } from '@/domains/product/types/product';
import { v4 as uuidv4 } from 'uuid';

interface UseProductSubmissionReturn {
  isSubmitting: boolean;
  handleSubmit: (data: ProductSubmissionData) => Promise<void>;
  idempotencyKey: string;
}

export function useProductSubmission(): UseProductSubmissionReturn {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const idempotencyKeyRef = useRef<string>(uuidv4());

  const handleSubmit = useCallback(
    async (data: ProductSubmissionData): Promise<void> => {
      setIsSubmitting(true);

      try {
        // 폼 데이터 검증
        const validationError = validateForm(data);
        if (validationError) {
          alert(validationError);
          return;
        }

        // 사용자 인증 확인
        if (!user?.id) {
          alert('로그인이 필요합니다.');
          return;
        }

        // FormData 생성
        const formDataToSend = createFormDataForSubmission(
          data,
          user.id,
          idempotencyKeyRef.current,
        );

        console.log('user', user);
        console.log('formDataToSend', data);

        // Server Action 호출
        const result = await createProduct(formDataToSend);

        if (!result.success) {
          handleSubmissionError(result);
          return;
        }

        // 성공 시 새로운 idempotency key 생성
        idempotencyKeyRef.current = uuidv4();
      } catch (error) {
        console.error('상품 등록 실패:', error);
        handleUnexpectedError(error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [user],
  );

  // 서버 에러 처리
  const handleSubmissionError = (result: ProductActionResult) => {
    if (result.errors) {
      // 첫 번째 에러 필드로 스크롤
      const firstErrorField = Object.keys(result.errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
        element?.focus();
      }
      // 에러를 상위 컴포넌트에서 처리하도록 던짐
      throw new Error(JSON.stringify(result.errors));
    } else {
      alert(result.message || '상품 등록에 실패했습니다.');
    }
  };

  // 예상치 못한 에러 처리
  const handleUnexpectedError = (error: unknown) => {
    const errorMessage =
      error instanceof Error ? error.message : '상품 등록 중 오류가 발생했습니다.';
    alert(`${errorMessage} 다시 시도해주세요.`);
  };

  return {
    isSubmitting,
    handleSubmit,
    idempotencyKey: idempotencyKeyRef.current,
  };
}

// FormData 생성 헬퍼 함수
function createFormDataForSubmission(
  formData: ProductSubmissionData,
  sellerId: string,
  idempotencyKey: string,
): FormData {
  const formDataToSend = new FormData();

  // 기본 상품 정보
  formDataToSend.append('name', formData.name);
  formDataToSend.append('description', formData.description);
  formDataToSend.append('price', formData.price.toString());
  formDataToSend.append('originalPrice', formData.originalPrice.toString());
  formDataToSend.append('categoryId', formData.categoryId.toString());
  formDataToSend.append('sellerId', sellerId);
  formDataToSend.append('stock', (formData.stock || 0).toString());
  formDataToSend.append('isNew', formData.isNew.toString());
  formDataToSend.append('isFeatured', formData.isFeatured.toString());
  formDataToSend.append('discountPercentage', (formData.discountPercentage || 0).toString());

  // 선택적 정보
  if (formData.sku) formDataToSend.append('sku', formData.sku);
  if (formData.weight) formDataToSend.append('weight', formData.weight.toString());

  // 치수 정보
  if (formData.dimensions?.length) {
    formDataToSend.append('dimensions.length', formData.dimensions.length.toString());
  }
  if (formData.dimensions?.width) {
    formDataToSend.append('dimensions.width', formData.dimensions.width.toString());
  }
  if (formData.dimensions?.height) {
    formDataToSend.append('dimensions.height', formData.dimensions.height.toString());
  }

  // 사양 정보
  Object.entries(formData.specifications || {}).forEach(([key, value]) => {
    if (value?.trim()) {
      formDataToSend.append(key, value);
    }
  });

  // 옵션 데이터
  if (formData.options && formData.options.length > 0) {
    formDataToSend.append('options', JSON.stringify(formData.options));
  }

  // 이미지 파일들
  formData.images.forEach((image) => {
    formDataToSend.append('images', image);
  });

  // Idempotency Key
  formDataToSend.append('idempotencyKey', idempotencyKey);

  return formDataToSend;
}
